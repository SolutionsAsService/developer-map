(function () {
  const domains = [
    { id: 'vm', label: 'Virtual machines', color: '#f8bf80' },
    { id: 'containerization', label: 'Containerization', color: '#75e0d4' },
    { id: 'docker', label: 'Docker', color: '#86bff5' },
    { id: 'kubernetes', label: 'Kubernetes', color: '#c4b0fa' },
    { id: 'source', label: 'Sources / claims', color: '#839ba7' }
  ];
  const relationships = [
    { id: 'workflow', label: 'Runs / uses →', color: '#88d9f4', dash: [], arrow: 'filled', description: 'The source records a directed use, execution, or deployment relationship.' },
    { id: 'orchestration', label: 'Manages →', color: '#c4b0fa', dash: [], arrow: 'filled', description: 'The source records directed management or orchestration.' },
    { id: 'dependency', label: 'Requires →', color: '#f8bf80', dash: [8, 4], arrow: 'open', description: 'The source records a prerequisite or dependency, not a claim of physical causation.' },
    { id: 'structure', label: 'Part / type', color: '#75e0d4', dash: [], description: 'Membership, classification, or system structure.' },
    { id: 'identity', label: 'Same platform', color: '#a1e9ae', dash: [3, 5], description: 'Explicitly curated alias bridge, not an original source edge.' },
    { id: 'comparison', label: 'Contrast', color: '#f4a6a2', dash: [9, 3, 2, 3], description: 'A recorded distinction or contrast.' },
    { id: 'evidence', label: 'Source / support', color: '#839ba7', dash: [2, 5], description: 'Provenance or supporting source relationship.' },
    { id: 'related', label: 'Other link', color: '#8fa8b6', dash: [1, 6], description: 'Other recorded relation; inspect its original verb and context.' }
  ];
  const domainById = new Map(domains.map(domain => [domain.id, domain]));
  const relationshipById = new Map(relationships.map(relationship => [relationship.id, relationship]));

  function groupOf(node) {
    if (node.claim || /^ref_|^claim_/i.test(node.originalId || node.id) || /reference|bibliograph|source.document/i.test(node.type)) return 'source';
    const topics = node.topics || [];
    if (topics.includes('kubernetes')) return 'kubernetes';
    if (topics.includes('docker')) return 'docker';
    if (topics.includes('containerization')) return 'containerization';
    return 'vm';
  }

  function classify(edge) {
    if (edge.curated) return relationshipById.get('identity');
    const relation = String(edge.relation || '').toLowerCase();
    if (/cit|support|source|provenance|bibliograph|document/.test(relation)) return relationshipById.get('evidence');
    if (/contrast|distingui|compared|versus|differs/.test(relation)) return relationshipById.get('comparison');
    if (/^(manages|orchestrates|schedules|controls|reconciles|scales|coordinates|deploys)$/.test(relation)) return relationshipById.get('orchestration');
    if (/^(runs|runs_on|runs_in|uses|executes|implements|creates|builds|performs|operates|instantiates|packages)$/.test(relation)) return relationshipById.get('workflow');
    if (/^(requires|depends_on|relies_on|needs|enabled_by)$/.test(relation)) return relationshipById.get('dependency');
    if (/part_of|subtype|type_of|includes|contains|consists|component|classifies|is_a/.test(relation)) return relationshipById.get('structure');
    return relationshipById.get('related');
  }

  window.DeveloperMapKey = { domains, relationships, domainById, groupOf, classify };
})();
