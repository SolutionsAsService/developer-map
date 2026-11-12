# DESIGN-LOG: Developer Map v2 (DADA run, 2026-11-12)

The previous run's log is kept at `docs/DESIGN-LOG-v1.md`. The pre-redesign site is on the `legacy` branch.

## 1. Traversal Plan

**Brief, restated.** The site is a mess: redesign it and make the interface faster and better, on Next.js, applying the owner's standing rules (topic-derived palette, colour varied by zone).

**Mode: Adaptive.** A public developer learning tool; MAYA governs: the advanced pole (a terminal-native, region-coloured composition with one traced concept) and the acceptable pole (search first, plain pages per concept and graph) must both hold.

**Run type: Full.** Concept, structure and stack all change; the Landing procedure runs as the landing move (M3).

**Tooling inventory.** Graph rendering: none available (Mermaid text kept here). Frontier: by hand from `references/anchor-graph.md`. Panel: Agent sub-agents, one per reference, at most three at a time, filing to `design/panel/<round>/<seat>.md`; `collect_panel.py`. Measurement: Playwright via `design/measure.cjs` (probes with must-fail fixtures), `node --test`. Ledger: `import_log.py` and `rate_seats.py` in the dada-changes clone.

**Seed (labels verbatim).**
- Stance: `How to Use Graphic Design to Sell Things, Explain Things, Make Things Look Better (Michael Bierut)` -->|wit as welcome for| `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`
- Rules: `The Visual Display of Quantitative Information (Edward Tufte)` (one scale for every block), `Envisioning Information (Edward Tufte)` -->|extends| the former, `Grid Systems in Graphic Design (Josef Müller-Brockmann)`
- Breaker: `The Medium Is the Massage (Marshall McLuhan, Quentin Fiore)`: the medium developers live in (the terminal: monospace, prompt, cursor, xterm colours) becomes the site's form.
- Counterpoint: `The End of Print (David Carson, Lewis Blackwell)`, reached by the dotted edge `The Medium Is the Massage` -.->|form as message echoed in| `The End of Print`. **Declined** as a style (illegibility would fail the acceptable pole); kept as a check that the terminal look must not become decoration.
- Second counterpoint: `Dear Data (Giorgia Lupi, Stefanie Posavec)` -.->|hand-drawn data art answers| `The Visual Display of Quantitative Information`: **applied** in the traced thread, one personal path through the data drawn by hand-picked rule (the most shared concept), disclosed as such.

**Panel.** As the previous Adaptive Full runs (from `pick_panel.py`): Debord, Shklovsky, Holmes, Mace (required), Cairo and Tufte (measurement and data-graphic seats), Krug, Nietzsche. Dotted pair: Debord -.- Krug. R0 seated Cairo, Krug and Debord on the inherited site (override: one-screen premortem, reasoned in the previous run).

**Landing inventory.** 8 regions (one row each) · 80 source graphs (one block each, linked) · 4,656 concept pages (reached from the blocks and the trace) · the map (CTA) · the shared vocabulary (section below) · About.

## 2. Panel R0 (premortem on the inherited site; `design/panel/R0/`)

| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Evidence (Cairo) | The Truthful Art | hairball of ~4,300 dots, 16 colours for 80 sources, illegible labels, unformatted and stale counts, 16.4 MB blocking fetch, sampling undisclosed | OBJECT | legible small view first; counts from data; disclose sampling and position |
| Critic: Usability (Krug) | Don't Make Me Think | no subject in five seconds; "Explore Docker" as the only action; unclear clickables; map below the fold; insider copy | OBJECT | one subject line; search above the fold; plain sample links; cut jargon |
| Critic: Provocateur (Debord) | Society of the Spectacle | the cloud is spectacle; count tiles as authority; numbers contradict the README; nothing citable (one URL) | OBJECT | one claim per screen proven by the figure; per-concept citable URLs; reconcile counts |

### Resolutions, R0

| Finding | Resolution |
|---|---|
| Cairo + Debord: hairball, colours undecodable | ADAPT (M3, M5): landing is 8 rows x 80 blocks; map clusters by region on a ring with 8 xterm colours |
| Cairo + Krug: illegible labels | ADAPT (M5): map labels 12 px screen size, collision-culled |
| Cairo + Debord: 16.4 MB gate | ADAPT (M6): pre-rendered pages; map data 125 KB gzip; search index on demand |
| Cairo + Debord: stale and contradictory counts | ADAPT (M2, M7): every number computed at build; README rewritten; tests assert the printed counts |
| Cairo: sampling undisclosed | ADAPT (M5): map states 4,656 of 13,299 and why; About states the page policy |
| Krug: no subject, no first action | ADAPT (M3): h1 states the subject and the finding; header search on every page; "Open the map" |
| Krug: insider copy | ADAPT (M3): tiles and jargon removed |
| Debord: nothing citable | ADAPT (M4): one URL per concept (4,656), per graph (80), per region (8); relationship ids printed |

## 3. Decision Records

> Honesty note: M1-M7 were written during the build (as in the previous run), not strictly before each move.

## Move M1: Keep the pipeline, drop the browser blobs  (KEEP-THE-RULE)
Depends on: none
Anchors: `Ten Principles of Good Design (Dieter Rams)` (as little as possible)
Intent: keep `scripts/build-atlas.mjs` (exact-match merging, provenance, audit) as the build's first step; stop writing `overview.json` (16.4 MB) and `data/details/` (1,399 shards, 266 MB); stop committing `atlas.json` (51.8 MB). Checkout 354 MB to 24 MB.
Residual diff: `atlas.json` rebuilt from source is byte-identical to the committed one (cmp, before deletion); build 92 s.

## Move M2: Eight regions  (KEEP-THE-RULE)
Anchors: `Grid Systems in Graphic Design (Josef Müller-Brockmann)`
Intent: fold 80 graphs into 8 regions (`lib/regions.js`), every graph in exactly one (test).

## Move M3: Landing: rows of graph blocks, one thread  (BREAK)
Anchors: `The Visual Display of Quantitative Information (Edward Tufte)` (one scale), `MAYA` via Bierut, `Dear Data` (the thread)
Intent: h1 "13,299 developer concepts. 1,397 of them turn up in more than one graph." Figure: 8 region rows, 80 blocks as wide as their concept counts on ONE scale (test), the white thread through the 17 graphs containing C (6 regions), snaking row to row. Every row and block links.
Alternatives rejected: the old map as hero (R0); a single-topic chart (fails the summary rule).

## Move M4: Pages for everything citable  (KEEP-THE-RULE)
Intent: 8 region pages, 80 graph pages (all concepts listed with anchors, learning paths, byte-exact download), 4,656 concept pages (every recorded link in both directions, grouped by predicate, with source graph and relationship id).

## Move M5: The map as continents  (BREAK)
Anchors: `The Medium Is the Massage` (canvas in terminal colours), `Envisioning Information` (layering)
Intent: each region has a fixed home on a ring; force layout at build pulls concepts home and along links; canvas draws, selection lights links in white; region toggles; find box (listbox); `?c=` deep links; nearness disclosed as "linked", not measured.

## Move M6: Speed  (KEEP-THE-RULE)
Residual diff: first interactive payload 16.4 MB (overview.json) + 168 KB of scripts → landing HTML 152.6 KB raw / 19.5 KB gzip with the figure inside, ~176 KB gzip framework JS; map data 362 KB / 125 KB gzip, fetched only on /map; search index 1.4 MB / 301 KB gzip, fetched on first search focus.

## Move M7: Palette from the topic, zones  (BREAK; owner's standing rule)
Anchors: `Interaction of Color (Josef Albers)`, `Designing Brand Identity (Alina Wheeler)`
Intent: region colours from the xterm-256 palette (220, 208, 44, 69, 77, 170, 203, 250); white is the trace. Two grounds: the terminal (dark: landing, regions, map) and the man page (light: concept, graph, About), each with its own measured palette.
Measured: dark min ΔE 44 between regions, contrast 5.85-13.68:1 on #0c0f14; light min ΔE 29, 4.56-5.79:1 on #f6f4ee. P2P lavender (xterm 147) replaced by grey 250 after it measured ΔE 29 from Systems blue.

## 4. Panel R1 (WHOLE, on M1-M7; `design/panel/R1/`, 8 of 8 filed)

| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Evidence (Cairo) | The Truthful Art | reproduced 13,299 / 1,397 / 80 / C 17 graphs 6 regions; "more than any other concept" false (JavaScript 18); row totals sum to 15,618 records, unlabelled | OBJECT | reword; label records vs concepts |
| Critic: Evidence (Tufte) | Visual Display | one scale holds (0.152 px/concept); same region shown with two unlabelled totals; cards' scale differs from figure while text says "one scale" | OBJECT | label both units; scope the scale claim |
| Critic: Usability (Krug) | Don't Make Me Think | probe passes at both widths; "1,397" underlined like a link; "Follow C" missing at 375; xterm sentence and relationship ids are noise | PASS | optional |
| Critic: Provocateur (Debord) | Society of the Spectacle | a falsifiable claim proven by the figure; citable concept URLs; counts reconcile | PASS | optional: define "shared"; predicates in the map panel |
| Critic: Provocateur (Shklovsky) | Art as Device | landing roughens; the map is the stock hairball; concept pages lose the device | OBJECT | carry the thread to concept pages and the map |
| Critic: Inclusion (Holmes) | Mismatch | role="img" hides the figure's 88 links from screen readers; no browse route on the map; touch hint names esc/scroll and clips | OBJECT | role="group"; browse list; touch hint |
| Critic: Inclusion (Mace) | Universal Design | focus visible everywhere; search and map keyboard paths complete; the figure is 88 consecutive Tab stops | OBJECT | one stop or a skip |
| Critic: Dionysian Excess (Nietzsche) | Birth of Tragedy | the landing marries grid and thread; map restrained by choice | PASS | optional: keep the thread off labels |

Andon: no.

### Resolutions, R1

| Finding | Resolution |
|---|---|
| Cairo: "more than any other concept" is false | ADAPT (M8): lede states the true claim, computed |
| Cairo + Tufte: row totals are records, unlabelled; two totals per region | ADAPT (M8): "rec." on rows, caption with 15,618 records for 13,299 concepts, cards "concepts at home", About section |
| Tufte: one-scale claim overreaches | ADAPT (M8): scoped to the cards |
| Shklovsky: concept pages lose the device | ADAPT (M9): each concept page opens with its own thread through the 80 blocks |
| Shklovsky: the map is a stock hairball | OVERRULE (MAYA, acceptable pole): the map is the browse-and-select tool; its regions-on-a-ring layout already departs from the hairball (R0 Cairo, Krug), and the device now runs through landing and every concept page |
| Holmes: role="img" hides links | ADAPT (M10): role="group" with title and desc |
| Holmes: no browse route on the map | ADAPT (M10): top 4 concepts per region as buttons before selection |
| Holmes: touch hint | ADAPT (M10): pointer-aware hint, clear of the zoom buttons |
| Holmes: no light/dark choice on the terminal landing | DEFERRED: zones are by page type (owner's rule); contrast measured in both |
| Mace: 88 Tab stops | ADAPT (M10): blocks tabIndex=-1; rows and thread label remain |
| Mace: no keyboard pan | DEFERRED: selection centres the view; zoom and fit buttons exist |
| Krug: underline on "1,397" | ADAPT: colour, no underline |
| Krug: "Follow C" absent at 375 | ADAPT: the thread label is a link at both widths |
| Krug: relationship ids are noise | OVERRULE (Debord R0/R1: citable ids are the proof) |
| Debord: define "shared" | ADAPT: caption links to the merge rules |
| Debord: predicates in the map panel | DEFERRED: the concept page shows every predicate; the panel links to it |
| Nietzsche: thread over block labels | ADAPT: thread runs in the gap above the blocks |

## Move M8: Say exactly what is counted  (KEEP-THE-RULE)
Anchors: The Truthful Art (via Cairo), `The Visual Display of Quantitative Information (Edward Tufte)`.
Residual diff: lede claim changed from a false superlative to a computed true one; row labels gained a unit; two caption sentences; About section.

## Move M9: The thread on every concept page  (BREAK, escalation of M3)
Anchors: `The Medium Is the Massage`, `Dear Data` (one path through the data, per concept).
Intent: the landing's device repeated per concept: its own thread through the same 80 blocks, so "where does this idea live" is answered by form.
Measured: concept page weight +~9 KB raw HTML for two SVGs; figure at 1:1 (760 px max).

## Move M10: Access fixes  (KEEP-THE-RULE)
role="group" figures, browse list, touch hints, blocks out of the tab order.

## 5. Panel R2 (confirmation of the five R1 objectors; `design/panel/R2/`)

| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Evidence (Cairo) | The Truthful Art | lede true against atlas.json; records 15,618 = sum of graph sizes; cards sum to 13,299 | PASS | optional: shorter lede (applied) |
| Critic: Evidence (Tufte) | Visual Display | units named and reconciled; scale claim scoped; Docker thread matches its header | PASS | optional: short row label in the mini figure (applied) |
| Critic: Provocateur (Shklovsky) | Art as Device | concept pages carry the device; two concepts' threads differ at a glance | PASS | optional |
| Critic: Inclusion (Holmes) | Mismatch | figure links in the accessibility tree; 32 browse buttons; touch hint unclipped | PASS | optional: prefers-color-scheme |
| Critic: Inclusion (Mace) | Universal Design | 10 Tab stops through the landing figure (was 89), 9 on a concept page; focus visible | PASS | optional: roving tabindex |

Andon: no. Applied after R2 and measured, not re-judged: shorter lede ("No concept spans more regions; only JavaScript is in more graphs (18)", computed); "Paradigms", "Peer-to-peer" row names in the concept-page figure.

## 6. Step 2g: printed figures at the final state (measured 2026-11-12T02:13Z, after the last edit)

| Printed figure | Procedure | Value | Status |
|---|---|---|---|
| 13,299 concepts | atlas.nodes (pipeline) | 13,299 | reproducible (Cairo R1, R2) |
| 1,397 in more than one graph | concepts with records from 2+ files; = summary.overlaps | 1,397 | test-asserted |
| 80 graphs, 8 regions | documents; lib/regions.js | 80, 8 | test-asserted |
| C · 17 graphs · 6 regions | node `c` graphs and regions | 17, 6 | test-asserted; "no concept spans more regions" verified (max 6); JavaScript 18 |
| row records (e.g. 3,885) and 15,618 total | sum of graph nodeCount | 15,618 | reproducible (Cairo R2) |
| concepts at home (e.g. 3,321) | concepts whose primary region is the row | sum 13,299 | reproducible (Cairo R2) |
| 4,656 on the map | overview ∪ multi-graph | 4,656 | build log, map title |
| first screen 572 / 754 px | design/measure.cjs | 572 / 754 | measured after last edit |
| payloads | gzip of served responses | landing 20,185 B; map data 125,502 B; search index 301,146 B | measured |

## 7. Stop test

- **S1** Frontier: no OPEN item; deferred: keyboard pan, prefers-color-scheme landing, predicates in the map panel, roving tabindex (each with a reason above). **Met.**
- **S2** All 8 seats PASS on the current state across R1 (Krug, Debord, Nietzsche) and R2 (Cairo, Tufte, Shklovsky, Holmes, Mace). **Met across two rounds, not in one WHOLE round**: Krug, Debord and Nietzsche judged the R1 state, before M8-M10.
- **S3** Two consecutive quiet WHOLE rounds: **not met** (R2 was a confirmation round of five seats). Resume point: convene R3, all 8 seats, on this state.
- **S4** Ambition push: M9 carried the Breaker (the thread) from the landing to all 4,656 concept pages; measured +~9 KB per page, 2 SVGs at 1:1. **Met.**
- **S5** Dotted edges: The End of Print declined (illegibility vs the acceptable pole); Dear Data applied (the thread). **Met.**

## 8. Anchor Ledger

| Anchor | Role | Status | Evidence | Note |
|---|---|---|---|---|
| How to Use Graphic Design to Sell Things, Explain Things, Make Things Look Better (Michael Bierut) | Stance | KEEP | plain claim h1, search first | survived Krug R0 |
| MAYA: Most Advanced Yet Acceptable (Raymond Loewy) | Criterion | KEEP | map overrule (Shklovsky R1) reasoned by it | — |
| The Visual Display of Quantitative Information (Edward Tufte) | Rule | KEEP | one scale (test) | survived Tufte R1 after units named |
| Envisioning Information (Edward Tufte) | Rule | KEEP | layering: dim cloud, white selection | — |
| Grid Systems in Graphic Design (Josef Müller-Brockmann) | Rule | KEEP | 8 rows x 80 blocks | — |
| The Medium Is the Massage (Marshall McLuhan, Quentin Fiore) | Breaker | KEEP | terminal chrome, xterm palette | survived Shklovsky R1 F3 ("familiar genre") as a claim, not a defect |
| The End of Print (David Carson, Lewis Blackwell) | Counterpoint | declined | — | legibility first |
| Dear Data (Giorgia Lupi, Stefanie Posavec) | Counterpoint | KEEP (pushed) | the thread, now on every concept page | — |
| Interaction of Color (Josef Albers) | Rule | KEEP | ΔE and contrast per zone | — |

## 9. Double loop

The graph and panel served; the process lacked one probe. The old site's worst defect (16.4 MB before the signature graphic could draw) was found by me reading the network panel, not by any listed probe, and the checklist's probes would have passed the old site's first screen. **Amendment:** add a "first interactive payload" probe (bytes transferred before the landing graphic is interactive, with the largest request named) to the measurement checklist. Second amendment, from Holmes R1: a figure whose parts are links must not carry `role="img"` (it hides them from assistive technology); the landing figure of Internet Structure had the same defect and is fixed in the same session.

## 10. Compliance Check

- [x] Tooling inventory (section 1)
- [x] Mode Adaptive with reason
- [x] Panel from the previous runs' picker output, R0 override reasoned
- [x] Seed with exact labels, two dotted counterpoints, Frontier (resolution tables)
- [x] Run type Full
- [x] Landing: one graphic summarizing all 8 regions and 80 graphs; bottom 572 / 754 px; no sideways scroll
- [x] Palette from the topic (xterm-256), one hue per region, ΔE and contrast measured per zone; zones vary (terminal / man page)
- [x] BREAK moves: M3, M5, M7, M9
- [ ] Decision Records before each move: M1-M7 written during the build (noted)
- [x] Panel reports R0-R2, each critic citing something observable
- [x] Every OBJECT resolved (section 4)
- [ ] S3 not met (section 7)
- [x] Printed figures re-measured at the final state (section 6)
- [x] Anchor ledger, double loop
- [x] Run recorded in the dada-changes ledger (import_log.py), see the final reply

## Human grade

- **Grade:** A- (2026-11-12, on the final state).
- **Words, verbatim:** "Ok push that main a minus good job"
