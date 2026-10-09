# Validation of repository skill sources

Date: 2026-10-09. Scope: the eight Markdown files in this skill-source package. This is document/contract validation, not runtime enforcement of either skill, a GM connection test, or a claim that any model is formally verified.

## Executed checks

- Both skill directories passed the bundled skill-creator scripts/quick_validate.py with Python 3: “Skill is valid!” for each. This validates required frontmatter and naming under that validator; it does not establish host registration.
- Local Markdown links were resolved relative to their containing files, constrained to the package/repository root, and checked for file existence. A final pass after this report was added checks all eight files without missing-link exemptions.
- The shared Mermaid block was extracted and statically checked: **9 declared nodes, 17 edges, all endpoints declared**, branching from DBC and explicit feedback/backreference edges.
- **13/13 numbered procedures** are present in the coverage ledger: F1–F6 and P1–P7. Every procedure has a checkable Done when criterion; all its declared anchor IDs exist in the graph.
- The audit contains A1–A12 with explicit procedure/anchor mappings. The graph's artifact ledger covers both skills and all six documentation resources, including this report.
- Both JSON examples parsed successfully and were checked for required field set, status/code agreement, marker consistency, evidence-array/detail-string types, and null fault result.
- The source transcription retains two INVARIANT 3 entries, no invented INVARIANT 6, the attribution placeholder, both skill headings, and the full final graph request. Line-ending normalization/transcription limitations are documented in AUDIT.md.
- All seven reused catalog entry URLs were fetched successfully; author/publisher references were checked. The primary Hoare paper's first two pages were read through the academic mirror. Hoare/Popper extensions remain local proposals.

Normalized ORIGINAL-REQUEST.md: **4,854 UTF-8 bytes**; SHA-256:

```text
c28176fb1cd1464fa500a4cf70c6485f1172d18e06d0c95a9b1439ec7d7ab9f4
```

This digest identifies the committed transcription, not the original chat transport bytes.

## Static scenario review, not model execution

The FAIKU checklist covers direct facts, contradictions, undefined payload symbols, missing query facts, unsupported derivations and output faults. The PIMP checklist covers working/absent GM, duplicate repair incidents, missing host, recoverable compaction, retained legal comments, independent parallel work, unresolved attribution and local-only extensions. These branches were reviewed against their written procedures; no downstream coding agent or formal engine was launched to establish behavioral compliance.

## Remaining verification limits

- Integration follow-up: found the existing OpenClaw Control UI Mermaid browser bundle. **Real Mermaid parse and SVG render passed** in Chromium 153.0.8010.12 with sandbox enabled: 9 nodes, 34,107 SVG bytes. Rendered output: [anchors.svg](anchors.svg); screenshot inspected at docs/qa/current/skill-anchors.png. This proves syntax/rendering, not scholarly endorsement or skill-runtime compliance.
- Integration reran both frontmatter validators successfully; scripts/validate-skills.mjs checks 8 Markdown files, 29 local links, 13 procedure references and 2 parsed JSON examples.
- No current GM/MCP liveness, installation path, exposed schema or repair delivery is proved by this package. Probe at invocation; a separate installation workstream owns setup.
- No destructive notes/comment sweep, AGENTS.md replacement, config edit, Git attribution change, application dataset edit, commit or push was performed by the authoring worker.
- Repository-source paths are not evidence that the host auto-discovers or globally installs these skills.
- External primary source availability is point-in-time; the access-blocked ACM publisher page was not bypassed.

Re-run the frontmatter validator, local-link checks, graph-node/edge/coverage checks and JSON parsing after edits. Integrators should record any actual Mermaid-render and host-discovery results separately rather than relabeling these static checks as runtime proof.

To repeat rendering, run `node scripts/render-skill-anchors.cjs` from the repository root with approved `CHROMIUM_PATH`, existing `PLAYWRIGHT_MODULE` and `MERMAID_BUNDLE` paths. The renderer retains Chromium sandboxing and does not download tools. The integration worker installed Chromium in the user cache and extracted Ubuntu NSS/NSPR/audio libraries under /tmp without privileged installation or changing system configuration.

Whitespace audit: ORIGINAL-REQUEST.md deliberately retains four source lines with trailing spaces. The integrator excludes only that preserved transcription from git diff --check; all executable skills, authored documentation and code must pass normally. No source cleanup was applied merely to silence the check.
