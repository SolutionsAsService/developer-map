# R1 evidence: WHOLE round on the rebuilt Developer Map (branch claude/site-redesign-nextjs-vgji7d)

Measured 2026-11-12T02:00Z on a production build after the last edit. Raw: design/panel/measure-R1.json (design/measure.cjs; probe fixtures fire). Live: http://localhost:3200 (Playwright: `NODE_PATH=$(npm root -g) node script.cjs`). Source: /home/user/developer-map (app/, components/, lib/). Decisions: DESIGN-LOG.md. R0 reports on the old site: design/panel/R0/.
Screenshots (first viewport): design/shots/R1/dr1_<page>_<width>.png for /, /map, /regions, /regions/networks, /graphs/docker, /concepts/c, /about; map with Docker selected: dr1_map_sel_1280.png / _375.png.

## Structure
Next.js 16, every page pre-rendered: / , /map, /regions + 8, /graphs + 80, /concepts + 4,656, /about, sitemap. Header on every page: wordmark, Map / Regions / Graphs / About, and a search box ("/" focuses it) over all 13,299 concepts (index fetched on first focus).

## Landing
- h1: "13,299 developer concepts. 1,397 of them turn up in more than one graph." (1,397 = concepts whose merged records come from 2+ source files; equals the pipeline's summary.overlaps; test-asserted.)
- Figure: 8 rows (regions, xterm colours) x 80 blocks (graphs); block width = concept count x one scale for all rows (0.152 px/concept at 1280; test-asserted); a white thread with dots on the 17 graphs containing C, snaking row to row; label "C · 17 graphs · 6 regions". Rows link to /regions/<id>, blocks to /graphs/<id>.
- First screen union (h1 + figure + caption) bottom: 552 px at 1280x800, 800 px at 375x812. No sideways scroll.
- Below: 8 region cards (bar = concepts at home in the region, one scale), the 40 most shared concepts as chips.

## Map
4,656 concepts (the connected overview plus every multi-graph concept), 9,717 links. Region homes fixed on a ring; d3-force at build; canvas in the browser. Select (click, find box with listbox, ?c=slug) lights the concept's links in white, rings it, centres it and lists neighbours as buttons; focus moves to the panel heading. Region toggle buttons (aria-pressed). Disclosure under the title: 4,656 of 13,299 and why; nearness means "linked", not measured.

## Colour
Terminal zone (dark #0c0f14): xterm 220, 208, 44, 69, 77, 170, 203, 250; white = trace; region min ΔE 44; contrast 5.85-13.68:1. Man-page zone (light #f6f4ee) on concept, graph and About pages: darker equivalents, min ΔE 29, contrast 4.56-5.79:1.

## Probes (9 pages x 2 widths)
Overflow 0; HTML contrast failures 0; SVG text below 4.5:1: 0 (smallest SVG text 14 px at 1280, 15 px at 375); small targets 0; 384 internal links, 0 broken; no-JS landing renders 80 blocks and the h1; no-JS /concepts/c renders 223 link rows.

## Speed
Old: 16,417,784 B overview.json before the map drew, plus 168 KB of scripts; 354 MB checkout. New: landing HTML 152,627 B raw / 19,472 B gzip (figure included); framework JS ~176 KB gzip; /map-data.json 362,010 B / 125,502 B gzip (map page only); /search-index.json 1,401,160 B / 301,146 B gzip (on first search); concept pages 20-25 KB gzip; checkout 24 MB.
