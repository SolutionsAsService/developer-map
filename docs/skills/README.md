# Repository skill sources

This package converts the user's FAIKU and PIMP MY SKILL request into two repository-owned Markdown skills with an explicit source/audit trail. It adds no runtime dependencies, global configuration, services or application graph data.

## Entry points

- [FAIKU](../../.agents/skills/faiku/SKILL.md): bounded state/query audit and serialized fault/result protocol.
- [PIMP MY SKILL](../../.agents/skills/pimp-my-skill/SKILL.md): GM-first capability checks, scoped repairs, recoverable knowledge compaction, comment review, dependency-graph execution, attribution and skill authoring.
- [Original request](ORIGINAL-REQUEST.md): preserved user wording, including duplicate numbering and placeholders; not the executable variant.
- [Audit and adaptations](AUDIT.md): every operational difference from the source, including conflicting requirements and host/capability constraints.
- [Literature anchors and coverage](ANCHORS.md): nonlinear backreferencing Mermaid graph, verified source links, local proposed extensions, procedure/resource mapping.
- [Coding-agent prompt](CODING-AGENT-PROMPT.md): anchor-only graph authoring pass followed by a separate skill persistence pass.
- [Validation](VALIDATION.md): checks actually performed and remaining runtime limits.

## Repository integration

Keep both .agents/skills directories and docs/skills together so relative resource links resolve. The chosen uppercase SKILL.md filename is intentional. Use the repository's normal reviewed integration workflow; do not replace unrelated AGENTS.md instructions or modify original application datasets to register these files.

A host that supports .agents/skills may discover these repository sources, but discovery is host-specific. Do not claim these skills are globally installed, registered, or available to a model until that host's inventory/read probe proves it. Explicitly reading a skill file is a valid repository-local invocation when permitted; it is not proof of automatic registration. No Skill Workshop/global skill files are changed by this repository-source package.

GM is the user-identified SolutionsAsService/gm-mcp project. Its separately authorized installation must be verified by the responsible workstream; these skills dynamically probe available tools and do not invent GM commands or capabilities. Running the skill still requires the relevant task authority, tool permissions, and actual host access.

The shared graph is an editorial workflow map over established literature, not a scientific citation graph. Its Hoare Logic and Popper/Falsifiability nodes are local proposed extensions, not changes submitted to the external reference. Nothing here claims model self-checking is formal verification.

Integrator output: [rendered anchor graph](anchors.svg). Recheck the local document contracts with `node scripts/validate-skills.mjs`. This uses existing Node APIs and adds no dependency.
