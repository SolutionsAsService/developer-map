// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { normalizePath, relationshipEntries } from '../scripts/normalize-source.mjs';
const atlas = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../docs/integration-manifest.json', import.meta.url)));
const byId = new Map(atlas.nodes.map(node => [node.id, node]));
const id = key => atlas.sourceNodeMap[key];
test('all source input hashes and exact manifest mappings preserve source records', async () => {
  let nodes = 0, edges = 0, claims = 0, paths = 0;
  for (const source of manifest.sources) {
    const bytes = await readFile(new URL('../' + source.file, import.meta.url));
    const data = JSON.parse(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.baselineSha256);
    assert.equal(source.sha256, source.baselineSha256);
    const pointer = value => value.split('/').slice(1).reduce((item, key) => item[key], data);
    for (const record of source.nodes) {
      const original = pointer(record.pointer);
      assert.deepEqual(byId.get(record.derivedId).variants.find(v => v.document === source.file.slice(5) && v.sourceId === record.sourceId).record, original);
    }
    for (const record of source.edges) assert.deepEqual(atlas.edges.find(edge => edge.id === record.derivedId).record, pointer(record.pointer));
    for (const record of source.paths) assert.deepEqual(atlas.paths.find(item => item.id === record.derivedId).record, pointer(record.pointer));
    for (const record of source.claims) assert.ok(byId.get(record.derivedId).variants.some(v => JSON.stringify(v.record) === JSON.stringify(pointer(record.pointer)) || v.claims.some(c => JSON.stringify(c) === JSON.stringify(pointer(record.pointer)))));
    nodes += source.nodes.length; edges += source.edges.length; claims += source.claims.length; paths += source.paths.length;
  }
  assert.deepEqual([nodes, edges, claims, paths], [7812, 8604, 526, 522]);
  assert.deepEqual(manifest.derivedNodeIds, atlas.nodes.map(n => n.id));
  assert.deepEqual(manifest.derivedEdgeIds, atlas.edges.map(e => e.id));
});
test('rich relationships have distinct stable section provenance without losing parallel records', () => {
  const rich = atlas.edges.filter(edge => edge.section === 'rich_semantic_relationships');
  assert.equal(rich.length, 44);
  for (const edge of rich) {
    assert.match(edge.id, /:rich_semantic_relationships:/);
    assert.equal(edge.sourcePointer, '/rich_semantic_relationships/' + edge.sourceIndex);
    assert.equal(edge.curated, false);
    assert.equal(edge.provenance, 'source');
    for (const key of ['mechanism','conditions','effect','scope','inverse_or_converse']) if (key in edge.record) assert.deepEqual(edge.fields.find(f => f.key === key).value, edge.record[key]);
  }
  assert.equal(relationshipEntries({edges:[{}],relationships:[{}],rich_semantic_relationships:[{}]}).length,3);
});
test('vm jvm linux sandbox kernel filesystem URL identities remain conservative', () => {
  for (const key of ['vm','linux','kernel','filesystem','namespace']) {
    assert.equal(atlas.aliases[key], undefined);
    assert.ok(atlas.ambiguousAliases[key].length > 1);
  }
  assert.equal(id('python_language:jvm'), 'jvm');
  assert.equal(id('virtual_machine:jvm'), 'jvm');
  assert.equal(id('docker:vm'), 'virtual_machine');
  assert.equal(id('sandbox_computer_security:vm'), 'virtual_machine');
  assert.notEqual(id('python_language:vm'), 'virtual_machine');
  assert.notEqual(id('operating_system:vm'), id('operating_system:virtual_machine'));
  assert.equal(id('operating_system:sandbox'), id('sandbox_computer_security:sandbox'));
  assert.notEqual(id('virtual_machine:sandbox'), id('sandbox_computer_security:sandbox'));
  assert.notEqual(id('sandbox_computer_security:linux'), id('docker:linux'));
  for (const pair of [['docker:volume','volume_computing:volume'],['kubernetes:volume','volume_computing:volume'],['optical_disc_image:filesystem','volume_computing:filesystem'],['python_language:namespace','kubernetes:namespace']]) assert.notEqual(id(pair[0]), id(pair[1]));
  for (const [alias, target] of Object.entries(atlas.aliases)) { assert.ok(byId.has(target)); assert.ok(!byId.has(alias)); }
});
test('source evidence connects new domains without invented editorial repairs', () => {
  const cases = {operating_system:[3,313,314,316,317],sandbox_computer_security:[14,25,26,27,42,43],python_language:[192,193,194,271,310],virtual_machine:[33],optical_disc_image:[0,113,116,117],system_image:[3],volume_computing:[4,24,27]};
  for (const [graph, indexes] of Object.entries(cases)) for (const index of indexes) {
    const edge = atlas.edges.find(e => e.id === graph + ':' + index);
    assert.equal(edge.source, id(graph + ':' + edge.record.source));
    assert.equal(edge.target, id(graph + ':' + edge.record.target));
    assert.equal(edge.provenance, 'source');
  }
  assert.equal(atlas.edges.filter(e => e.curated).length, 16);
  assert.equal(atlas.edges.find(e => e.id === 'python_language:310').target, atlas.edges.find(e => e.id === 'virtual_machine:33').source);
  assert.equal(atlas.edges.find(e => e.id === 'system_image:3').record.conditions, 'All relevant state must be on disk.');
});
test('prose paths preserve unresolved whole segments and never infer graph edges', () => {
  const prose = atlas.paths.filter(p => p.sequenceKind === 'prose');
  assert.equal(prose.length, 42);
  for (const item of prose) {
    assert.equal(item.sequenceText, item.record.sequence);
    assert.ok(item.segments.every(s => ['resolved','unresolved'].includes(s.status)));
    assert.deepEqual(item.steps, item.segments.filter(s => s.status === 'resolved').map(s => s.conceptId));
  }
  const compile = prose.find(p => p.title === 'Compilation');
  assert.equal(compile.segments.length, 1);
  assert.equal(compile.segments[0].status, 'unresolved');
  assert.equal(compile.steps.length, 0);
  const sample = normalizePath({id:'test',sequence:'a -> a/b -> b'}, {nodes:[{id:'a'},{id:'b'}]}, x => x);
  assert.deepEqual(sample.segments.map(s => s.status), ['resolved','unresolved','resolved']);
  assert.equal(sample.segments[1].text, 'a/b');
  assert.ok(atlas.edges.every(e => e.curated || e.section));
});
