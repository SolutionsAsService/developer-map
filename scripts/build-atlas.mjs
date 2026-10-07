import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { claimEntries, claimText, explainDocument, explainEdge, explainVariant, relatedSections } from './extract-concepts.mjs';
import { layoutGraph } from './layout-graph.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.join(root, 'data');
const slug = file => path.basename(file).split('_full_')[0];
const normalizedLabel = node => String(node.label || node.id).trim().toLowerCase().replace(/\s+/g, ' ');

export async function buildAtlas() {
  const files = (await readdir(dataDirectory)).filter(file => file.endsWith('.json') && file !== 'atlas.json').sort();
  const sources = await Promise.all(files.map(async file => ({ file, data: JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')) })));
  const documents = sources.filter(({ data }) => Array.isArray(data.nodes) && (Array.isArray(data.edges) || Array.isArray(data.relationships)));
  const identities = new Map();
  for (const { data } of documents) {
    for (const original of data.nodes) {
      if (!original.id) throw new Error('Source node missing an ID');
      if (!identities.has(original.id)) identities.set(original.id, new Set());
      identities.get(original.id).add(normalizedLabel(original));
    }
  }
  const scopedId = (file, id) => /^(claim_|ref_)/.test(id) || identities.get(id)?.size > 1 ? `${slug(file)}:${id}` : id;
  const nodes = new Map();
  const edges = [];
  const documentMetadata = [];
  const paths = [];

  for (const { file, data } of documents) {
    const graphId = slug(file);
    const relationships = data.edges || data.relationships;
    const claimsById = new Map(claimEntries(data).map(claim => [claim.id, claim]));
    const { nodes: _nodes, edges: _edges, relationships: _relationships, ...metadata } = data;
    const related = relatedSections(metadata, new Set([...data.nodes.map(node => node.id), ...claimsById.keys()]));
    documentMetadata.push({ file, graphId, title: data.subject || data.title || graphId, domain: data.domain, nodeCount: data.nodes.length, edgeCount: relationships.length, fields: explainDocument(metadata), metadata });

    for (const original of data.nodes) {
      const id = scopedId(file, original.id);
      const current = nodes.get(id) || { id, originalId: original.id, label: original.label || original.id, type: original.type || 'concept', description: '', topics: [], variants: [] };
      if (!current.topics.includes(graphId)) current.topics.push(graphId);
      const variant = { ...explainVariant(original, file, claimsById), related: related.get(original.id) || [] };
      if (claimsById.has(original.id)) variant.claims.push(claimsById.get(original.id));
      current.variants.push(variant);
      const explanation = [original.definition, original.description, original.semantic_definition].find(value => typeof value === 'string') || '';
      if (explanation.length > current.description.length) current.description = explanation;
      if (claimsById.has(original.id)) current.claim = true;
      nodes.set(id, current);
    }
    for (const claim of claimsById.values()) {
      const id = scopedId(file, claim.id);
      if (nodes.has(id)) continue;
      nodes.set(id, { id, originalId: claim.id, label: String(claimText(claim) || claim.id).slice(0, 76), type: 'source claim', description: claimText(claim), topics: [graphId], claim: true, variants: [{ ...explainVariant(claim, file, claimsById), related: related.get(claim.id) || [] }] });
    }
    relationships.forEach((original, index) => {
      if (!original.source || !original.target) throw new Error(`Incomplete edge ${file}:${index}`);
      edges.push({ id: `${graphId}:${index}`, source: scopedId(file, original.source), target: scopedId(file, original.target), relation: original.relation || original.relationship || 'related to', semantic: original.semantic || original.description || original.mechanism || '', ...explainEdge(original, file, claimsById) });
    });
    for (const [index, learningPath] of (data.learning_paths || []).entries()) {
      const steps = learningPath.sequence.map(id => scopedId(file, id));
      paths.push({ id: `${graphId}:path:${index}`, title: learningPath.title || learningPath.name, subtitle: `From the ${data.subject || data.title || graphId} source graph`, color: ({ docker: 'cyan', kubernetes: 'violet', virtual_machine: 'amber', containerization: 'mint' })[graphId], description: `A recorded path through the ${data.subject || data.title || graphId} source graph.`, steps, document: file, record: learningPath });
    }
  }

  if (nodes.has('k8s') && nodes.has('kubernetes')) {
    const bridge = { source: 'k8s', target: 'kubernetes', relation: 'same_platform_as', reason: 'The source records label both IDs as Kubernetes; the two graph IDs are linked explicitly rather than silently merged.', provenance: 'Curated cross-graph identity bridge; not an original source edge.' };
    edges.push({ id: 'bridge:k8s-kubernetes', ...bridge, semantic: bridge.reason, document: 'curated', curated: true, fields: [{ key: 'provenance', label: 'Provenance', value: bridge.provenance }], evidence: [], record: bridge });
  }
  for (const edge of edges) {
    if (!nodes.has(edge.source) || !nodes.has(edge.target)) throw new Error(`Unresolved edge ${edge.id}: ${edge.source} → ${edge.target}`);
  }
  for (const learningPath of paths) {
    for (const id of learningPath.steps) if (!nodes.has(id)) throw new Error(`Unknown step ${id} in ${learningPath.id}`);
  }
  const unifiedNodes = [...nodes.values()].sort((left, right) => left.label.localeCompare(right.label));
  layoutGraph(unifiedNodes, edges, documentMetadata);
  return { schemaVersion: '1.0', title: 'Developer Map', documents: documentMetadata, nodes: unifiedNodes, edges, paths,
    summary: { concepts: unifiedNodes.length, relationships: edges.length, overlaps: unifiedNodes.filter(node => node.topics.length > 1).length, sourceRelationships: edges.filter(edge => !edge.curated).length, bridges: edges.filter(edge => edge.curated).length, unresolved: 0 } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const atlas = await buildAtlas();
  await writeFile(path.join(dataDirectory, 'atlas.json'), JSON.stringify(atlas));
  console.log(`Built ${atlas.summary.concepts} concepts from ${atlas.documents.length} source graphs, ${atlas.summary.sourceRelationships} source relationships, ${atlas.summary.bridges} curated bridges`);
}
