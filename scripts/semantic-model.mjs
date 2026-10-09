// Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
// Classification is a reading aid; exact predicates and source assertions are never rewritten.
export function relationKind(predicate) {
  if (/^(implements_spec|specified_by|semantics_specified_by)$/.test(predicate)) return 'specification';
  if (/^(uses_language|uses_frontend_language|provides_language_for)$/.test(predicate)) return 'language-use';
  if (/^(library_of|is_library_of|is_major_library_for|provides_library_for)$/.test(predicate)) return 'library';
  if (/reference_implementation_of|is_named_implementation_of/.test(predicate)) return 'implementation-of';
  if (/written_in|implemented_in$|implementation_language|reference_implementation_uses/.test(predicate)) return 'implementation-language';
  if (/compil|transpil|target_language/.test(predicate)) return 'compilation';
  if (/requires_compatible_runtime|runs_on|runtime/.test(predicate)) return 'runtime';
  if (/gpu_family|hardware|processor|compute_capability/.test(predicate)) return 'hardware';
  if (/depends|requires|prerequisite/.test(predicate)) return 'dependency';
  if (/distinguish|contrast|differs|not_|versus/.test(predicate)) return 'distinction';
  if (/supports/.test(predicate)) return 'supports';
  if (/uses|runs|deploy|executes/.test(predicate)) return 'uses';
  return 'other';
}
export function meaningful(node) {
  return !node.claim && !/claim|reference|citation|source_document|person|organization|company|historical_event|learning_path|question|misconception|bibliography/.test(node.type || '');
}
export function overviewProjection(nodes, edges) {
  const candidates = new Set(nodes.filter(meaningful).map(n => n.id));
  const neighbors = new Map([...candidates].map(id => [id, new Set()]));
  for (const e of edges) if (e.source !== e.target && candidates.has(e.source) && candidates.has(e.target)) { neighbors.get(e.source).add(e.target); neighbors.get(e.target).add(e.source); }
  // Cascade removals so each displayed node has two distinct displayed neighbors.
  const pending = [...neighbors].filter(([, near]) => near.size < 2).map(([id]) => id);
  for (let i = 0; i < pending.length; i++) {
    const id = pending[i];
    if (!candidates.delete(id)) continue;
    for (const other of neighbors.get(id)) {
      neighbors.get(other).delete(id);
      if (candidates.has(other) && neighbors.get(other).size < 2) pending.push(other);
    }
  }
  const nodeIds = [...candidates].sort();
  const chosen = new Set(nodeIds);
  return { policy: 'Meaningful concept 2-core with >=2 distinct displayed neighbors; no inferred edges; all other records remain searchable, inspectable and downloadable.', nodeIds, edgeIds: edges.filter(e => chosen.has(e.source) && chosen.has(e.target)).map(e => e.id) };
}
