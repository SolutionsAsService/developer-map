import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { loadAtlas, TRACE_ID, slugify } from '../lib/atlas.js';
import { REGIONS } from '../lib/regions.js';
import { figureGeometry } from '../lib/figure.js';

const atlas = loadAtlas();

test('every source graph belongs to exactly one region', () => {
  const ids = atlas.graphs.map(g => g.id);
  assert.deepEqual(atlas.graphs.filter(g => !g.region).map(g => g.id), []);
  const listed = REGIONS.flatMap(r => r.graphs);
  assert.equal(new Set(listed).size, listed.length, 'a graph is listed in two regions');
  for (const g of listed) assert.ok(ids.includes(g), `region lists unknown graph ${g}`);
});

test('every source file in data/ is a graph or a reported skip', () => {
  const files = readdirSync('data').filter(f => f.endsWith('.json') && !['atlas.json', 'overview.json'].includes(f));
  const skipped = atlas.raw.audit.skippedSources.map(s => s.file);
  for (const f of files) assert.ok(atlas.graphs.some(g => g.file === f) || skipped.includes(f), f);
});

test('concept slugs are unique and every paged concept has one', () => {
  const slugs = [...atlas.slugOf.values()];
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(atlas.slugOf.size, atlas.paged.size);
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
});

test('every concept has somewhere to link to', () => {
  for (const n of atlas.nodes) if (n.graphs.length) assert.ok(atlas.href(n.id), n.id);
});

test('the traced concept appears in the graphs and regions the landing says', () => {
  const t = atlas.nodeById.get(TRACE_ID);
  const most = Math.max(...atlas.nodes.map(n => n.graphs.length));
  assert.ok(t.graphs.length >= most - 1, 'trace is among the most shared concepts');
  for (const size of ['wide', 'narrow']) {
    const g = figureGeometry(atlas, size);
    assert.equal(g.stops.length, t.graphs.length, size);
  }
});

test('landing blocks use one scale and stay inside the drawing', () => {
  for (const size of ['wide', 'narrow']) {
    const g = figureGeometry(atlas, size);
    for (const row of g.rows) for (const t of row.tiles) {
      assert.ok(t.x >= g.plotX - 0.1 && t.x + t.w <= g.size.width + 0.1, `${size} ${t.id} x`);
      if (t.nodes * g.k >= 1.5) assert.ok(Math.abs(t.w - t.nodes * g.k) < 0.11, `${size} ${t.id} width`);
    }
  }
});

test('the multi-graph count printed on the landing is the number of concepts in 2+ graphs', () => {
  assert.equal(atlas.multiCount, atlas.nodes.filter(n => n.graphs.length > 1).length);
  assert.equal(atlas.multiCount, atlas.raw.summary.overlaps);
});

test('slugify is stable', () => {
  assert.equal(slugify('API:api_abuse'), 'api-api-abuse');
  assert.equal(slugify('C++'), 'c');
});
