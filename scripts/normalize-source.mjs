// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Source evidence, not workflow literature, determines graph relationships.
export const documentTitle = (data, fallback) => data.subject || data.title || data.topic || data.metadata?.title || data.source?.title || fallback;
export function relationshipEntries(data) {
  return ['edges', 'relationships', 'rich_semantic_relationships'].flatMap(section =>
    (data[section] || []).map((record, index) => ({ section, index, record })));
}
export function normalizePath(record, data, resolve) {
  const sequence = record.sequence ?? record.ordered_nodes;
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
