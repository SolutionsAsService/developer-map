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
