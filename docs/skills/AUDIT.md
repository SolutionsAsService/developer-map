# Source-to-executable adaptation ledger

Status: repository-owned implementation of the supplied writing request, with the differences below made explicit for review. The [original wording](ORIGINAL-REQUEST.md) remains separate and uncorrected. These adaptations do not retroactively change what the user wrote. Adding source Markdown is not proof of host registration, formal verification, successful GM installation, or permission to run every described maintenance action.

## Source preservation

The archived message retains the user's wording, spelling, duplicate INVARIANT 3, absent INVARIANT 6, “(insert ur github)” placeholder, path spelling, and Copy line. CR message line endings were normalized to LF and a final newline added for Markdown. The first 4,000 characters were recovered from session history; its display truncated the rest, so the remainder was transcribed from the full inherited user message. Consequently this is a text-preserving transcription, **not a claim of byte-identical transport preservation**. Neither typo fixes nor executable instructions were inserted into that archive.

## Decisions

| ID | Original demand or tension | Explicit executable adaptation | Procedure / anchor mapping |
|---|---|---|---|
| A1 | Deterministic isolated sandbox; physical inability to emit unmapped tokens | Treat as a desired bounded audit protocol, not an actual property of an LLM runtime. No sandbox or formal prover is installed by a skill file. | F1, F4; DBC, HOARE |
| A2 | Bracketed fault strings versus serialized-output-only | Put the exact fault label in a JSON marker field. Use one strict schema, optional requested YAML/table equivalents, and a minimal serialized IO_FAULT fallback. | F2, F3, F6; DBC, DEF |
| A3 | Boolean derivation and falsification guarantee | Require explicit premises/rules and a concise checkable justification. Unknown is not false; an unrefuted answer is not a proof. Complex unavailable verification yields an explicit fault, not invented certainty. | F3–F5; HOARE, FALSIFY |
| A4 | Always GM, but invariant 4 explicitly permits manual work during GM friction | Prefer discovered working GM and pass capability status to children. Probe dynamically; expose unavailable/degraded status and use the already-requested permitted manual fallback. No guessed commands or grep/find substitution. | P1; DBC, DEF, CIRCUIT |
| A5 | Every friction immediately spawns GM repairs; pushed changes supposedly cascade | One tracked repair per unique evidenced defect; use verified Windows/installation host and authorized write scope. Confirm tests, revision and runtime exposure after delivery. A push is not a reload proof. | P2; MIKADO, CIRCUIT, ADR, DEF |
| A6 | AGENTS.md over “30kb”; review all notes, memories and all logs | Use 30,000 UTF-8 bytes as an explicit local threshold. Inspect all relevant accessible material without crossing privacy boundaries; disclose inaccessible history. Preserve a traceability map of active knowledge. | P3; ADR, FENCE |
| A7 | Get rid of memories and notes during compaction | Preserve recoverable history and obtain any still-required deletion approval. No note deletion occurs as a side effect of merely authoring this source package. | P3; FENCE, ADR, REFACTOR |
| A8 | Every comment must disappear into code or AGENTS.md | Review comments by meaning; retain legal, attribution, generated, machine-required and useful public-contract comments. Move verified rationale only when discoverability and behavior survive. Deduplicate the review and avoid overlapping writers. | P4; REFACTOR, FENCE, ADR, MIKADO |
| A9 | Maximum parallelism; never stop after a step/turn | Use independent graph branches with bounded resources and ownership. Continue to the requested outcome or a concrete blocker; respect cancellation, permissions and resource limits. Arrange actual completion paths. | P5; MIKADO, CIRCUIT, DBC |
| A10 | Attribute everything only to “(insert ur github)” | Keep placeholder unresolved until identity/intention is verified. No impersonation, false sole authorship, removed credits/licenses, or rewritten unrelated commit authors. | P6; ADR, FENCE |
| A11 | Output only anchors in Mermaid, then convert to skill.md | Apply graph-only output to a dedicated authoring pass; produce discoverable SKILL.md metadata/procedures in the subsequent persistence pass. The FAIKU JSON runtime contract is separate. | P7, F6; ADR, DBC |
| A12 | Add all missing anchors to the reference; use literature/authors; graph everything | Add evidence-backed missing concepts locally, labelled proposals, without claiming an external catalog write. Map every added step/resource/adaptation into the shared graph and verify coverage. | P7; ADR, HOARE, FALSIFY, DBC |

## Later clarification kept separate from original source

The user subsequently identified GM as the SolutionsAsService/gm-mcp repository and authorized an installation in a separate workstream. The source archive predates that clarification and is not rewritten to insert it. Skill procedures therefore test current capability rather than baking in either permanent absence or successful installation. Installation/configuration and any Windows repair remain the responsible workstream's work; this package does neither.

## Deliberately unresolved

- Intended GitHub attribution identity has not been supplied in these source texts.
- Actual runtime GM/MCP exposure, host and installed path must be verified at invocation.
- The source's Windows repair path and a separately selected installation path may differ.
- Skill Markdown is operational guidance, not a tested theorem prover or a deterministic engine.
- Graph-only authoring output cannot carry full execution contracts by itself; the coverage ledger and skills are required companions.
