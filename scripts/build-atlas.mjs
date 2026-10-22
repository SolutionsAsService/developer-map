import { writeDetails } from './build-details.mjs';
import { createHash } from 'node:crypto';
import { documentTitle, relationshipSource, relationshipTarget, relationshipPredicate, relationshipEntries, normalizePath, pathRecord, isSourceFile, graphKey, documentNodes, sourceRelationshipSections, documentPathEntries } from './normalize-source.mjs';
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
  const files = (await readdir(dataDirectory)).filter(isSourceFile).sort();
  const skipped = [];
  const warnings = [];
  // One unreadable or unusual file is reported and skipped; it never stops the build.
  const sources = (await Promise.all(files.map(async file => {
    const bytes = await readFile(path.join(dataDirectory, file));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    try { return { file, data: JSON.parse(bytes.toString('utf8').replace(/^﻿/, '')), sha256 }; }
    catch (error) { skipped.push({ file, sha256, reason: 'Malformed JSON: ' + error.message }); return null; }
  }))).filter(Boolean);
  const documents = [];
  for (const source of sources) {
    let data = null;
    try { data = documentNodes(source.data); } catch (error) { warnings.push({ file: source.file, issue: 'Unreadable node list: ' + error.message }); }
    if (data && sourceRelationshipSections(data).length) documents.push({ ...source, data });
    else skipped.push({ file: source.file, sha256: source.sha256, reason: 'No importable node or relationship arrays; retained as a downloadable source file only' });
  }
  const identity = createIdentityResolver(documents);
  const scopedId = identity.resolve;
  warnings.push(...identity.issues);
  const mergedSelfLoops = [];
  const nodes = new Map();
  const edges = [];
  const documentMetadata = [];
  const paths = [];

  for (const { file, data, sha256 } of documents) {
    const graphId = graphKey(file);
    const relationshipSections = sourceRelationshipSections(data);
    const relationships = relationshipSections.flatMap(({ section, pointer, entries }) => entries.map(entry => ({ section, pointer, ...entry })));
    const title = documentTitle(data, graphId);
    const claimsById = new Map(claimEntries(data).map(claim => [claim.id, claim]));
    const { nodes: _nodes, entities: _entities, edges: _edges, relationships: _relationships, ...metadata } = data;
    const related = relatedSections(metadata, new Set([...data.nodes.map(node => node.id), ...claimsById.keys()]));
    documentMetadata.push({ file, graphId, title, sha256, domain: data.domain || data.metadata?.domain || graphId, nodeCount: data.nodes.length, edgeCount: relationships.length, fields: explainDocument(metadata), metadata });

    for (const original of data.nodes) {
      const id = scopedId(file, original.id);
      if (!id) continue;
      const current = nodes.get(id) || { id, originalId: original.id, originalIds: [], label: identity.canonicalLabels.get(id) || original.label || original.id, type: original.type || 'concept', description: '', topics: [], variants: [] };
      if (!current.originalIds.includes(original.id)) current.originalIds.push(original.id);
      if (!current.topics.includes(graphId)) current.topics.push(graphId);
      const variant = { ...explainVariant(original, file, claimsById), sourceId: original.id, sourceKey: graphId + ':' + original.id, related: related.get(original.id) || [] };
      if (claimsById.has(original.id)) variant.claims.push(claimsById.get(original.id));
      current.variants.push(variant);
      // A described record beats a relationship-only placeholder for the shared type.
      if (current.type === 'referenced_concept' && !original.placeholder && original.type) current.type = original.type;
      const explanation = [original.definition, original.description, original.semantic_definition].find(value => typeof value === 'string') || '';
      if (explanation.length > current.description.length) current.description = explanation;
      if (claimsById.has(original.id)) current.claim = true;
      nodes.set(id, current);
    }
    for (const claim of claimsById.values()) {
      const id = scopedId(file, claim.id);
      if (!id || nodes.has(id)) continue;
      nodes.set(id, { id, originalId: claim.id, originalIds: [claim.id], label: String(claimText(claim) || claim.id).slice(0, 76), type: 'source claim', description: claimText(claim), topics: [graphId], claim: true, variants: [{ ...explainVariant(claim, file, claimsById), sourceId: claim.id, sourceKey: graphId + ':' + claim.id, related: related.get(claim.id) || [] }] });
    }
    relationships.forEach(({ record: original, section, pointer, index }) => {
      const edgeId = `${graphId}:${section}:${index}`;
      if (!original || typeof original !== 'object') { warnings.push({ file, edge: edgeId, issue: 'Relationship is not an object; skipped' }); return; }
      const sourceId = relationshipSource(original), targetId = relationshipTarget(original);
      const source = sourceId && scopedId(file, sourceId), target = targetId && scopedId(file, targetId);
      if (!source || !target) { warnings.push({ file, edge: edgeId, issue: 'Relationship missing a resolvable source or target; skipped' }); return; }
      // Two records of one concept linked to each other collapse into the merged node.
      if (source === target && sourceId !== targetId) { mergedSelfLoops.push({ id: edgeId, concept: source, relation: relationshipPredicate(original) }); return; }
      edges.push({ id: edgeId, section, sourceIndex: index, sourcePointer: `/${pointer}/${index}`, source, target, relation: relationshipPredicate(original), kind: relationKind(relationshipPredicate(original)), assertionStatus: 'Source assertion; not independently fact-checked', semantic: original.semantic || original.description || original.mechanism || original.meaning || '', ...explainEdge(original, file, claimsById), provenance: 'source', curated: false });
    });
    for (const { record: learningPath, pointer } of documentPathEntries(data)) {
      const index = pointer.split('/').pop();
      try {
        const resolved = pathRecord(learningPath, data);
        paths.push({ id: `${graphId}:path:${index}`, title: resolved.title || resolved.name || resolved.label || resolved.id, subtitle: `From the ${title} source graph`, color: graphId, description: 'Original source learning suggestion; consecutive ideas need not have a recorded edge.', ...normalizePath(learningPath, data, id => scopedId(file, id)), document: file, sourcePointer: pointer, record: learningPath });
      } catch (error) { warnings.push({ file, path: pointer, issue: 'Learning path skipped: ' + error.message }); }
    }
  }

  // Editorial bridges name concepts by ID; follow merges through aliases and
  // skip a bridge whose endpoint no longer exists instead of failing.
  const canonical = id => nodes.has(id) ? id : identity.aliases[id];
  for (const original of editorialRelations) {
    const relation = { ...original, source: canonical(original.source), target: canonical(original.target) };
    if (!relation.source || !relation.target || relation.source === relation.target) { warnings.push({ edge: original.id, issue: 'Editorial bridge endpoint missing or merged; skipped' }); continue; }
    const record = { ...relation, provenance: 'Editorial semantic relation; not an original source edge.', evidenceChecked: relation.evidenceChecked || '2026-10-07' };
    edges.push({ ...relation, kind: relationKind(relation.relation), assertionStatus: 'Editorial bridge checked against linked primary documentation', semantic: relation.rationale, document: 'curated', curated: true, provenance: 'editorial',
      fields: [{ key: 'provenance', label: 'Provenance', value: record.provenance }, { key: 'rationale', label: 'Editorial rationale', value: relation.rationale }, { key: 'scope', label: 'Scope', value: relation.scope || 'Conceptual relationship' }, { key: 'evidenceUrls', label: 'Primary-source evidence', value: relation.evidenceUrls }],
      evidence: relation.evidenceUrls.map((url, index) => ({ id: relation.id + ':evidence:' + index, url, source: url, statement: relation.rationale, kind: 'editorial primary-source evidence', checked: record.evidenceChecked })), record });
  }
  for (let i = edges.length - 1; i >= 0; i--) {
    const edge = edges[i];
    if (nodes.has(edge.source) && nodes.has(edge.target)) continue;
    warnings.push({ edge: edge.id, issue: `Unresolved endpoint ${edge.source} → ${edge.target}; skipped` });
    edges.splice(i, 1);
  }
  for (const learningPath of paths) learningPath.steps = learningPath.steps.filter(id => nodes.has(id));
  const unifiedNodes = [...nodes.values()].sort((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id));
  for (const node of unifiedNodes) {
    node.aliases = Object.entries(identity.aliases).filter(([, id]) => id === node.id).map(([alias]) => alias);
    node.originalIds.sort();
  }
  layoutGraph(unifiedNodes, edges, documentMetadata);
  const graphAudit = connectivity(unifiedNodes, edges);
  const sourceAudit = connectivity(unifiedNodes, edges.filter(edge => !edge.curated));
  const audit = { connectivity: graphAudit, sourceOnlyConnectivity: sourceAudit, aliasGroups, forcedScopes, declinedMerges, skippedSources: skipped, warnings, autoMerges: identity.autoMerges, mergedSelfLoops,
    sourceNodeRecords: documents.reduce((sum, { data }) => sum + data.nodes.length, 0), sourceClaimRecords: documents.reduce((sum, { data }) => sum + claimEntries(data).length, 0),
    protectedRecordCount: identity.protectedKeys.size, selfLoops: edges.filter(edge => edge.source === edge.target).map(edge => edge.id),
    sourceParallelEdgesRetained: true, policy: 'Records with the same normalized label across files are one concept (exact match only, no fuzzy similarity); people, evidence records, ambiguous words and declined pairs stay apart. Original records and all parallel source edges retained. Unusable files, records and edges are skipped and listed in warnings/skippedSources. Editorial edges do not repair or endorse source claims.' };

  const overview = overviewProjection(unifiedNodes, edges);
  audit.coverage = documents.map(({file, data, sha256}) => ({ file, sha256, inputNodes: data.nodes.length, importedNodeVariants: unifiedNodes.flatMap(n=>n.variants).filter(v=>v.document===file && data.nodes.some(n=>n.id===v.sourceId)).length, sections: sourceRelationshipSections(data).map(({section, entries}) => ({section,input:entries.length,imported:edges.filter(e=>e.document===file && e.section===section).length,mergedSelfLoops:mergedSelfLoops.filter(loop=>loop.id.startsWith(graphKey(file)+':'+section+':')).length})), duplicateNodeIds: data.nodes.map(n=>n.id).filter((id,i,all)=>all.indexOf(id)!==i), duplicateRelationshipIds: relationshipEntries(data).map(e=>e.record?.id).filter(Boolean).filter((id,i,all)=>all.indexOf(id)!==i) }));
  audit.conflicts = unifiedNodes.filter(n=>n.variants.length>1 && new Set(n.variants.map(v=>JSON.stringify(v.record.description||v.record.definition||v.record.semantic_definition||''))).size>1).map(n=>({id:n.id,status:'Variant descriptions differ; preserved, not resolved or endorsed',sources:n.variants.map(v=>v.sourceKey)}));
  audit.unsupportedClaims = edges.filter(e=>!e.curated && !e.evidence.length).map(e=>e.id);
  audit.missingWhy = edges.filter(e=>!e.semantic && !e.record.rationale && !e.record.explanation).map(e=>e.id);
  return { overview, schemaVersion: '1.3', title: 'Developer Map', documents: documentMetadata, nodes: unifiedNodes, edges, paths, aliases: identity.aliases, ambiguousAliases: identity.ambiguousAliases, sourceNodeMap: identity.sourceNodeMap, audit,
    summary: { concepts: unifiedNodes.length, relationships: edges.length, overlaps: unifiedNodes.filter(node => node.topics.length > 1).length, sourceRelationships: edges.filter(edge => !edge.curated).length, bridges: edges.filter(edge => edge.curated).length, unresolved: 0, unresolvedPathSegments: paths.reduce((sum, item) => sum + item.unresolvedSegments, 0), textPaths: paths.filter(item => item.sequenceKind === 'prose').length, richRelationships: edges.filter(edge => edge.section === 'rich_semantic_relationships').length, components: graphAudit.componentCount, isolated: graphAudit.isolatedNodeIds.length, aliasGroups: aliasGroups.length } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const atlas = await buildAtlas();
  await writeFile(path.join(dataDirectory, 'atlas.json'), JSON.stringify(atlas));
  // Full records load through content-addressed, bounded detail shards.
  const details = await writeDetails(atlas, dataDirectory);
  const overview = { ...atlas, details, documents: atlas.documents.map(({metadata,fields,...doc})=>doc), nodes: atlas.nodes.map(({variants,...node})=>({...node,variants:[]})), edges: atlas.edges.map(({record,fields,evidence,...edge})=>({...edge, record:{source:edge.source,target:edge.target},fields:[],evidence:[]})), paths:[], audit:{}, lightweight:true };
  await writeFile(path.join(dataDirectory, 'overview.json'), JSON.stringify(overview));
  console.log(`Built ${atlas.summary.concepts} concepts from ${atlas.documents.length} source graphs, ${atlas.summary.sourceRelationships} source relationships, ${atlas.summary.bridges} curated bridges`);
}
