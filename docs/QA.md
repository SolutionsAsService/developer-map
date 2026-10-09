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
- Before editing, hosted src/app.js SHA-256 matched cf27415: 84bb596519b604be53552a5f9ab1205f2521ea539fae2c40597c95fad31a78d2. No stale-deployment assertion is made at baseline.
- Browser tool open failed: “No supported browser found (Chrome/Brave/Edge/Chromium on macOS, Linux, or Windows).” No browser was installed, no navigation policy bypass attempted. Real rendering, screenshots, mobile usability, assistive technology and console-error absence remain UNVERIFIED.
- The old optional browser runner had obsolete path counts, invisible topic-chip clicks, a removed clear-focus selector, fixed machine paths and fixed evidence date. Updated to current controls/dynamic totals, explicit approved browser path and separate current-run output; syntax checked, not executed.
- GitHub identity tool: credential unavailable and git author unset. Actual git push --dry-run origin HEAD:main failed exit 128: “could not read Username for 'https://github.com': No such device or address.” No push or new deployment is claimed. No provider/workflow configuration was found; no paid service or deployment resource was provisioned.

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
