# Developer Map

A static explorer unifying **all 37 source graphs** spanning network packets, IP/TCP/HTTP, switches/routers/routing, IPv6/OSI/Wi-Fi/campus networks, JavaScript/React/Next.js/CSS/React Native, Web frameworks, cloud/security, languages/toolchains/AI, operating systems, containers and storage. No backend, account, telemetry or paid service.

## Run and deploy

```sh
npm ci
npm run build
node scripts/integration-manifest.mjs
node --test --test-concurrency=1
npm run dev
# In another terminal, verify every served asset and evidence shard:
npm run smoke:deploy -- http://localhost:4173/ --exact
```

Open http://localhost:4173. Set PORT to change the local development port. Deploy the **repository root** to any static host. Keep index.html, src/, data/overview.json, the entire data/details/ directory, data/atlas.json and every original source JSON together. No framework build or backend is required when generated JSON is committed. Regenerate the derived archive, overview and content-addressed detail shards with npm run build after source changes; the manifest command regenerates the source-retention audit. The local server is not a production server.

## Map and evidence

The default map is the entire meaningful connected-concept overview: **1,529 concepts and 2,930 original/editorial links**, selected by iterative pruning to at least two distinct displayed neighbors. Bibliography, people, claims, isolated and one-neighbor records remain searchable, inspectable and downloadable rather than becoming artificial concept hubs. The full archive preserves **7,812 original node records, 526 claims, 8,604 structured source relationships and 522 learning paths** as 7,908 canonical records, plus 19 explicitly marked editorial bridges.

Selection highlights incoming/outgoing neighborhoods **in place on the same large map**. It does not replace the overview or move its coordinates. Fit selection is an explicit camera action; reset returns to the overview. A native dataset selector scales to 37 sources, dims other topics without removing graph context and scopes the text search/index. Reset clears filters and restores the overview camera. Displayed overview counts are distinguished from full archive counts. Pan, wheel, zoom buttons, +/- and Home are retained. / focuses search; Escape clears selection. Mobile controls and a canvas-free text index are retained.

Search covers every canonical record by label, source-qualified alias, description and relationship summary; it does not claim to search every nested raw field. Connection search and incoming/outgoing filters affect only the list, never erase graph links. **Emphasize & explain** opens the exact triple, WHAT/WHY, semantic category, assertion status, JSON pointer, source fields, rationale/mechanism, constraints/versions, citations and raw relationship record in the adjacent pane. Neighbor exploration is a separate action. Empty mechanism fields explicitly show WHY not supplied; a predicate is not an invented explanation.

Initial load uses overview.json. Selecting by click, tap, Enter, neighbor or deep link immediately displays the known description and **all recorded incident links in both directions**, across sources. Full source records and evidence load through a SHA-256 content-addressed manifest and static shards capped at 192 KiB, with at most three concurrent requests. Empty, malformed, missing or mismatched responses retain the selection and show an explicit partial/error state with Retry. Late results cannot replace a newer selection. Search never fetches the full archive. Learning paths use their own shards. The optional 22.8 MB atlas download is no longer an interactive dependency.

The manifest checks every payload's byte count, SHA-256, schema, record IDs and edge endpoints; paths are immutable so older overview pages cannot silently mix new evidence. Raw shard cache is bounded to 32; requests are deduplicated, failed requests are evicted, and each network request times out after 15 seconds. Keep previous content-addressed shards when deploying so cached pages remain usable. SHA-256 requires a secure browser context (HTTPS or localhost). No hosting/provider configuration changes or extra dependencies are needed.

Connections are grouped and filterable by semantic type and direction, with a separate reset. Implementation language, implementation-of, language use, specification, compilation target, library, dependency and runtime meanings remain distinct; exact source predicates are never rewritten. Reviewed CPython → C and V8 → C++ / ECMAScript links carry primary documentation, scope and October 9, 2026 evidence dates. They do not claim Python or JavaScript themselves are written in those languages.

## Exact relationship workbench

The active relationship now stays synchronized with its highlighted graph edge when changing datasets. “Emphasize & explain” moves keyboard focus to the evidence **above** the connection list without losing your place in the results. Full fields and citations use native expandable sections, preserving raw evidence without overwhelming the first reading. The compact introduction uses real imported connections instead of a simulated command interface.

Use **Link to this exact relationship** to share both the selected concept and original edge ID. Reloading restores the same directed triple; invalid or unrelated edge IDs never select a different concept or assert a fabricated relationship. Search text/caret and connection-list position survive delayed evidence hydration. Reset restores the overview and clears concept/edge URL state.

### Deployment verification

Run `npm run smoke:deploy -- https://your-host.example/` against a static deployment (subdirectory URLs are supported). Add `--exact` to require all checked files to match this checkout, not merely form a self-consistent deployment. The check validates HTML, scripts, CSS, overview, manifest and **all 111 detail shards**, plus the 37 original source downloads. It checks MIME types, SHA-256 and size limits, spaces public requests, and respects bounded Retry-After waits. It is read-only and does not provision a host, publish files, or certify browser rendering. Public evidence loading requires HTTPS. No hosting credentials or automatic deployment pipeline are configured in this checkout.

### Real browser QA (separate from smoke)

The existing `scripts/qa-integration.cjs` now uses the current 37-source interface and reads path totals from the archive. It no longer hardcodes an old OpenClaw installation, old browser cache, missing controls or obsolete 133-path count. In an environment permitting browser automation, set `CHROMIUM_PATH` to an installed approved Chromium and optionally `PLAYWRIGHT_MODULE` to an existing playwright-core module, then run `node scripts/qa-integration.cjs` while the local server is running. `QA_URL` overrides the target; `QA_OUTPUT` overrides the default `docs/qa/current` output. No dependencies are installed and sandbox protections are not disabled by the runner. Current-run screenshots/report never overwrite historical QA evidence. This revision has syntax verification only; no browser binary is available here.

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

## Repository-owned workflow skills

See [the skill-source guide](docs/skills/README.md) for **FAIKU** and **PIMP MY SKILL**, the preserved request and adaptation ledger, literature-anchor Mermaid graph and coding-agent prompt. These are repository Markdown sources under `.agents/skills/`, not automatically registered global tools, and adding them does not execute their maintenance branches or change the application knowledge graph. Host discovery and GM availability must be verified separately.
