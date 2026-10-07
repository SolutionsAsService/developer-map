import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAtlas } from '../scripts/build-atlas.mjs';
import { claimEntries } from '../scripts/extract-concepts.mjs';

const atlas = await buildAtlas();
const published = JSON.parse(await readFile(new URL('../data/atlas.json', import.meta.url)));
const byId = new Map(atlas.nodes.map(node => [node.id, node]));

test('published atlas matches regenerated source data', () => {
  assert.deepEqual(published, atlas);
  assert.equal(atlas.documents.length, 4);
  assert.equal(atlas.summary.sourceRelationships, 638);
  assert.equal(atlas.summary.bridges, 1);
  assert.equal(atlas.summary.unresolved, 0);
  assert.equal(atlas.paths.length, 50);
  assert.equal(byId.size, atlas.nodes.length);
});

test('every source node, relationship, claim and path survives with provenance', async () => {
  for (const doc of atlas.documents) {
    const source = JSON.parse(await readFile(new URL(`../data/${doc.file}`, import.meta.url)));
    const originals = source.edges || source.relationships;
    assert.equal(atlas.edges.filter(edge => edge.document === doc.file).length, originals.length);
    originals.forEach((record, index) => {
      const edge = atlas.edges.find(item => item.id === `${doc.graphId}:${index}`);
      assert.deepEqual(edge.record, record);
      assert.ok(byId.has(edge.source) && byId.has(edge.target));
    });
    for (const record of source.nodes) {
      assert.ok(atlas.nodes.some(node => node.originalId === record.id && node.variants.some(variant => variant.document === doc.file && JSON.stringify(variant.record) === JSON.stringify(record))), `${doc.file}: ${record.id}`);
    }
    for (const claim of claimEntries(source)) {
      assert.ok(atlas.nodes.some(node => node.originalId === claim.id && node.variants.some(variant => variant.document === doc.file && (JSON.stringify(variant.record) === JSON.stringify(claim) || variant.claims.some(item => item.id === claim.id)))), `${doc.file}: ${claim.id}`);
    }
    for (const path of atlas.paths.filter(item => item.document === doc.file)) {
      for (const step of path.steps) assert.ok(byId.has(step), `${path.id}: ${step}`);
    }
  }
});

test('collisions remain source-scoped and the sole editorial bridge is labeled', () => {
  const claims = atlas.nodes.filter(node => node.originalId.startsWith('claim_'));
  assert.ok(claims.every(node => node.id.startsWith(`${node.topics[0]}:`)));
  assert.ok(atlas.nodes.some(node => node.topics.length > 1));
  const bridges = atlas.edges.filter(edge => edge.curated);
  assert.deepEqual(bridges.map(edge => edge.id), ['bridge:k8s-kubernetes']);
  assert.match(bridges[0].record.provenance, /not an original source edge/i);
  assert.ok(atlas.edges.filter(edge => !edge.curated).every(edge => edge.document !== 'curated'));
});
