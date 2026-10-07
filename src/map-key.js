(function () {
  const domains = [
    { id: "vm", label: "Virtual machines", color: "#f8bf80" },
    { id: "containerization", label: "Containerization", color: "#75e0d4" },
    { id: "docker", label: "Docker", color: "#86bff5" },
    { id: "kubernetes", label: "Kubernetes", color: "#c4b0fa" },
    {"id":"operating_system","label":"Operating systems","color":"#f0d575"},
    {"id":"optical_disc_image","label":"Optical disc images","color":"#efa7cd"},
    {"id":"python_language","label":"Python","color":"#91d795"},
    {"id":"sandbox_computer_security","label":"Security sandboxes","color":"#f49f83"},
    {"id":"system_image","label":"System images","color":"#83d5e2"},
    {"id":"volume_computing","label":"Storage volumes","color":"#b5c6ef"},
    {"id":"neutral","label":"Other / unclassified","color":"#a1a9b4"},
    { id: "source", label: "Sources / claims", color: "#839ba7" },
  ];
  const relationships = [
    {
      id: "workflow",
      label: "Runs / uses →",
      color: "#88d9f4",
      dash: [],
      arrow: "filled",
      description:
        "The source records a directed use, execution, or deployment relationship.",
    },
    {
      id: "orchestration",
      label: "Manages →",
      color: "#c4b0fa",
      dash: [],
      arrow: "filled",
      description: "The source records directed management or orchestration.",
    },
    {
      id: "dependency",
      label: "Requires →",
      color: "#f8bf80",
      dash: [8, 4],
      arrow: "open",
      description:
        "The source records a prerequisite or dependency, not a claim of physical causation.",
    },
    {
      id: "structure",
      label: "Part / type",
      color: "#75e0d4",
      dash: [],
      description: "Membership, classification, or system structure.",
    },
    {
      id: "editorial",
      label: "Editorial →",
      color: "#d5ff70",
      dash: [5, 4],
      arrow: "open",
      description: "Reviewed semantic connection, not an original source edge.",
    },
    {
      id: "comparison",
      label: "Contrast",
      color: "#f4a6a2",
      dash: [9, 3, 2, 3],
      description: "A recorded distinction or contrast.",
    },
    {
      id: "evidence",
      label: "Source / support",
      color: "#839ba7",
      dash: [2, 5],
      description: "Provenance or supporting source relationship.",
    },
    {
      id: "related",
      label: "Other link",
      color: "#8fa8b6",
      dash: [1, 6],
      description:
        "Other recorded relation; inspect its original verb and context.",
    },
  ];
  const domainById = new Map(domains.map((domain) => [domain.id, domain]));
  const relationshipById = new Map(
    relationships.map((relationship) => [relationship.id, relationship]),
  );

  function groupOf(node) {
    if (
      node.claim ||
      /^ref_|^claim_/i.test(node.originalId || node.id) ||
      /reference|bibliograph|source.document/i.test(node.type)
    )
      return "source";
    const topics = node.topics || [];
    if (topics.includes("kubernetes")) return "kubernetes";
    if (topics.includes("docker")) return "docker";
    if (topics.includes("containerization")) return "containerization";
    if (topics.includes("virtual_machine")) return "vm";
    return topics.find(topic => domainById.has(topic)) || "neutral";
  }

  function classify(edge) {
    if (edge.curated)
      return {
        id: "editorial",
        label: "Editorial →",
        color: "#d5ff70",
        dash: [5, 4],
        arrow: "open",
        description:
          "Reviewed semantic connection, not an original source edge.",
      };
    const relation = String(edge.relation || "").toLowerCase();
    if (/cit|support|source|provenance|bibliograph|document/.test(relation))
      return relationshipById.get("evidence");
    if (/contrast|distingui|compared|versus|differs/.test(relation))
      return relationshipById.get("comparison");
    if (
      /^(manages|orchestrates|schedules|controls|reconciles|scales|coordinates|deploys)$/.test(
        relation,
      )
    )
      return relationshipById.get("orchestration");
    if (
      /^(runs|runs_on|runs_in|uses|executes|implements|creates|builds|performs|operates|instantiates|packages)$/.test(
        relation,
      )
    )
      return relationshipById.get("workflow");
    if (/^(requires|depends_on|relies_on|needs|enabled_by)$/.test(relation))
      return relationshipById.get("dependency");
    if (
      /part_of|subtype|type_of|includes|contains|consists|component|classifies|is_a/.test(
        relation,
      )
    )
      return relationshipById.get("structure");
    return relationshipById.get("related");
  }

  window.DeveloperMapKey = {
    domains,
    relationships,
    domainById,
    groupOf,
    classify,
  };
})();
