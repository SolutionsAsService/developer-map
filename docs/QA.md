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
