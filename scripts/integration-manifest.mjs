// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { claimEntries } from './extract-concepts.mjs';
import { isSourceFile, sourceNodeList } from './normalize-source.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const atlas = JSON.parse(await readFile(path.join(root, 'data/atlas.json')));
const sources = [];
for (const doc of atlas.documents) {
  const file = 'data/' + doc.file;
  const bytes = await readFile(path.join(root, file));
  const raw = JSON.parse(bytes.toString('utf8').replace(/^﻿/, ''));
  const data = { ...raw, nodes: sourceNodeList(raw) };
  const nodeSection = Array.isArray(raw.nodes) ? 'nodes' : Array.isArray(raw.entities) ? 'entities' : null;
  const sha256 = hash(bytes);
  if (sha256 !== doc.sha256) throw new Error('Source changed since atlas build: ' + file);
  sources.push({ file, graphNode: 'S' + sources.length, sha256, baselineSha256: sha256, unchanged: true,
    nodes: data.nodes.map((record) => {
      const rawIndex = nodeSection ? raw[nodeSection].findIndex(r => (r.id ?? r.name) === record.id) : -1;
      return { pointer: rawIndex >= 0 ? '/' + nodeSection + '/' + rawIndex : null, sourceId: record.id, derivedId: atlas.sourceNodeMap[doc.graphId + ':' + record.id] };
    }),
    claims: claimEntries(data).map((record, index) => ({ pointer: typeof (data.claims || data.source_claims)[index] === 'string' ? '/nodes/' + data.nodes.findIndex(node => node.id === record.id) : '/' + (data.claims ? 'claims' : 'source_claims') + '/' + index, referencePointer: '/' + (data.claims ? 'claims' : 'source_claims') + '/' + index, sourceId: record.id, derivedId: atlas.sourceNodeMap[doc.graphId + ':' + record.id] })),
    edges: atlas.edges.filter(edge => edge.document === doc.file).map(edge => ({ pointer: edge.sourcePointer, sourceId: edge.record.id || null, derivedId: edge.id, source: edge.source, target: edge.target })),
    paths: atlas.paths.filter(item => item.document === doc.file).map(item => ({ pointer: item.sourcePointer, sourceId: item.record.id, derivedId: item.id, segments: item.segments })),
    metadata: Object.keys(data).filter(key => !['nodes', 'edges', 'relationships'].includes(key)).map(key => ({ pointer: '/' + key, derivedPointer: '/documents/' + sources.length + '/metadata/' + key }))
  });
}
// Non-graph uploads (e.g. schema documents) are retained as downloads and audited, not imported.
const imported = new Set(sources.map(source => source.file));
const skippedSources = (await readdir(path.join(root, 'data'))).filter(isSourceFile).sort()
  .filter(name => !imported.has('data/' + name))
  .map(name => ({ file: 'data/' + name, sha256: atlas.audit.skippedSources?.find(entry => entry.file === name)?.sha256 || null, imported: false }));
const artifacts = {
  N: ['scripts/normalize-source.mjs'], I: ['scripts/concept-curation.mjs'], B: ['scripts/build-atlas.mjs'],
  U: ['src/app.js', 'src/map-key.js', 'src/styles.css', 'index.html', 'favicon.svg'], A: ['data/atlas.json'],
  G: ['scripts/integration-manifest.mjs'], M: ['docs/integration-manifest.json'],
  X: ['test/atlas.test.mjs', 'test/data-unification.test.mjs', 'test/interface.test.mjs', 'test/integration.test.mjs'],
  Q: ['docs/QA.md', 'docs/integration-browser.json', 'scripts/qa-integration.cjs', 'docs/qa/integration-desktop.png', 'docs/qa/integration-mobile.png'],
  DOC: ['README.md', 'docs/DATA-AUDIT.md'], GRAPH: ['docs/data-integration.mmd', 'docs/integration-graph.svg']
};
const manifest = { attribution: 'Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService', checkedDate: new Date().toISOString().slice(0, 10),
  policy: 'Literature guides the workflow, never domain edges. Every original record maps exactly; source bytes and original credits retained. New uploads are discovered dynamically from data/; there is no pinned git baseline to break.',
  requirements: { R1: ['N','B','A','M','X'], R2: ['I','B','X'], R3: ['N','U','X'], R4: ['U','Q'], R5: ['X','Q','DOC','GRAPH','PUB'] },
  anchors: { catalog: 'https://llm-coding.github.io/Semantic-Anchors/', date: '2026-10-07', scope: 'Visible index exact titles; five existing catalog anchors, Pattern Language and Literary Machines retained as verified local extensions.', existingSolutions: 'Existing d3-force, jsdom, vanilla UI, local Playwright and Mermaid renderer reused; no dependencies installed.' },
  artifacts, summary: atlas.summary, sourceNodeMap: atlas.sourceNodeMap, sources, skippedSources,
  editorialEdges: atlas.edges.filter(edge => edge.curated).map(edge => ({ id: edge.id, provenance: edge.provenance, evidenceUrls: edge.evidenceUrls })),
  derivedNodeIds: atlas.nodes.map(node => node.id), derivedEdgeIds: atlas.edges.map(edge => edge.id), derivedPathIds: atlas.paths.map(item => item.id)
};
await writeFile(path.join(root, 'docs/integration-manifest.json'), JSON.stringify(manifest, null, 2) + String.fromCharCode(10));
console.log(`Manifest: ${sources.length} unchanged source hashes; exact node/claim/edge/path and metadata mappings.`);
