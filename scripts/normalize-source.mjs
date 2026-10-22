// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Source evidence, not workflow literature, determines graph relationships.
// Adapters normalize the heterogeneous uploaded JSON shapes so adding a new
// data file never requires build-code changes; unknown shapes are skipped
// with an explicit audit entry instead of breaking the build.
export const isSourceFile = file => file.endsWith('.json') && !['atlas.json', 'overview.json'].includes(file);
export const documentTitle = (data, fallback) => {
  const title = data.subject ?? data.title ?? data.topic ?? data.canonical_name ?? data.metadata?.title ?? data.source?.title ?? data.graph_metadata?.title ?? data.schema_metadata?.title ?? data.artifact?.title ?? data.schema?.name ?? data.description ?? fallback;
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object') return title.label || title.name || title.title || title.canonical_name || fallback;
  return fallback;
};
export const graphKey = file => file.replace(/\.json$/, '');
const pick = (record, keys) => keys.map(key => record[key]).find(value => typeof value === 'string' && value.length);
export const relationshipSource = record => pick(record, ['source', 'subject', 'from']);
export const relationshipTarget = record => pick(record, ['target', 'object', 'to']);
export const relationshipPredicate = record => record.relation || record.relationship || record.predicate || record.type || 'related to';
// Normalize uploaded node records to the id/label/type shape; original bytes stay in the variant record.
export function normalizeNode(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  if (typeof record.id === 'string' && record.label != null) return record;
  const raw = record.id ?? record.name ?? record.canonical_name;
  const id = typeof raw === 'number' ? String(raw) : raw;
  return { ...record, id, label: record.label ?? record.name ?? record.canonical_name ?? record.title ?? id, type: record.type ?? record.entity_type };
}
// Readable label for an endpoint that only exists as an ID ("tcp_ip" -> "tcp ip").
export const humanizeId = id => String(id).replace(/^[a-z]+[:.](?=\w)/i, '').replace(/[_\-]+/g, ' ').trim() || String(id);
// Node arrays in upload order: nodes or entities, single-record documents,
// and documents whose graph edges reference id/name-only concept lists.
export function sourceNodeList(data) {
  if (Array.isArray(data.nodes)) return data.nodes.map(normalizeNode);
  if (Array.isArray(data.entities)) {
    const nodes = data.entities.map(normalizeNode);
    const known = new Set(nodes.map(node => node.id));
    // Records referenced by relationships but stored in separate registers
    // (cited sources, architecture patterns) join the graph as typed records.
    for (const register of ['source_register', 'source_records', 'sources', 'architecture_patterns']) {
      for (const record of Array.isArray(data[register]) ? data[register] : []) {
        const id = record?.id;
        if (typeof id !== 'string' || known.has(id)) continue;
        known.add(id);
        nodes.push(normalizeNode({ type: register === 'architecture_patterns' ? 'architecture_pattern' : 'source_document', ...record }));
      }
    }
    return nodes;
  }
  if (typeof data.id === 'string' && (data.canonical_name || data.name)) {
    const { graph_edges, related_concepts, people, people_and_research, organisations_and_projects, history, ...rest } = data;
    const nodes = [normalizeNode(rest)];
    const seen = new Set([rest.id]);
    const add = record => {
      const id = record?.id ?? record?.name;
      if (typeof id !== 'string' || seen.has(id)) return;
      seen.add(id);
      nodes.push(normalizeNode(record.type || record.entity_type ? record : { ...record, type: record.role ? 'person' : 'concept' }));
    };
    (related_concepts || []).forEach(add);
    (people || people_and_research || []).forEach(add);
    (organisations_and_projects || []).forEach(add);
    // People registers name their subjects without ids; graph edges reference
    // them by a person.* identifier derived from the lower-cased name.
    const slugify = text => 'person.' + String(text).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const aliases = new Map(nodes.map(node => [node.id, node]));
    for (const record of [...(people || []), ...(people_and_research || [])]) {
      const derived = record.id || slugify(record.name || '');
      if (derived && !aliases.has(derived)) {
        const node = normalizeNode({ ...record, id: derived, type: 'person' });
        aliases.set(derived, node);
        nodes.push(node);
      }
    }
    // Graph edges may name concepts that appear only as prose elsewhere in the
    // document; add explicit placeholder records instead of dropping the edge.
    for (const edge of graph_edges || []) {
      for (const endpoint of [edge.from, edge.to]) {
        if (typeof endpoint === 'string' && !aliases.has(endpoint)) {
          const node = normalizeNode({ id: endpoint, type: 'referenced_concept', description: 'Referenced by a graph edge but not described elsewhere in the source document.' });
          aliases.set(endpoint, node);
          nodes.push(node);
        }
      }
    }
    return nodes;
  }
  return null;
}
const relationshipArray = (data, section, path) => {
  const value = path.split('/').reduce((item, key) => item?.[key], data);
  if (value == null) return [];
  // A non-array section is skipped (and reported by the build), never fatal.
  if (!Array.isArray(value)) return [];
  return value.map((record, index) => ({ section, index, record }));
};
// Directed relationship arrays in upload order, with their JSON pointer paths.
export function sourceRelationshipSections(data) {
  const sections = [['edges', 'edges'], ['relationships', 'relationships'], ['rich_semantic_relationships', 'rich_semantic_relationships'], ['graph_edges', 'graph_edges'], ['relationship_graph', 'relationship_graph/graph_edges']];
  const found = [];
  for (const [section, pointer] of sections) {
    const entries = relationshipArray(data, section, pointer);
    if (entries.length || data[section] != null) found.push({ section, pointer, entries });
  }
  return found;
}
export function documentNodes(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const listed = sourceNodeList(data);
  if (!listed) return null;
  // Drop records without a usable ID. Repeated IDs are kept; they become extra
  // records of one node.
  const seen = new Set();
  const nodes = [];
  for (const node of listed) {
    if (!node || typeof node !== 'object' || typeof node.id !== 'string' || !node.id) continue;
    seen.add(node.id);
    nodes.push(node);
  }
  // Relationships may name endpoints the file never declares as nodes. Add an
  // explicit placeholder so the edge survives and can join same-named concepts
  // from other files.
  const claimIds = new Set();
  const claims = data.claims || data.source_claims;
  if (Array.isArray(claims)) claims.forEach(claim => typeof claim === 'object' && claim?.id && claimIds.add(claim.id));
  else if (claims && typeof claims === 'object') Object.entries(claims).forEach(([key, claim]) => claimIds.add(claim?.id || key));
  for (const { entries } of sourceRelationshipSections(data)) {
    for (const { record } of entries) {
      if (!record || typeof record !== 'object') continue;
      for (const endpoint of [relationshipSource(record), relationshipTarget(record)]) {
        if (!endpoint || seen.has(endpoint) || claimIds.has(endpoint)) continue;
        seen.add(endpoint);
        nodes.push({ id: endpoint, label: humanizeId(endpoint), type: 'referenced_concept', description: 'Referenced by a relationship but not described as a node in this source file.', placeholder: true });
      }
    }
  }
  return { ...data, nodes };
}
export function documentPathEntries(data) {
  return (Array.isArray(data.learning_paths) ? data.learning_paths : []).map((record, index) => ({ record, pointer: '/learning_paths/' + index }));
}
export function pathRecord(record, data) {
  if (typeof record !== 'string') return record;
  const target = data.nodes.find(node => node.id === record && node.type === 'learning_path');
  if (!target) throw new Error('Unknown learning-path reference: ' + record);
  return target;
}
export function relationshipEntries(data) {
  return sourceRelationshipSections(data).flatMap(({ section, pointer, entries }) => entries.map(entry => ({ section, pointer, ...entry })));
}
export function normalizePath(record, data, resolve) {
  record = pathRecord(record, data);
  const sequence = record.sequence ?? record.ordered_nodes ?? record.steps;
  const isArray = Array.isArray(sequence);
  if (!isArray && typeof sequence !== 'string') throw new Error('Unsupported path sequence: ' + record.id);
  // Arrows delimit prose segments only. Slashes, versus and descriptions remain intact.
  // Resolving a whole exact local ID/label never asserts an edge or bridges a gap.
  const tokens = isArray ? sequence : sequence.split(/\s*(?:->|→)\s*/);
  const segments = tokens.map((text, index) => {
    const exact = data.nodes.find(node => node.id === text);
    const candidates = exact ? [exact] : isArray ? [] : data.nodes.filter(node => !/claim|reference|citation|learning_path|question|misconception/.test(node.type || '') && (String(node.label || '').trim().toLowerCase() === text.trim().toLowerCase() || node.id.toLowerCase() === text.trim().toLowerCase()));
    const unique = [...new Set(candidates.map(node => node.id))];
    if (unique.length === 1) return { index, text, status: 'resolved', sourceId: unique[0], conceptId: resolve(unique[0]), match: exact ? 'exact source ID' : 'exact local label or case-insensitive ID' };
    return { index, text, status: 'unresolved', reason: unique.length ? 'Ambiguous local label' : 'No exact local concept; prose retained', candidates: unique };
  });
  return { sequenceKind: isArray ? 'ids' : 'prose', sequenceText: isArray ? null : sequence, segments,
    steps: segments.filter(segment => segment.status === 'resolved').map(segment => segment.conceptId),
    unresolvedSegments: segments.filter(segment => segment.status === 'unresolved').length,
    transitionPolicy: 'Source order is a learning suggestion, not a relationship. Unresolved segments remain in place; no edges are inferred.' };
}
