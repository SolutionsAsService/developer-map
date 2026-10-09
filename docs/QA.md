# October 9, 2026 — favicon and concise copy polish

- Reused the saved bounded changes on main at `e7f45a0`; no redesign, dependency additions, source-record edits or application-logic changes.
- Added a self-contained 373-byte SVG graph favicon, HTML declaration, local-server allowlist entry, deployment smoke check, manifest entry and deployment instructions. GET/HEAD return the SVG MIME type; unrelated files remain blocked.
- Shortened introductory, inspector, loading and empty-state copy while preserving source/editorial distinctions. Corrected the learning-path hint to name the actual explicit action: “Show all paths”; selecting a concept does not load paths.
- Affected details/interface/static-assets suites: **32 passed, 0 failed/skipped**, 259.7 seconds. Final standalone static-assets/copy assertions also passed 2/2. No new full-suite or accessibility certification is claimed.
- `npm run build`, manifest regeneration, application/changed-script syntax and `git diff --check` passed. All original and generated data remain byte-identical to the starting revision; the manifest changes only to list the favicon.
- Exact local HTTP smoke passed **157 resources**, including the SVG favicon, 37 originals and all 111 verified detail shards (7,908 concepts / 8,623 relationships).
- Sandboxed Chromium 153 integration passed seven entry concepts at **1440/390/320 px**, exact incident-edge sets, search/filter/emphasis/context/Fit/canvas-click/Back, rich metadata and 522 paths; zero page errors or horizontal overflow. A separate final-copy check passed at 1440/390 px after correcting the path hint.
- Favicon rendered and visually inspected at actual **16/32 px**; home and selected-concept screenshots reviewed on desktop/mobile. Evidence is in `qa/favicon-polish/`; historical evidence remains untouched.
- GM read/write probes succeeded. Prior-worker history showed a long bash admission starvation (`dispatch_starved_waiting_for_admission`, not executed); long tests/browser/build used native process-managed execution to avoid that degraded path. No GM repair, new worker, install, directory migration or global configuration change was attempted. Comment review stayed bounded; existing legal, rationale and tooling comments were retained.
- Local verification is not deployment proof. This task does not modify hosting; pushing main does not establish that the external site refreshed.

---

# October 9, 2026 — continuation audit (baseline cf27415690d4c4cca38bd7f3336f3d2be46202f1)

This section supersedes historical counts and environment claims below.

- Clean clone of actual default branch main; no mainths branch. No pre-existing user edits.
- npm ci: exit 0; 43 dependencies installed, 0 reported vulnerabilities; no new dependency.
- Baseline suite: 50/50 passed in one run (262.9 s). Final full suite: **54/54 passed**, zero failed/skipped, in 300.6 s. Final dead-handler removal is covered by a separate **19/19 interface rerun** (104.1 s). Final text-only intro corrections and smoke parsing guard passed the subsequent exact local smoke.
- npm run build and node scripts/integration-manifest.mjs: exit 0. All original and derived data plus integration manifest remain byte-identical to baseline; no fabricated graph links or altered source records.
- Syntax: app/network/details/map-key and both QA runners passed node --check; git diff --check passed. No separate lint or typecheck is configured. Raw command evidence is retained under docs/qa/current/.
- Targeted exact-edge/state/focus regressions: 3/3 passed after correcting a test's unsupported direct access to script lexical state; tests now observe renderer state/DOM.
- Local HTTP smoke: 156 resources pass with --exact; 37 original source downloads, 7,908 canonical records, 8,623 edges and 111 SHA-256/size-verified detail shards. Scripts, CSS, HTML, overview and manifest included.
- Existing hosted site at https://developer-map.shadw.app/: HTTP/MIME/all-shard smoke **passed** for 156 resources. Initial faster run hit HTTP 429; runner now paces remote batches and honors bounded Retry-After, and the paced run passed. This verifies the old deployed revision, NOT publication of this change.
- Final pre-push hosted asset check at 2026-10-09T22:54:56.541Z: HTML, app.js and CSS returned HTTP 200 with correct MIME but all differed from this checkout. Hosted app.js still matched baseline cf27415 (SHA-256 84bb596519b604be53552a5f9ab1205f2521ea539fae2c40597c95fad31a78d2); local app.js is 3cea1faf9b085d91ac5e6f928ba6130b85572927ccfee50f6dcacb44c5d6cebf. Requests were sequential and spaced 1.5 seconds. Full asset hashes are in `qa/current/hosted-final-assets.json`. Publishing Git main is not proof that the external host has refreshed; no configured deployment workflow or host control is available in this checkout.
- Initial browser-tool open failed because no supported browser was found. This initial limitation was subsequently resolved for local QA with user-cache Chromium 153 and temporary unprivileged library extraction; sandboxing remained enabled. The real run passed at 2026-10-09T22:47:21.990Z: seven entry concepts at 1440/390/320 px, exact incident edges, search/source filters, emphasis/context/Fit, actual canvas click and Back, rich metadata, 522 paths, no page errors and no horizontal overflow. Evidence: `qa/current/report.json` and seven current PNG captures. This does not certify assistive technology or the hosted deployment.
- The old optional browser runner had obsolete path counts, invisible topic-chip clicks, a removed clear-focus selector, fixed machine paths and fixed evidence date. Updated to current controls/dynamic totals, explicit browser path and separate current-run output; executed successfully as recorded above. The final browser pass also checks narrow map-footer overflow after the CSS wrapping fix.
- The initial identity-tool/dry-run authentication failure is historical: existing `gh` authentication now resolves SolutionsAsService, and authenticated fetch succeeds. Final commits retain the existing OpenClaw author identity using command-scoped settings rather than changing user identity. Push verification is separate from deployment; no provider/workflow configuration was found, and no paid service or deployment resource was provisioned.

---

# October 9, 2026 expansion verification

- Baseline: live main 3dec97f1cf764ddd3ea12672978f889d2b29feda; GitHub identity SolutionsAsService via existing gh authentication.
- Test verification: sequential full suite ran 41 tests: 40 passed, one exposed negative-zero layout serialization. Fixed layout normalization; affected atlas suite reran 3/3 passing. New schema suite reran 5/5 and targeted search/selector suite 2/2 passing. Thus every test has passing final applicable evidence; no claim of a single all-green full-suite run after the fix.
- Final npm run build and manifest regeneration: exit 0. SHA-256 comparison against previous generated atlas, overview and manifest: all three byte-identical (no timestamps excluded).
- git diff --check and JS syntax checks: exit 0.
- npm ci --ignore-scripts: exit 0, existing 43 packages, no added dependency.
- 37 of 37 source graphs imported. Exact original bytes audited against baseline; per-record mapping and hashes in integration-manifest.json.
- Local HTTP entrypoint, app/network/map-key scripts, stylesheet and both generated JSON: HTTP 200. Payloads report 37 sources, 7,908 canonical records and 8,620 links.
- Browser tool status: running Chromium. Local navigation denied by policy. No real browser interaction, screenshot, rendered usability or console-error pass is claimed. No bypass or configuration change attempted.
- GitHub Actions workflow count: 0 (unavailable, not passed).
- Atlas SHA-256: 4a72629bc02a905fb30ea8f04a0befeabd77c06d1a0f13bd98e0c428e131f39e.
- Overview SHA-256: da359b603af4ff8b05b084c1656735988feba2aae1963c37261dabf01ff0349b.
- Manifest SHA-256: dfd6e96f05452364e6f6fc15dca9988a75b9ff1044c7dd134a29a443ed14dcc1.

The previous QA record below is historical, not evidence for this expansion.

---

# Focused interaction verification · 2026-10-07

All 28 Node/jsdom tests passed after the final code edit; atlas build and whitespace checks passed. Current-pass results are recorded in `integration-browser.json` and `qa/integration-tests.txt`. Earlier verification below is historical, not proof of the current working tree. The current browser runner explicitly tests connection search, edge explanation, neighborhood/context toggle, Fit, actual canvas label clicks and Back for seven entry concepts at 1440, 390 and 320 px. It also compares full incident-edge sets before and after controls, checks rich metadata, all 133 paths, exact search, page errors and overflow.

The browser test exposed label/node hit overlap, hover-induced label movement, and a mobile canvas whose internal drawing size became stale when controls changed the layout. Hit testing now prefers visible labels, hover no longer shifts label geometry, and a ResizeObserver synchronizes the canvas after element-size changes. The runner also scrolls the canvas into view before real pointer clicks. The final Chromium rerun passed all seven entry concepts at all three widths with zero page errors and zero horizontal overflow. This is local browser verification, not deployed-site verification or a new accessibility certification.

---

# Verification report

Checked October 7, 2026. Local static server; Chromium 153 via Playwright. Temporary browser tooling is outside this repository and adds no app dependencies.

## Automated regression

16 Node/jsdom tests passed: full source/claim/path preservation, protected identity scoping, eight explicit alias groups, editorial direct relationships, deterministic generation, no dangling endpoints or merge-created loops, connectivity audits, query/selection/Escape, all learning paths, legacy K8s URL, ambiguous Host URL, exact search ranking, modifier-safe shortcuts, active-edge toggle, actual evidence links and focus handoff.

## Real browser interactions

- Slash search, exact Container result, select and Escape clear.
- Docker → Container query, matching active-edge inspector, reversible neighborhood toggle.
- Evidence action scrolls and transfers keyboard focus to the exact relationship record.
- Editorial evidence renders as an actual primary-source hyperlink.
- All 50 learning paths render; next-step navigation works.
- Legacy K8s redirect and ambiguous Host choice work.
- Selected Docker state at 1440, 768, 390 and 320 CSS px has no horizontal page overflow.
- No browser page errors during these interactions.

## Accessibility

Axe WCAG 2 A/AA and 2.1 AA scans cover home and selected-Docker states at four widths. First scan found source-download links distinguishable only by color; underlining was added. Final scan: **zero violations in all eight scans**, with no horizontal page overflow or browser page errors. This is an automated check, not a WCAG certification or a substitute for screen-reader/user testing.

## Deliberate limits

- No exhaustive historical/product claim fact-check: original assertions and qualifiers remain in source variants.
- 213 graph-isolated records remain; no unsupported relations manufactured to inflate connectedness.
- Browser results validate local behavior, not a deployed hosting environment.
- GitHub authentication is required to publish; remote push status will be recorded after the attempt.


## October 9, 2026 — selection/shard regression (supersedes historical counts above)

Build succeeds and source-retention manifest confirms all 37 original hashes. New JSDOM tests exercise immediate search selection, empty-200 full-archive independence, empty/malformed/missing/stale detail responses and retry, late-selection race guards, qualified deep links, cross-source incoming/outgoing relationships, typed implementation filters, neighbor/back/reset, keyboard Enter, full learning paths, bounded concurrency and request deduplication. Exact shard coverage, byte bounds, SHA-256 and deterministic generation are checked. Existing tests retain source identities, source bytes, all predicates and camera positions; the old mandatory-full-archive test is replaced by the stronger real lightweight-plus-shards contract.

No new library/service: native fetch/Web Crypto plus the existing Node test/JSDOM stack. Local browser navigation remains prohibited by the earlier browser policy; no alternate host, transport or config bypass was used. Real public browser checks are recorded separately after normal main push/autodeploy. No GitHub Actions workflow is configured; CI is unavailable, not passed.

Final `npm test`: **50 passed, 0 failed**, exit 0 (286.4 seconds). Full regeneration and the source manifest command both exited 0.

### Public autodeploy verification, October 9

Commit 813a8b2 deployed through the existing automatic pipeline. Public browser verified the new detail loader, 8,623 relationships / 19 editorials and a deployment-generated content-addressed manifest. Deployment layout coordinates can differ, so its manifest hash differs from the local deterministic build; semantic coverage and SHA-256 checks succeeded. Next.js search click immediately displayed 213 links, then all 213 full evidence records. Python keyboard Enter displayed 251, C displayed 157, and CPython displayed 12. Python → CPython → C navigation, incoming implementation relation, typed filter/reset and Back all worked. V8 deep-link selection loaded both C++ implementation and ECMAScript specification links. No page errors were recorded. The browser requested only overview/manifest/shards, never atlas.json. At 390 CSS px the panel had no horizontal overflow.

Real mobile QA also caught the expanded legend squeezing the canvas to zero height. The follow-up CSS gives the canvas a non-shrinking minimum, bounds legends and permits automatic panel height. This issue was invisible to mocked Canvas tests and is checked on the deployed page after the follow-up push.

Follow-up affected UI suites: **26 passed, 0 failed**, exit 0 (63.9 seconds). Full 50-test suite/build evidence above remains valid for unchanged data and JavaScript.


## Reusing the local Chromium QA environment

These verified host-specific paths are temporary tooling, not repository dependencies. Start `npm run dev` separately, then:

```sh
CHROMIUM_PATH=/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
PLAYWRIGHT_MODULE=/home/openclaw/.openclaw/tools/node-v24.19.0/lib/node_modules/openclaw/node_modules/playwright-core \
LD_LIBRARY_PATH=/tmp/developer-map-browser-libs/root/usr/lib/x86_64-linux-gnu \
node scripts/qa-integration.cjs
```

Chromium sandboxing is explicitly enabled. The temporary library directory supplies libasound2t64, libnspr4 and libnss3; it can disappear after cleanup/reboot. Screenshots cover home and Next.js → CSS evidence at 1440/390 px plus integration states at 1440/390/320 px. No new accessibility scan or independent critic panel was run. Historical sections above retain their original execution-time limitations; the current continuation record supersedes them.
