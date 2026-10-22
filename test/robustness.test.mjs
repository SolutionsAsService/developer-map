import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentityResolver } from '../scripts/concept-identity.mjs';
import { documentNodes } from '../scripts/normalize-source.mjs';
import { detailArtifacts, MAX_SHARD_BYTES } from '../scripts/build-details.mjs';

const doc = (file, data) => ({ file, data: documentNodes(data) });

test('the same concept in different source files becomes one node', () => {
  const documents = [
    doc('alpha.json', { nodes: [{ id: 'lang_c', label: 'C', type: 'programming_language' }, { id: 'tcp', label: 'Transmission Control Protocol (TCP)', type: 'protocol' }], edges: [{ source: 'lang_c', target: 'tcp', relation: 'used_by' }] }),
    doc('beta.json', { nodes: [{ id: 'c', label: 'C (programming language)', type: 'language' }, { id: 'proto', label: 'TCP', type: 'protocol' }], edges: [{ source: 'c', target: 'proto', relation: 'implements' }] })
  ];
  const identity = createIdentityResolver(documents, [], {}, []);
  assert.equal(identity.resolve('alpha.json', 'lang_c'), identity.resolve('beta.json', 'c'));
  assert.equal(identity.resolve('alpha.json', 'tcp'), identity.resolve('beta.json', 'proto'));
  assert.equal(identity.resolve('alpha.json', 'lang_c'), 'c');
  assert.equal(identity.aliases['alpha:lang_c'], 'c');
});

test('people, ambiguous words, evidence records and declined pairs stay apart', () => {
  const documents = [
    doc('alpha.json', { nodes: [{ id: 'host', label: 'Host', type: 'concept' }, { id: 'turing', label: 'Turing', type: 'person' }, { id: 'ref', label: 'Same book', type: 'reference' }, { id: 'svc', label: 'Widget', type: 'concept' }], edges: [{ source: 'host', target: 'turing', relation: 'r' }] }),
    doc('beta.json', { nodes: [{ id: 'host', label: 'Host', type: 'cpu_role' }, { id: 'turing', label: 'Turing', type: 'machine_model' }, { id: 'ref', label: 'Same book', type: 'reference' }, { id: 'svc', label: 'Widget', type: 'concept' }], edges: [{ source: 'host', target: 'turing', relation: 'r' }] })
  ];
  const identity = createIdentityResolver(documents, [], {}, [{ ids: ['alpha:svc', 'beta:svc'], rationale: 'test' }]);
  for (const id of ['host', 'turing', 'ref', 'svc']) assert.notEqual(identity.resolve('alpha.json', id), identity.resolve('beta.json', id), id);
});

test('odd or incomplete source files degrade instead of throwing', () => {
  const data = documentNodes({
    nodes: [{ id: 'a', label: 'A' }, { id: 'a', label: 'Duplicate A' }, { label: 'No id' }, { name: 'b' }],
    edges: [{ source: 'a', target: 'undeclared_thing', relation: 'uses' }, { source: 'b', target: 'a' }],
    relationships: { not: 'an array' }
  });
  assert.deepEqual(data.nodes.map(node => node.id), ['a', 'a', 'b', 'undeclared_thing']);
  assert.equal(data.nodes[3].label, 'undeclared thing');
  assert.equal(data.nodes[3].type, 'referenced_concept');
  const identity = createIdentityResolver([{ file: 'x.json', data }], [{ id: 'gone', label: 'Gone', rationale: 'File was removed', members: ['missing:a', 'x:a'] }], {}, []);
  assert.ok(identity.issues.some(issue => /not found/.test(issue.issue)));
  assert.equal(documentNodes([1, 2, 3]), null);
});

test('a record larger than one detail shard is shortened, not fatal', () => {
  const huge = { id: 'big', label: 'Big', variants: [{ document: 'x.json', fields: [], claims: [], related: [{ section: 's', fields: [], record: { text: 'x'.repeat(MAX_SHARD_BYTES * 2) } }], record: {} }] };
  const { manifest, files } = detailArtifacts({ nodes: [huge], edges: [], documents: [], paths: [] });
  const ref = manifest.shards[manifest.nodes.big];
  assert.ok(ref.bytes <= MAX_SHARD_BYTES);
  assert.match(JSON.parse(files.get(ref.file)).records[0].truncated, /atlas\.json/);
});
