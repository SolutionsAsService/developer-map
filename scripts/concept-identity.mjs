import { claimEntries } from './extract-concepts.mjs';
import { aliasGroups, forcedScopes } from './concept-curation.mjs';
export const graphIdFor = file => file.split('_full_')[0];
const labelKey = node => String(node.label || node.id).trim().toLowerCase().replace(/\s+/g, ' ');
const sortedObject = entries => Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));

export function createIdentityResolver(documents, groups = aliasGroups, scopes = forcedScopes) {
  const records = new Map();
  const identities = new Map();
  const protectedKeys = new Set();
  for (const { file, data } of documents) {
    const graph = graphIdFor(file);
    const claims = claimEntries(data);
    for (const node of data.nodes) {
      if (!node.id) throw new Error('Source node missing an ID');
      const key = graph + ':' + node.id;
      if (records.has(key)) throw new Error('Duplicate source node: ' + key);
      records.set(key, node);
      if (!identities.has(node.id)) identities.set(node.id, new Set());
      identities.get(node.id).add(labelKey(node));
      if (/^(claim_|ref_)/.test(node.id) || /claim|reference|citation|source_document/.test(node.type || '')) protectedKeys.add(key);
    }
    for (const claim of claims) {
      const key = graph + ':' + claim.id;
      if (!records.has(key)) records.set(key, claim);
      protectedKeys.add(key);
    }
  }
  const explicit = new Map();
  const canonicalLabels = new Map();
  for (const group of groups) {
    if (!group.rationale || group.members.length < 2) throw new Error('Alias group requires rationale and members');
    canonicalLabels.set(group.id, group.label);
    for (const key of group.members) {
      if (!records.has(key)) throw new Error('Unknown alias member: ' + key);
      if (protectedKeys.has(key)) throw new Error('Claims and references cannot merge: ' + key);
      if (explicit.has(key)) throw new Error('Repeated alias member: ' + key);
      explicit.set(key, group.id);
    }
  }
  const sourceIds = new Map();
  const oldCandidates = new Map();
  const bareCandidates = new Map();
  function candidate(map, key, value) {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(value);
  }
  for (const [key, node] of records) {
    const oldId = /^(claim_|ref_)/.test(node.id) || identities.get(node.id)?.size > 1 ? key : node.id;
    const id = protectedKeys.has(key) ? key : explicit.get(key) || scopes[key]?.id || (['c_language', 'cpp_programming_language', 'cuda', 'ruby_on_rails'].includes(key.split(':')[0]) || identities.get(node.id)?.size > 1 ? key : node.id);
    sourceIds.set(key, id);
    candidate(oldCandidates, oldId, id);
    candidate(bareCandidates, node.id, id);
    if (scopes[key]) canonicalLabels.set(id, scopes[key].label);
  }
  // Never let a source-qualified alias overwrite a different canonical concept.
  const canonicalIds = new Set(sourceIds.values());
  for (const [key, id] of sourceIds) {
    if (canonicalIds.has(key) && key !== id) throw new Error('Canonical/source alias collision: ' + key);
  }
  const aliases = new Map();
  const ambiguous = new Map();
  for (const [key, candidates] of [...bareCandidates, ...oldCandidates]) {
    if (candidates.size === 1) {
      const id = [...candidates][0];
      if (key !== id && !canonicalIds.has(key)) aliases.set(key, id);
    } else if (!canonicalIds.has(key)) ambiguous.set(key, [...candidates].sort());
  }
  for (const [key, id] of sourceIds) if (key !== id) aliases.set(key, id);
  return {
    resolve(file, id) {
      const key = graphIdFor(file) + ':' + id;
      if (!sourceIds.has(key)) throw new Error('Unknown source endpoint: ' + key);
      return sourceIds.get(key);
    },
    canonicalLabels,
    aliases: sortedObject(aliases),
    ambiguousAliases: sortedObject(ambiguous),
    sourceNodeMap: sortedObject(sourceIds),
    protectedKeys
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
