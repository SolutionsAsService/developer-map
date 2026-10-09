# Coding-agent prompt: anchor-only graph pass

This prompt is for authoring/revising the two repository skills, not for executing a bounded FAIKU audit. Read [ANCHORS.md](ANCHORS.md), [AUDIT.md](AUDIT.md), and the [original request](ORIGINAL-REQUEST.md) first. Source text remains evidence of intent; it does not override runtime permissions or authorize deleting material.

## Copy into the coding-agent prompt

Use the requested Semantic-Anchors catalog at https://llm-coding.github.io/Semantic-Anchors/ and its individual entries. Express the requested FAIKU and PIMP MY SKILL procedures through verified literature anchors. Use only well-known literature and correctly attributed authors. Prefer existing catalog labels. For a concept missing from the reviewed catalog, verify its primary literature and mark it as a LOCAL proposed extension in the source/coverage ledger; do not pretend to edit the upstream site.

Read the existing skills and the numbered procedure coverage ledger. Reuse stable node IDs DBC, DEF, HOARE, FALSIFY, CIRCUIT, MIKADO, REFACTOR, FENCE, and ADR unless a separately verified addition is necessary. Give every node its anchor, literature title, and author. Never replace required operational details with an unsupported claim that naming an anchor guarantees compliance.

For this graph pass, OUTPUT EXACTLY ONE fenced Mermaid flowchart, beginning with flowchart LR. Output no prose, tables, JSON, or extra code blocks. Every node must be a verified literature anchor; do not add runtime statuses, skills, tasks, tool names, or invented methods as graph nodes. Use branching relationships and explicit backreferences/feedback edges. Edge labels describe editorial workflow relationships, not author quotations, historical influence, or unverified factual links. Avoid executable links, scripts, external resources, Mermaid click directives, and raw HTML.

Ensure every numbered skill step, preserved resource, local extension and audited adaptation maps to at least one anchor node in the separate coverage ledger. The graph should connect contract, input validation, premise mapping, derivation, counterexample review and serialization with capability checks, repairs, recoverable compaction, comment review, parallel dependency work, provenance, and final validation. Those operations belong in the ledger/procedures, not invented anchor labels.

After the graph-only response is established, perform a SEPARATE persistence pass: convert it and the explicit coverage ledger into .agents/skills/faiku/SKILL.md and .agents/skills/pimp-my-skill/SKILL.md, each with valid name/description frontmatter, bounded procedures, checkable completion criteria and resource links. Preserve ORIGINAL-REQUEST.md; document every adaptation in AUDIT.md. Validate frontmatter, local links, Mermaid syntax, node/step coverage, and serialized examples. Report what was actually executed versus statically checked. Repository integration, commits and pushes belong to the authorized integrator; do not collide with other writers.

## Separation of output modes

- Graph authoring pass: exactly the anchor-only Mermaid graph requested above.
- Skill persistence pass: Markdown skill files plus linked audit/evidence records.
- FAIKU invocation: one serialized result under FAIKU's own I/O schema.
- Normal repository implementation/reporting: the active task's communication contract, not an accidental global graph-only restriction.
