import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAtlas } from '../scripts/build-atlas.mjs';
import { createIdentityResolver, connectivity } from '../scripts/concept-identity.mjs';
import { documentNodes, relationshipEntries } from '../scripts/normalize-source.mjs';
import { aliasGroups } from '../scripts/concept-curation.mjs';

const atlas = await buildAtlas();
const byId = new Map(atlas.nodes.map(node => [node.id, node]));
const resolve = id => byId.has(id) ? id : atlas.aliases[id];

test('explicit semantic aliases unify all reviewed source members', () => {
  for (const group of aliasGroups) {
    // A reviewed group may join a wider same-named concept; its ID then stays as an alias.
    const canonical = byId.get(resolve(group.id));
    assert.ok(canonical, group.id);
    for (const member of group.members) {
      assert.equal(atlas.sourceNodeMap[member], canonical.id);
      assert.ok(canonical.variants.some(variant => variant.sourceKey === member), member);
    }
  }
  for (const [alias, id] of Object.entries({ k8s: 'kubernetes', dependencies: 'dependency', open_shift: 'openshift', freebsd_jails: 'freebsd_jail', 'Docker:namespaces': 'namespaces', 'Containerization:cgroups': 'cgroups', container_portability: 'portability' })) assert.equal(resolve(alias), id);
  assert.ok(byId.get('kubernetes').topics.length >= 6);
  assert.ok(byId.get('virtual_machine').topics.length >= 5);
  // The same concept from different files is one node.
  for (const label of ['C', 'C++', 'Java', 'Python', 'JavaScript', 'Linux', 'Garbage collection']) assert.equal(atlas.nodes.filter(node => node.label === label && node.type !== 'learning_path').length, 1, label);
  assert.equal(resolve('pod'), 'pod');
  assert.notEqual(atlas.sourceNodeMap['Perl:pod'] ?? 'none', 'pod');
});

test('ambiguous and narrower concepts are not conflated', () => {
  for (const ids of [['image', 'container_image'], ['Docker:service', 'Kubernetes:service'], ['Docker:volume', 'Kubernetes:volume'], ['namespaces', 'Kubernetes:namespace'], ['Docker:host', 'virtual_machine:host'], ['docker_swarm', 'swarm', 'swarm_cluster'], ['portability', 'Kubernetes:portability'], ['container', 'pod', 'virtual_machine']]) {
    assert.equal(new Set(ids.map(resolve)).size, ids.length);
    assert.ok(ids.every(id => byId.has(id)));
  }
  assert.equal(atlas.aliases.host, undefined);
  for (const expected of ['Cuda:host','Docker:host','virtual_machine:host']) assert.ok(atlas.ambiguousAliases.host.includes(expected));
});

test('direct meaningful core relations exist with honest provenance', () => {
  for (const [source, target, relation] of [['docker', 'container', 'runs_and_manages'], ['image', 'container_image', 'is_a'], ['container', 'namespaces', 'uses_for_isolation'], ['container', 'cgroups', 'uses_for_resource_limits'], ['virtual_machine', 'container', 'can_host']]) {
    const edge = atlas.edges.find(edge => edge.source === source && edge.target === target && edge.relation === relation);
    assert.ok(edge, source + ' → ' + target);
    assert.equal(edge.curated, true);
    assert.equal(edge.document, 'curated');
    assert.equal(edge.provenance, 'editorial');
    assert.match(edge.record.provenance, /not an original source edge/);
    assert.ok(edge.rationale && edge.evidence.length);
    assert.ok(edge.evidenceUrls.every(url => new URL(url).protocol === 'https:'));
  }
  // Already-recorded useful relationships remain source edges, not editorial duplicates.
  for (const [source, target, relation] of [['kubernetes', 'container', 'orchestrates'], ['pod', 'container', 'contains'], ['container_runtime', 'container', 'runs'], ['image', 'container', 'templates'], ['hypervisor', 'system_vm', 'manages']]) assert.ok(atlas.edges.some(edge => !edge.curated && edge.source === source && edge.target === target && edge.relation === relation));
});

test('every endpoint and learning path remaps through its own source identity', async () => {
  let nodeRecords = 0, edgeRecords = 0;
  const mergedSelfLoops = new Set(atlas.audit.mergedSelfLoops.map(loop => loop.id));
  for (const doc of atlas.documents) {
    const raw = JSON.parse(await readFile(new URL('../data/' + doc.file, import.meta.url)));
    const source = documentNodes(raw);
    nodeRecords += source.nodes.length;
    for (const record of source.nodes) {
      const node = byId.get(atlas.sourceNodeMap[doc.graphId + ':' + record.id]);
      assert.ok(node);
      assert.deepEqual(node.variants.find(variant => variant.sourceKey === doc.graphId + ':' + record.id).record, record);
    }
    const endpoint = (record, ...keys) => keys.map(key => record[key]).find(value => typeof value === 'string' && value.length);
    for (const { record, section, index } of relationshipEntries(raw)) {
      edgeRecords++;
      // A link between two records that merged into one concept is listed in the audit, not drawn as a loop.
      if (mergedSelfLoops.has(doc.graphId + ':' + section + ':' + index)) continue;
      const edge = atlas.edges.find(edge => edge.id === doc.graphId + ':' + section + ':' + index);
      assert.deepEqual(edge.record, record);
      // Endpoints use the same subject/object/from fallbacks as the build.
      assert.equal(edge.source, atlas.sourceNodeMap[doc.graphId + ':' + endpoint(record, 'source', 'subject', 'from')]);
      assert.equal(edge.target, atlas.sourceNodeMap[doc.graphId + ':' + endpoint(record, 'target', 'object', 'to')]);
      assert.equal(edge.provenance, 'source');
    }
    for (const [index, record] of (source.learning_paths || []).entries()) {
      const path = atlas.paths.find(path => path.id === doc.graphId + ':path:' + index);
      assert.deepEqual(path.record, record);
      if (Array.isArray(record.sequence)) assert.deepEqual(path.steps, record.sequence.map(id => atlas.sourceNodeMap[doc.graphId + ':' + id]).filter(Boolean));
      else if (record.ordered_nodes) assert.deepEqual(path.steps, record.ordered_nodes.map(id => atlas.sourceNodeMap[doc.graphId + ':' + id]));
      else if (record.steps) assert.deepEqual(path.steps, record.steps.map(id => atlas.sourceNodeMap[doc.graphId + ":" + id]).filter(Boolean));
      else if (typeof record !== "string") assert.equal(path.sequenceText, record.sequence);
    }
  }
  assert.equal(nodeRecords, atlas.audit.coverage.reduce((sum, item) => sum + item.inputNodes, 0));
  assert.equal(edgeRecords, 19009);
  assert.equal(atlas.edges.filter(edge => !edge.curated).length + mergedSelfLoops.size, edgeRecords);
  assert.ok(atlas.edges.every(edge => byId.has(edge.source) && byId.has(edge.target) && (edge.source !== edge.target || edge.record.source === edge.record.target)));
  assert.equal(new Set(atlas.edges.map(edge => edge.id)).size, atlas.edges.length);
  assert.ok(Object.values(atlas.aliases).every(id => byId.has(id)));
  assert.ok(Object.keys(atlas.aliases).every(id => !byId.has(id)));
});

test('claims and references remain isolated identities even without conventional ID prefixes', () => {
  const documents = ['one', 'two'].map(graph => ({ file: graph + '_full_test.json', data: { nodes: [{ id: 'citation', label: 'Identical reference', type: 'reference' }, { id: 'assertion', label: 'Same claim', type: 'concept' }], source_claims: [{ id: 'assertion', statement: 'Same statement' }], edges: [] } }));
  const identity = createIdentityResolver(documents, [], {});
  for (const { file } of documents) for (const id of ['citation', 'assertion']) assert.equal(identity.resolve(file, id), file.replace(/\.json$/, '') + ':' + id);
  for (const id of ['citation', 'assertion']) assert.throws(() => createIdentityResolver(documents, [{ id, label: id, rationale: 'Unsafe test', members: ['one_full_test:' + id, 'two_full_test:' + id] }], {}), /cannot merge/);
  const protectedNodes = atlas.nodes.filter(node => node.claim || node.variants.some(variant => /^(claim_|ref_)/.test(variant.record.id)));
  assert.ok(protectedNodes.every(node => node.topics.length === 1 && node.variants.length === 1));
});

test('connectivity audit reports disconnected data instead of inventing repairs', () => {
  assert.deepEqual(atlas.audit.connectivity, connectivity(atlas.nodes, atlas.edges));
  // Merging same-named concepts joins more of the map into one component.
  assert.equal(atlas.summary.components, 2238);
  assert.equal(atlas.summary.isolated, 2063);
  assert.equal(atlas.audit.connectivity.componentSizes[0], 10716);
  assert.ok(atlas.audit.sourceOnlyConnectivity.componentCount >= atlas.audit.connectivity.componentCount);
  assert.equal(atlas.audit.sourceClaimRecords, 526);
  assert.deepEqual(atlas.audit.selfLoops, ['Firewall:relationships:133', 'IPv6:relationships:234', 'Next.js:relationships:168', 'OS:relationships:46', 'OS:relationships:55', 'Python:relationships:140', 'asm:relationships:270', 'bitcoin:relationships:88', 'git:relationships:42', 'git:relationships:44']);
});

test('repeated builds are byte-for-byte deterministic including layout and audits', async () => {
  assert.equal(JSON.stringify(await buildAtlas()), JSON.stringify(atlas));
});
