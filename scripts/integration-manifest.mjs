// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { claimEntries } from './extract-concepts.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = '3dec97f1cf764ddd3ea12672978f889d2b29feda';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const atlas = JSON.parse(await readFile(path.join(root, 'data/atlas.json')));
const sources = [];
for (const doc of atlas.documents) {
  const file = 'data/' + doc.file;
  const bytes = await readFile(path.join(root, file));
  const data = JSON.parse(bytes);
  const baselineSha256 = hash(execFileSync('git', ['show', baseline + ':' + file], { cwd: root, maxBuffer: 10 * 1024 * 1024 }));
  if (hash(bytes) !== baselineSha256) throw new Error('Source changed: ' + file);
  sources.push({ file, graphNode: 'S' + sources.length, sha256: hash(bytes), baselineSha256, unchanged: true,
    nodes: data.nodes.map((record, index) => ({ pointer: '/nodes/' + index, sourceId: record.id, derivedId: atlas.sourceNodeMap[doc.graphId + ':' + record.id] })),
    claims: claimEntries(data).map((record, index) => ({ pointer: typeof (data.claims || data.source_claims)[index] === 'string' ? '/nodes/' + data.nodes.findIndex(node => node.id === record.id) : '/' + (data.claims ? 'claims' : 'source_claims') + '/' + index, referencePointer: '/' + (data.claims ? 'claims' : 'source_claims') + '/' + index, sourceId: record.id, derivedId: atlas.sourceNodeMap[doc.graphId + ':' + record.id] })),
    edges: atlas.edges.filter(edge => edge.document === doc.file).map(edge => ({ pointer: edge.sourcePointer, sourceId: edge.record.id || null, derivedId: edge.id, source: edge.source, target: edge.target })),
    paths: atlas.paths.filter(item => item.document === doc.file).map(item => ({ pointer: item.sourcePointer, sourceId: item.record.id, derivedId: item.id, segments: item.segments })),
    metadata: Object.keys(data).filter(key => !['nodes', 'edges', 'relationships'].includes(key)).map(key => ({ pointer: '/' + key, derivedPointer: '/documents/' + sources.length + '/metadata/' + key }))
  });
}
const artifacts = {
  N: ['scripts/normalize-source.mjs'], I: ['scripts/concept-curation.mjs'], B: ['scripts/build-atlas.mjs'],
  U: ['src/app.js', 'src/map-key.js', 'src/styles.css', 'index.html'], A: ['data/atlas.json'],
  G: ['scripts/integration-manifest.mjs'], M: ['docs/integration-manifest.json'],
  X: ['test/atlas.test.mjs', 'test/data-unification.test.mjs', 'test/interface.test.mjs', 'test/integration.test.mjs'],
  Q: ['docs/QA.md', 'docs/integration-browser.json', 'scripts/qa-integration.cjs', 'docs/qa/integration-desktop.png', 'docs/qa/integration-mobile.png'],
  DOC: ['README.md', 'docs/DATA-AUDIT.md'], GRAPH: ['docs/data-integration.mmd', 'docs/integration-graph.svg']
};
const manifest = { attribution: 'Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService', baseline, checkedDate: '2026-10-09',
  policy: 'Literature guides the workflow, never domain edges. Every original record maps exactly; source bytes and original credits retained.',
  requirements: { R1: ['N','B','A','M','X'], R2: ['I','B','X'], R3: ['N','U','X'], R4: ['U','Q'], R5: ['X','Q','DOC','GRAPH','PUB'] },
  anchors: { catalog: 'https://llm-coding.github.io/Semantic-Anchors/', date: '2026-10-07', scope: 'Visible index exact titles; five existing catalog anchors, Pattern Language and Literary Machines retained as verified local extensions.', existingSolutions: 'Existing d3-force, jsdom, vanilla UI, local Playwright and Mermaid renderer reused; no dependencies installed.' },
  artifacts, summary: atlas.summary, sourceNodeMap: atlas.sourceNodeMap, sources,
  editorialEdges: atlas.edges.filter(edge => edge.curated).map(edge => ({ id: edge.id, provenance: edge.provenance, evidenceUrls: edge.evidenceUrls })),
  derivedNodeIds: atlas.nodes.map(node => node.id), derivedEdgeIds: atlas.edges.map(edge => edge.id), derivedPathIds: atlas.paths.map(item => item.id)
};
await writeFile(path.join(root, 'docs/integration-manifest.json'), JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
console.log(`Manifest: ${sources.length} unchanged source hashes; exact node/claim/edge/path and metadata mappings.`);
