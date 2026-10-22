import legacy from './legacy-identities.json' with { type: 'json' };
import { claimEntries } from './extract-concepts.mjs';
import { aliasGroups, forcedScopes, declinedMerges } from './concept-curation.mjs';
import { graphKey } from './normalize-source.mjs';
export const graphIdFor = graphKey;
const labelKey = node => String(node.label || node.id).trim().toLowerCase().replace(/\s+/g, ' ');
const sortedObject = entries => Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));

// Same-concept detection across source files: exact label after case,
// spacing/underscore/hyphen and generic "(programming language)"-style
// qualifiers are normalized. No fuzzy or similarity matching.
const QUALIFIER = /\s*\((?:[^()]*\b)?(?:programming language|language|software|computing|protocol|operating system|company|organi[sz]ation|framework|library|file format|data structure|concept|technology)\)\s*$/i;
const normalized = text => String(text).trim().toLowerCase().replace(/[\s_\-]+/g, ' ').trim();
export const conceptKey = node => normalized(String(node.label ?? node.id ?? '').replace(QUALIFIER, ''));
// "Transmission Control Protocol (TCP)" is also known by its acronym and its expansion.
export function conceptKeys(node) {
  // Acronyms match case-sensitively: "POD" (Plain Old Documentation) is not a
  // Kubernetes "Pod", and "HTTP" is not Python's lowercase "http" module.
  // Relationship-only placeholders ("dns" from an ID) may match either way.
  const label = String(node.label ?? '').trim();
  const isAcronym = /^[A-Z][A-Z0-9/.+#-]{1,9}$/.test(label);
  const key = conceptKey(node);
  const keys = new Set(key && (!isAcronym || node.placeholder) ? [key] : []);
  const acronym = label.match(/^(.+?)\s*\(([A-Z][A-Z0-9/.+#-]{1,9})\)\s*$/);
  if (acronym) { keys.add(normalized(acronym[1])); keys.add('acronym:' + acronym[2]); }
  if (isAcronym) keys.add('acronym:' + label);
  if (node.placeholder && key && !/\s/.test(key)) keys.add('acronym:' + key.toUpperCase());
  return [...keys];
}
// Section-like labels that name a facet of each file's subject, not one shared concept.
const GENERIC = new Set(['history', 'overview', 'introduction', 'summary', 'definition', 'description', 'example', 'examples', 'applications', 'advantages', 'disadvantages', 'limitations', 'criticism', 'features', 'see also', 'references', 'types', 'usage', 'uses', 'design', 'implementation', 'implementations', 'architecture', 'origin', 'etymology', 'future', 'other', 'misc', 'unknown', 'none', 'n/a', 'root', 'main', 'core', 'basics', 'notes', 'related concepts', 'key concepts']);
// Single words with several technical meanings (CUDA host vs network host,
// switch statement vs network switch); these stay per-file unless reviewed.
const AMBIGUOUS = new Set(['host', 'routing', 'protocol', 'kernel', 'node', 'data', 'image', 'volume', 'service', 'cluster', 'namespace', 'container', 'package', 'module', 'frame', 'port', 'stack', 'heap', 'channel', 'pipeline', 'block', 'register', 'instance', 'layer', 'graph', 'record', 'field', 'table', 'key', 'signature', 'transaction', 'agent', 'switch', 'bridge', 'mirror', 'seed', 'worker', 'job', 'task', 'event', 'scope', 'context', 'target', 'source', 'binding', 'link', 'address', 'mode', 'state', 'resource', 'environment', 'platform', 'engine', 'driver', 'session', 'token', 'segment', 'cell', 'word', 'unit', 'element', 'entity', 'value', 'index', 'shell', 'window', 'pool', 'store', 'filter', 'rule', 'policy', 'version', 'release', 'tool', 'device', 'system', 'application', 'program']);
// Evidence records (claims, citations) are never concepts. "reference_implementation" is a concept.
const EVIDENCE_TYPE = /claim|(^|_)references?($|_(?!impl))|citation|source_document/;
const NEVER_MERGED_TYPE = new RegExp(EVIDENCE_TYPE.source + '|bibliograph|learning_path|question|misconception|quote|^section$');
const isPerson = type => /person|people|author|inventor|researcher|scientist|individual/.test(type || '');
const slugFor = key => key.replace(/\+/g, 'p').replace(/#/g, 'sharp').replace(/[^a-z0-9.]+/g, '_').replace(/^_+|_+$/g, '') || 'concept';

export function createIdentityResolver(documents, groups = aliasGroups, scopes = forcedScopes, declined = declinedMerges) {
  const records = new Map();
  const identities = new Map();
  const protectedKeys = new Set();
  const issues = [];
  for (const { file, data } of documents) {
    const graph = graphIdFor(file);
    const claims = claimEntries(data);
    for (const node of data.nodes) {
      if (typeof node?.id !== 'string' || !node.id) { issues.push({ file, issue: 'Source node missing an ID; skipped' }); continue; }
      const key = graph + ':' + node.id;
      if (records.has(key)) { issues.push({ file, key, issue: 'Duplicate source node ID; first record kept' }); continue; }
      records.set(key, node);
      if (!identities.has(node.id)) identities.set(node.id, new Set());
      identities.get(node.id).add(labelKey(node));
      if (/^(claim_|ref_)/.test(node.id) || EVIDENCE_TYPE.test(node.type || '')) protectedKeys.add(key);
    }
    for (const claim of claims) {
      const key = graph + ':' + claim.id;
      if (!records.has(key)) records.set(key, claim);
      protectedKeys.add(key);
    }
  }
  // Reviewed alias groups. Members whose file was removed or renamed are
  // reported and ignored so curation can never break a build.
  const explicit = new Map();
  const canonicalLabels = new Map();
  for (const group of groups) {
    if (!group.rationale || group.members.length < 2) throw new Error('Alias group requires rationale and members');
    canonicalLabels.set(group.id, group.label);
    for (const key of group.members) {
      if (protectedKeys.has(key)) throw new Error('Claims and references cannot merge: ' + key);
      if (!records.has(key)) { issues.push({ key, issue: 'Alias member not found in any source file; ignored', group: group.id }); continue; }
      if (explicit.has(key)) { issues.push({ key, issue: 'Repeated alias member; first group kept', group: group.id }); continue; }
      explicit.set(key, group.id);
    }
  }
  // Pre-merge identity of every record: reviewed group, forced scope, legacy ID or the source-scoped key.
  const preIds = new Map();
  for (const key of records.keys()) {
    preIds.set(key, protectedKeys.has(key) ? key : explicit.get(key) || scopes[key]?.id || legacy.sourceNodeMap[key] || key);
    if (scopes[key]) canonicalLabels.set(scopes[key].id, scopes[key].label);
  }
  // Units are pre-merge identities; same-concept units are unioned below.
  const units = new Map();
  for (const [key, preId] of preIds) {
    if (!units.has(preId)) units.set(preId, { id: preId, keys: [], conceptKeys: new Set(), person: false, fixed: false, declined: new Map() });
    const unit = units.get(preId), node = records.get(key);
    unit.keys.push(key);
    if (protectedKeys.has(key) || scopes[key] || NEVER_MERGED_TYPE.test(node.type || '')) unit.fixed = true;
    if (isPerson(node.type)) unit.person = true;
    for (const concept of conceptKeys(node)) if (!GENERIC.has(concept) && !AMBIGUOUS.has(concept)) unit.conceptKeys.add(concept);
  }
  // Reviewed "do not merge" sets: units naming different IDs of one set never join.
  declined.forEach(({ ids }, index) => ids.forEach(id => {
    const unit = units.get(id) || units.get(preIds.get(id));
    if (unit) unit.declined.set(index, id);
  }));
  const parent = new Map([...units.keys()].map(id => [id, id]));
  const find = id => { while (parent.get(id) !== id) { parent.set(id, parent.get(parent.get(id))); id = parent.get(id); } return id; };
  const clusters = new Map([...units.values()].map(unit => [unit.id, { person: unit.person, declined: new Map(unit.declined) }]));
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return;
    const ca = clusters.get(ra), cb = clusters.get(rb);
    if (ca.person !== cb.person) return;
    for (const [set, id] of cb.declined) if (ca.declined.has(set) && ca.declined.get(set) !== id) return;
    for (const [set, id] of cb.declined) ca.declined.set(set, id);
    parent.set(rb, ra);
  }
  const byConcept = new Map();
  for (const unit of [...units.values()].sort((a, b) => a.id.localeCompare(b.id))) {
    if (unit.fixed) continue;
    for (const concept of unit.conceptKeys) {
      if (!byConcept.has(concept)) byConcept.set(concept, []);
      byConcept.get(concept).push(unit.id);
    }
  }
  for (const concept of [...byConcept.keys()].sort()) {
    const [first, ...rest] = byConcept.get(concept);
    for (const id of rest) union(first, id);
  }
  // Canonical ID per merged cluster: a reviewed alias-group ID when present,
  // otherwise one derived from the label. Replaced IDs stay as aliases, so
  // older deep links keep resolving.
  const reviewed = new Set(groups.map(group => group.id));
  const members = new Map();
  for (const id of units.keys()) {
    const rootId = find(id);
    if (!members.has(rootId)) members.set(rootId, []);
    members.get(rootId).push(units.get(id));
  }
  const taken = new Set([...units.keys(), ...records.keys()]);
  const finalIds = new Map();
  const autoMerges = [];
  for (const rootId of [...members.keys()].sort()) {
    const group = members.get(rootId);
    if (group.length === 1) { finalIds.set(group[0].id, group[0].id); continue; }
    const keys = group.flatMap(unit => unit.keys).sort();
    const labels = new Map();
    for (const key of keys) {
      const label = String(records.get(key).label ?? records.get(key).id).trim();
      labels.set(label, (labels.get(label) || 0) + 1);
    }
    const reviewedLabel = group.map(unit => reviewed.has(unit.id) && canonicalLabels.get(unit.id)).find(Boolean);
    const label = reviewedLabel || [...labels].sort((a, b) => b[1] - a[1] || (/[A-Z]/.test(b[0]) - /[A-Z]/.test(a[0])) || a[0].localeCompare(b[0]))[0][0];
    const curated = group.filter(unit => reviewed.has(unit.id) && !unit.id.includes(':')).sort((a, b) => b.keys.length - a.keys.length || a.id.localeCompare(b.id));
    let id = curated[0]?.id;
    if (!id) {
      const base = slugFor(conceptKey({ label: label.replace(/\s*\([A-Z][A-Z0-9/.+#-]{1,9}\)\s*$/, '') }));
      id = base;
      for (let n = 2; taken.has(id) && !group.some(unit => unit.id === id); n++) id = base + '_' + n;
      taken.add(id);
    }
    if (!canonicalLabels.has(id)) canonicalLabels.set(id, label);
    for (const unit of group) finalIds.set(unit.id, id);
    autoMerges.push({ id, label, members: keys });
  }
  const sourceIds = new Map([...preIds].map(([key, preId]) => [key, finalIds.get(preId)]));
  const oldCandidates = new Map();
  const bareCandidates = new Map();
  function candidate(map, key, value) {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(value);
  }
  for (const [key, node] of records) {
    const id = sourceIds.get(key);
    const oldId = /^(claim_|ref_)/.test(node.id) || identities.get(node.id)?.size > 1 ? key : node.id;
    candidate(oldCandidates, oldId, id);
    if (legacy.sourceNodeMap[key]) candidate(oldCandidates, legacy.sourceNodeMap[key], id);
    candidate(bareCandidates, node.id, id);
  }
  // Never let a source-qualified alias overwrite a different canonical concept.
  const canonicalIds = new Set(sourceIds.values());
  for (const [key, id] of sourceIds) {
    if (canonicalIds.has(key) && key !== id) issues.push({ key, issue: 'Canonical/source alias collision; alias not published' });
  }
  const aliases = new Map();
  const ambiguous = new Map();
  for (const [key, candidates] of [...bareCandidates, ...oldCandidates]) {
    if (candidates.size === 1) {
      const id = [...candidates][0];
      if (key !== id && !canonicalIds.has(key)) aliases.set(key, id);
    } else if (!canonicalIds.has(key)) ambiguous.set(key, [...candidates].sort());
  }
  for (const [key, id] of sourceIds) if (key !== id && !canonicalIds.has(key)) aliases.set(key, id);
  // Earlier canonical IDs that were merged into another concept keep resolving.
  for (const [preId, id] of finalIds) if (preId !== id && !canonicalIds.has(preId)) aliases.set(preId, id);
  return {
    resolve(file, id) {
      return sourceIds.get(graphIdFor(file) + ':' + id);
    },
    canonicalLabels,
    aliases: sortedObject(aliases),
    ambiguousAliases: sortedObject(ambiguous),
    sourceNodeMap: sortedObject(sourceIds),
    protectedKeys,
    autoMerges,
    issues
  };
}

export function connectivity(nodes, edges) {
  const adjacency = new Map(nodes.map(node => [node.id, new Set()]));
  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) throw new Error('Dangling edge: ' + edge.id);
    adjacency.get(edge.source).add(edge.target);
    adjacency.get(edge.target).add(edge.source);
  }
  const seen = new Set();
  const components = [];
  for (const id of [...adjacency.keys()].sort()) {
    if (seen.has(id)) continue;
    const members = [], queue = [id];
    seen.add(id);
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      members.push(current);
      for (const next of adjacency.get(current)) if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
    components.push(members.sort());
  }
  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  return { componentCount: components.length, componentSizes: components.map(component => component.length), isolatedNodeIds: [...adjacency].filter(([, neighbors]) => !neighbors.size).map(([id]) => id).sort(), components };
}
