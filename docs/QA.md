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
