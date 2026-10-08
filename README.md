# Developer Map

A static explorer unifying **all 14 source graphs**: C, C++, CUDA, Ruby on Rails, Python, operating systems, virtual machines, containerization, Docker, Kubernetes, security sandboxes, storage volumes, system images and optical disc images. No backend, account, telemetry or paid service.

## Run and deploy

```sh
npm ci
npm run build
node scripts/integration-manifest.mjs
npm test
npm run dev
```

Open http://localhost:4173. Set PORT to change the local development port. Deploy the **repository root** to any static host. Keep index.html, src/, data/overview.json, data/atlas.json and every original source JSON together. No framework build or backend is required when generated JSON is committed. Regenerate both derived JSON files with npm run build after source changes; the manifest command regenerates the source-retention audit. The local server is not a production server.

## Map and evidence

The default map is the entire meaningful connected-concept overview: **556 concepts and 1,125 original/editorial links**, selected by iterative pruning to at least two distinct displayed neighbors. Bibliography, people, claims, isolated and one-neighbor records remain searchable, inspectable and downloadable rather than becoming artificial concept hubs. The full archive preserves **3,102 original node records, 204 claims, 3,312 structured source relationships and 186 learning paths** as 3,074 canonical records, plus six explicitly marked editorial bridges.

Selection highlights incoming/outgoing neighborhoods **in place on the same large map**. It does not replace the overview or move its coordinates. Fit selection is an explicit camera action; reset returns to the overview. Pan, wheel, zoom buttons, +/- and Home work on the map. / focuses search; Escape clears selection. Mobile controls and a canvas-free text index are retained.

Search includes labels, source-qualified aliases, definitions and the complete archive. Connection search and incoming/outgoing filters affect only the list, never erase graph links. **Emphasize & explain** opens the exact triple, WHAT/WHY, semantic category, assertion status, JSON pointer, source fields, rationale/mechanism, constraints/versions, citations and raw relationship record in the adjacent pane. Neighbor exploration is a separate action. Empty mechanism fields explicitly show WHY not supplied; a predicate is not an invented explanation.

Initial load uses the lighter overview.json; selection, search or source-path browsing fetches the full archive once without remounting the map or changing layout. This remains compatible with static hosting.

## Identity and provenance

Reviewed, source-qualified aliases connect C/C++, Ruby/Rails, Python, GCC/Clang/LLVM, CPU/Unix and existing infrastructure concepts without confusing languages with frameworks, compiler toolchains, CUDA platform/extensions/toolkit/runtime or GPU hardware. New-domain non-reviewed IDs stay source-scoped even when their labels match an older domain. Every original source file remains byte-exact against upload revision f080705. No relationship is inferred from co-listing or learning-path order.

Implementation-language, compilation, runtime compatibility, hardware, dependency, uses, supports and distinction predicates remain separate with the original direction. Source assertions are **not independently fact-checked**; conflicting descriptions and unsupported/uncited edges stay visible in the audit, not silently repaired. The newly added optional Kamal → Docker deployment bridge was checked against the official Kamal homepage, Why not just run Capistrano, Kubernetes or Docker Swarm? section, on October 7, 2026. It does not claim Docker is a universal Rails dependency.

See docs/DATA-AUDIT.md and docs/integration-manifest.json for exact hashes and mappings. Existing design credits and historical QA artifacts remain; they are not current visual proof.

## Verification

npm test checks retention, complete structured import, scoped identities, aliases, directions, projection, deterministic layout, same-map focus, independent evidence, connection filters and map controls. UI tests use **JSDOM with mocked Canvas**, not real browser rendering. Actual HTTP entrypoint/assets/data smoke is separate. Current visual verification is blocked if browser navigation policy denies local access; do not bypass it through CLI/CDP/Playwright.

Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService
