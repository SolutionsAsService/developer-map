import { createHash } from 'node:crypto';
import { documentTitle, relationshipEntries, normalizePath } from './normalize-source.mjs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { claimEntries, claimText, explainDocument, explainEdge, explainVariant, relatedSections } from './extract-concepts.mjs';
import { layoutGraph } from './layout-graph.mjs';
import { createIdentityResolver, connectivity } from './concept-identity.mjs';
import { aliasGroups, forcedScopes, declinedMerges, editorialRelations } from './concept-curation.mjs';

import { relationKind, overviewProjection } from './semantic-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.join(root, 'data');
const slug = file => path.basename(file).split('_full_')[0];

export async function buildAtlas() {
  const files = (await readdir(dataDirectory)).filter(file => file.endsWith('.json') && !['atlas.json', 'overview.json'].includes(file)).sort();
  const sources = await Promise.all(files.map(async file => ({ file, data: JSON.parse(await readFile(path.join(dataDirectory, file), 'utf8')), sha256: createHash('sha256').update(await readFile(path.join(dataDirectory, file))).digest('hex') })));
  const documents = sources.filter(({ data }) => Array.isArray(data.nodes) && (Array.isArray(data.edges) || Array.isArray(data.relationships)));
  if (documents.length !== sources.length) throw new Error('Unsupported JSON source schema; refusing silent omission');
  const identity = createIdentityResolver(documents);
  const scopedId = identity.resolve;
  const nodes = new Map();
  const edges = [];
  const documentMetadata = [];
  const paths = [];

  for (const { file, data, sha256 } of documents) {
    const graphId = slug(file);
    const relationships = relationshipEntries(data);
    const title = documentTitle(data, graphId);
    const claimsById = new Map(claimEntries(data).map(claim => [claim.id, claim]));
    const { nodes: _nodes, edges: _edges, relationships: _relationships, ...metadata } = data;
    const related = relatedSections(metadata, new Set([...data.nodes.map(node => node.id), ...claimsById.keys()]));
    documentMetadata.push({ file, graphId, title, sha256, domain: data.domain || data.metadata?.domain || graphId, nodeCount: data.nodes.length, edgeCount: relationships.length, fields: explainDocument(metadata), metadata });

    for (const original of data.nodes) {
      const id = scopedId(file, original.id);
      const current = nodes.get(id) || { id, originalId: original.id, originalIds: [], label: identity.canonicalLabels.get(id) || original.label || original.id, type: original.type || 'concept', description: '', topics: [], variants: [] };
      if (!current.originalIds.includes(original.id)) current.originalIds.push(original.id);
      if (!current.topics.includes(graphId)) current.topics.push(graphId);
      const variant = { ...explainVariant(original, file, claimsById), sourceId: original.id, sourceKey: graphId + ':' + original.id, related: related.get(original.id) || [] };
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
      nodes.set(id, { id, originalId: claim.id, originalIds: [claim.id], label: String(claimText(claim) || claim.id).slice(0, 76), type: 'source claim', description: claimText(claim), topics: [graphId], claim: true, variants: [{ ...explainVariant(claim, file, claimsById), sourceId: claim.id, sourceKey: graphId + ':' + claim.id, related: related.get(claim.id) || [] }] });
    }
    relationships.forEach(({ record: original, section, index }) => {
      if (!original.source || !original.target) throw new Error(`Incomplete edge ${file}:${index}`);
      edges.push({ id: section === 'rich_semantic_relationships' || (section === 'edges' && data.relationships) ? `${graphId}:${section}:${index}` : `${graphId}:${index}`, section, sourceIndex: index, sourcePointer: `/${section}/${index}`, source: scopedId(file, original.source), target: scopedId(file, original.target), relation: original.relation || original.relationship || 'related to', kind: relationKind(original.relation || original.relationship || ''), assertionStatus: 'Source assertion; not independently fact-checked', semantic: original.semantic || original.description || original.mechanism || '', ...explainEdge(original, file, claimsById), provenance: 'source', curated: false });
    });
    for (const [index, learningPath] of (data.learning_paths || []).entries()) {
      paths.push({ id: `${graphId}:path:${index}`, title: learningPath.title || learningPath.name || learningPath.label || learningPath.id, subtitle: `From the ${title} source graph`, color: graphId, description: 'Original source learning suggestion; consecutive ideas need not have a recorded edge.', ...normalizePath(learningPath, data, id => scopedId(file, id)), document: file, sourcePointer: `/learning_paths/${index}`, record: learningPath });
    }
  }

  for (const relation of editorialRelations) {
    const record = { ...relation, provenance: 'Editorial semantic relation; not an original source edge.', evidenceChecked: '2026-10-07' };
    edges.push({ ...relation, kind: relationKind(relation.relation), assertionStatus: 'Editorial bridge checked against linked primary documentation', semantic: relation.rationale, document: 'curated', curated: true, provenance: 'editorial',
      fields: [{ key: 'provenance', label: 'Provenance', value: record.provenance }, { key: 'rationale', label: 'Editorial rationale', value: relation.rationale }, { key: 'scope', label: 'Scope', value: relation.scope || 'Conceptual relationship' }, { key: 'evidenceUrls', label: 'Primary-source evidence', value: relation.evidenceUrls }],
      evidence: relation.evidenceUrls.map((url, index) => ({ id: relation.id + ':evidence:' + index, url, source: url, statement: relation.rationale, kind: 'editorial primary-source evidence', checked: '2026-10-07' })), record });
  }
  for (const edge of edges) {
    if (edge.source === edge.target && (edge.curated || edge.record.source !== edge.record.target)) throw new Error('Identity merge introduced self-loop: ' + edge.id);
    if (!nodes.has(edge.source) || !nodes.has(edge.target)) throw new Error(`Unresolved edge ${edge.id}: ${edge.source} → ${edge.target}`);
  }
  for (const learningPath of paths) {
    for (const id of learningPath.steps) if (!nodes.has(id)) throw new Error(`Unknown step ${id} in ${learningPath.id}`);
  }
  const unifiedNodes = [...nodes.values()].sort((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id));
  for (const node of unifiedNodes) {
    node.aliases = Object.entries(identity.aliases).filter(([, id]) => id === node.id).map(([alias]) => alias);
    node.originalIds.sort();
  }
  layoutGraph(unifiedNodes, edges, documentMetadata);
  const graphAudit = connectivity(unifiedNodes, edges);
  const sourceAudit = connectivity(unifiedNodes, edges.filter(edge => !edge.curated));
  const audit = { connectivity: graphAudit, sourceOnlyConnectivity: sourceAudit, aliasGroups, forcedScopes, declinedMerges,
    sourceNodeRecords: documents.reduce((sum, { data }) => sum + data.nodes.length, 0), sourceClaimRecords: documents.reduce((sum, { data }) => sum + claimEntries(data).length, 0),
    protectedRecordCount: identity.protectedKeys.size, selfLoops: edges.filter(edge => edge.source === edge.target).map(edge => edge.id),
    sourceParallelEdgesRetained: true, policy: 'No fuzzy identities. Original records and all parallel source edges retained. Editorial edges do not repair or endorse source claims.' };

  const overview = overviewProjection(unifiedNodes, edges);
  audit.coverage = documents.map(({file, data, sha256}) => ({ file, sha256, inputNodes: data.nodes.length, importedNodeVariants: unifiedNodes.flatMap(n=>n.variants).filter(v=>v.document===file && data.nodes.some(n=>n.id===v.sourceId)).length, sections: ['edges','relationships','rich_semantic_relationships'].map(section=>({section,input:(data[section]||[]).length,imported:edges.filter(e=>e.document===file && e.section===section).length})), duplicateNodeIds: data.nodes.map(n=>n.id).filter((id,i,all)=>all.indexOf(id)!==i), duplicateRelationshipIds: relationshipEntries(data).map(e=>e.record.id).filter(Boolean).filter((id,i,all)=>all.indexOf(id)!==i) }));
  audit.conflicts = unifiedNodes.filter(n=>n.variants.length>1 && new Set(n.variants.map(v=>JSON.stringify(v.record.description||v.record.definition||v.record.semantic_definition||''))).size>1).map(n=>({id:n.id,status:'Variant descriptions differ; preserved, not resolved or endorsed',sources:n.variants.map(v=>v.sourceKey)}));
  audit.unsupportedClaims = edges.filter(e=>!e.curated && !e.evidence.length).map(e=>e.id);
  audit.missingWhy = edges.filter(e=>!e.semantic && !e.record.rationale && !e.record.explanation).map(e=>e.id);
  return { overview, schemaVersion: '1.3', title: 'Developer Map', documents: documentMetadata, nodes: unifiedNodes, edges, paths, aliases: identity.aliases, ambiguousAliases: identity.ambiguousAliases, sourceNodeMap: identity.sourceNodeMap, audit,
    summary: { concepts: unifiedNodes.length, relationships: edges.length, overlaps: unifiedNodes.filter(node => node.topics.length > 1).length, sourceRelationships: edges.filter(edge => !edge.curated).length, bridges: edges.filter(edge => edge.curated).length, unresolved: 0, unresolvedPathSegments: paths.reduce((sum, item) => sum + item.unresolvedSegments, 0), textPaths: paths.filter(item => item.sequenceKind === 'prose').length, richRelationships: edges.filter(edge => edge.section === 'rich_semantic_relationships').length, components: graphAudit.componentCount, isolated: graphAudit.isolatedNodeIds.length, aliasGroups: aliasGroups.length } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const atlas = await buildAtlas();
  await writeFile(path.join(dataDirectory, 'atlas.json'), JSON.stringify(atlas));
  // Lightweight first paint; full archive is loaded only for selection or catalog/search.
  const overview = { ...atlas, documents: atlas.documents.map(({metadata,fields,...doc})=>doc), nodes: atlas.nodes.map(({variants,...node})=>({...node,variants:[]})), edges: atlas.edges.map(({record,fields,evidence,...edge})=>({...edge, record:{source:edge.source,target:edge.target},fields:[],evidence:[]})), paths:[], audit:{}, lightweight:true };
  await writeFile(path.join(dataDirectory, 'overview.json'), JSON.stringify(overview));
  console.log(`Built ${atlas.summary.concepts} concepts from ${atlas.documents.length} source graphs, ${atlas.summary.sourceRelationships} source relationships, ${atlas.summary.bridges} curated bridges`);
}
