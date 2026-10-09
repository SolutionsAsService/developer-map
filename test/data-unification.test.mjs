import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAtlas } from '../scripts/build-atlas.mjs';
import { createIdentityResolver, connectivity } from '../scripts/concept-identity.mjs';
import { aliasGroups } from '../scripts/concept-curation.mjs';

const atlas = await buildAtlas();
const byId = new Map(atlas.nodes.map(node => [node.id, node]));
const resolve = id => byId.has(id) ? id : atlas.aliases[id];

test('explicit semantic aliases unify all reviewed source members', () => {
  for (const group of aliasGroups) {
    const canonical = byId.get(group.id);
    assert.equal(canonical.label, group.label);
    for (const member of group.members) {
      assert.equal(atlas.sourceNodeMap[member], group.id);
      assert.ok(canonical.variants.some(variant => variant.sourceKey === member), member);
    }
  }
  for (const [alias, id] of Object.entries({ k8s: 'kubernetes', dependencies: 'dependency', open_shift: 'openshift', freebsd_jails: 'freebsd_jail', 'docker:namespaces': 'namespaces', 'containerization:cgroups': 'cgroups', container_portability: 'portability' })) assert.equal(resolve(alias), id);
  assert.equal(byId.get('kubernetes').topics.length, 6);
  assert.equal(byId.get('virtual_machine').topics.length, 5);
});

test('ambiguous and narrower concepts are not conflated', () => {
  for (const ids of [['image', 'container_image'], ['docker:service', 'kubernetes:service'], ['docker:volume', 'kubernetes:volume'], ['namespaces', 'kubernetes:namespace'], ['docker:host', 'virtual_machine:host'], ['docker_swarm', 'swarm', 'swarm_cluster'], ['portability', 'kubernetes:portability'], ['container', 'pod', 'virtual_machine']]) {
    assert.equal(new Set(ids.map(resolve)).size, ids.length);
    assert.ok(ids.every(id => byId.has(id)));
  }
  assert.equal(atlas.aliases.host, undefined);
  for (const expected of ['cuda:host','docker:host','virtual_machine:host']) assert.ok(atlas.ambiguousAliases.host.includes(expected));
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
  for (const doc of atlas.documents) {
    const source = JSON.parse(await readFile(new URL('../data/' + doc.file, import.meta.url)));
    nodeRecords += source.nodes.length;
    for (const record of source.nodes) {
      const node = byId.get(atlas.sourceNodeMap[doc.graphId + ':' + record.id]);
      assert.ok(node);
      assert.deepEqual(node.variants.find(variant => variant.sourceKey === doc.graphId + ':' + record.id).record, record);
    }
    for (const [index, record] of (source.edges || source.relationships).entries()) {
      edgeRecords++;
      const edge = atlas.edges.find(edge => edge.id === doc.graphId + ':' + index);
      assert.deepEqual(edge.record, record);
      assert.equal(edge.source, atlas.sourceNodeMap[doc.graphId + ':' + record.source]);
      assert.equal(edge.target, atlas.sourceNodeMap[doc.graphId + ':' + record.target]);
      assert.equal(edge.provenance, 'source');
    }
    for (const [index, record] of source.learning_paths.entries()) {
      const path = atlas.paths.find(path => path.id === doc.graphId + ':path:' + index);
      assert.deepEqual(path.record, record);
      if (Array.isArray(record.sequence)) assert.deepEqual(path.steps, record.sequence.map(id => atlas.sourceNodeMap[doc.graphId + ':' + id]).filter(Boolean));
      else if (record.ordered_nodes) assert.deepEqual(path.steps, record.ordered_nodes.map(id => atlas.sourceNodeMap[doc.graphId + ':' + id]));
      else if (record.steps) assert.deepEqual(path.steps, record.steps.map(id => atlas.sourceNodeMap[doc.graphId + ":" + id]).filter(Boolean));
      else if (typeof record !== "string") assert.equal(path.sequenceText, record.sequence);
    }
  }
  assert.equal(nodeRecords, 7812);
  assert.equal(edgeRecords, 8560);
  assert.ok(atlas.edges.every(edge => byId.has(edge.source) && byId.has(edge.target) && (edge.source !== edge.target || edge.record.source === edge.record.target)));
  assert.equal(new Set(atlas.edges.map(edge => edge.id)).size, atlas.edges.length);
  assert.ok(Object.values(atlas.aliases).every(id => byId.has(id)));
  assert.ok(Object.keys(atlas.aliases).every(id => !byId.has(id)));
});

test('claims and references remain isolated identities even without conventional ID prefixes', () => {
  const documents = ['one', 'two'].map(graph => ({ file: graph + '_full_test.json', data: { nodes: [{ id: 'citation', label: 'Identical reference', type: 'reference' }, { id: 'assertion', label: 'Same claim', type: 'concept' }], source_claims: [{ id: 'assertion', statement: 'Same statement' }], edges: [] } }));
  const identity = createIdentityResolver(documents, [], {});
  for (const { file } of documents) for (const id of ['citation', 'assertion']) assert.equal(identity.resolve(file, id), file.split('_full_')[0] + ':' + id);
  for (const id of ['citation', 'assertion']) assert.throws(() => createIdentityResolver(documents, [{ id, label: id, rationale: 'Unsafe test', members: ['one:' + id, 'two:' + id] }], {}), /cannot merge/);
  const protectedNodes = atlas.nodes.filter(node => node.claim || node.variants.some(variant => /^(claim_|ref_)/.test(variant.record.id)));
  assert.ok(protectedNodes.every(node => node.topics.length === 1 && node.variants.length === 1));
});

test('connectivity audit reports disconnected data instead of inventing repairs', () => {
  assert.deepEqual(atlas.audit.connectivity, connectivity(atlas.nodes, atlas.edges));
  assert.equal(atlas.summary.components, 1754);
  assert.equal(atlas.summary.isolated, 1604);
  assert.equal(atlas.audit.connectivity.componentSizes[0], 5729);
  assert.ok(atlas.audit.sourceOnlyConnectivity.componentCount >= atlas.audit.connectivity.componentCount);
  assert.equal(atlas.audit.sourceClaimRecords, 526);
  assert.deepEqual(atlas.audit.selfLoops, ['IPv6.json:234', 'Next.js.json:168', 'firewall:133', 'operating_system:46', 'operating_system:55', 'python_language:140']);
});

test('repeated builds are byte-for-byte deterministic including layout and audits', async () => {
  assert.equal(JSON.stringify(await buildAtlas()), JSON.stringify(atlas));
});
