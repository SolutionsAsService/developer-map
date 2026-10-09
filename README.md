# Developer Map

A static explorer unifying **all 37 source graphs** spanning network packets, IP/TCP/HTTP, switches/routers/routing, IPv6/OSI/Wi-Fi/campus networks, JavaScript/React/Next.js/CSS/React Native, Web frameworks, cloud/security, languages/toolchains/AI, operating systems, containers and storage. No backend, account, telemetry or paid service.

## Run and deploy

```sh
npm ci
npm run build
node scripts/integration-manifest.mjs
node --test --test-concurrency=1
npm run dev
```

Open http://localhost:4173. Set PORT to change the local development port. Deploy the **repository root** to any static host. Keep index.html, src/, data/overview.json, data/atlas.json and every original source JSON together. No framework build or backend is required when generated JSON is committed. Regenerate both derived JSON files with npm run build after source changes; the manifest command regenerates the source-retention audit. The local server is not a production server.

## Map and evidence

The default map is the entire meaningful connected-concept overview: **1,529 concepts and 2,928 original/editorial links**, selected by iterative pruning to at least two distinct displayed neighbors. Bibliography, people, claims, isolated and one-neighbor records remain searchable, inspectable and downloadable rather than becoming artificial concept hubs. The full archive preserves **7,812 original node records, 526 claims, 8,604 structured source relationships and 522 learning paths** as 7,908 canonical records, plus 16 explicitly marked editorial bridges.

Selection highlights incoming/outgoing neighborhoods **in place on the same large map**. It does not replace the overview or move its coordinates. Fit selection is an explicit camera action; reset returns to the overview. A native dataset selector scales to 37 sources, dims other topics without removing graph context and scopes the text search/index. Reset clears filters and restores the overview camera. Displayed overview counts are distinguished from full archive counts. Pan, wheel, zoom buttons, +/- and Home are retained. / focuses search; Escape clears selection. Mobile controls and a canvas-free text index are retained.

Search includes labels, source-qualified aliases, definitions and the complete archive. Connection search and incoming/outgoing filters affect only the list, never erase graph links. **Emphasize & explain** opens the exact triple, WHAT/WHY, semantic category, assertion status, JSON pointer, source fields, rationale/mechanism, constraints/versions, citations and raw relationship record in the adjacent pane. Neighbor exploration is a separate action. Empty mechanism fields explicitly show WHY not supplied; a predicate is not an invented explanation.

Initial load uses the lighter overview.json; selection, search or source-path browsing fetches the full archive once without remounting the map or changing layout. This remains compatible with static hosting.

## Identity and provenance

Reviewed, source-qualified aliases connect protocols, named Web technologies, C/C++, Ruby/Rails, Python/Go/Lua/PyTorch/CUDA, GCC/Clang/LLVM, CPU/Unix and infrastructure concepts without confusing languages with frameworks, compiler toolchains, CUDA platform/extensions/toolkit/runtime or GPU hardware. New-domain non-reviewed IDs stay source-scoped even when their labels match an older domain. Every original source file remains byte-exact against upload revision 3dec97f. No relationship is inferred from co-listing or learning-path order.

Implementation-language, compilation, runtime compatibility, hardware, dependency, uses, supports and distinction predicates remain separate with the original direction. Source assertions are **not independently fact-checked**; conflicting descriptions and unsupported/uncited edges stay visible in the audit, not silently repaired. The newly added optional Kamal → Docker deployment bridge was checked against the official Kamal homepage, Why not just run Capistrano, Kubernetes or Docker Swarm? section, on October 7, 2026. It does not claim Docker is a universal Rails dependency.

See docs/DATA-AUDIT.md and docs/integration-manifest.json for exact hashes and mappings. Existing design credits and historical QA artifacts remain; they are not current visual proof.

## Verification

npm test checks retention, complete structured import, scoped identities, aliases, directions, projection, deterministic layout, same-map focus, independent evidence, connection filters and map controls. UI tests use **JSDOM with mocked Canvas**, not real browser rendering. Actual HTTP entrypoint/assets/data smoke is separate. On October 9, 2026, actual browser navigation to the local server was blocked by browser policy. Real visual usability, browser interactions and console-error absence remain unverified; mock Canvas tests are not visual proof. No configured GitHub Actions workflows were found.

Pimp My Skill · SolutionsAsService · https://github.com/SolutionsAsService

## New cross-topic navigation

- Packet/IP/TCP/HTTP records connect through reviewed protocol identities; editorial TCP → IP transport and version-scoped HTTP → TCP links explain layers. HTTP/3 is explicitly excluded from the TCP claim.
- Next.js → Web framework classification and Next.js → CSS support sit alongside original React/JavaScript edges; React Native → CSS is a distinction, not a browser dependency.
- Router, routing and switch identities connect campus and protocol graphs; IEEE 802.11 → PHY and MAC-sublayer bridges retain physical/logical direction.
- Cloud → optional VMs and cloud security → firewall controls join existing VM/container/Kubernetes/storage paths without universal dependencies. Go/Python/CUDA/Lua identities connect the PyTorch and toolchain records.

All original nodes, paths and metadata remain downloadable. 73 unresolved path segments and 1,604 isolated records are reported, not connected with fabricated links. Ten new editorial links include primary documentation, rationale, scope and the October 9 evidence date. Full per-file coverage and hashes are in docs/DATA-AUDIT.md and docs/integration-manifest.json.
