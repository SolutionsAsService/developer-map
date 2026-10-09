// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Source evidence, not workflow literature, determines graph relationships.
export const isSourceFile = file => file.endsWith('.json') && !['atlas.json', 'overview.json'].includes(file);
export const documentTitle = (data, fallback) => { const title = data.subject || data.title || data.topic || data.metadata?.title || data.source?.title || fallback; return typeof title === 'string' ? title : title.label || title.name || title.title || fallback; };
export const relationshipPredicate = record => record.relation || record.relationship || record.type || 'related to';
export function pathRecord(record, data) {
  if (typeof record !== 'string') return record;
  const target = data.nodes.find(node => node.id === record && node.type === 'learning_path');
  if (!target) throw new Error('Unknown learning-path reference: ' + record);
  return target;
}
export function relationshipEntries(data) {
  return ['edges', 'relationships', 'rich_semantic_relationships'].flatMap(section =>
    (() => { if (data[section] != null && !Array.isArray(data[section])) throw new Error('Expected relationship array at /' + section); return (data[section] || []).map((record, index) => ({ section, index, record })); })());
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
