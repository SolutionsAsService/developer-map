# R2 evidence: confirmation round for the R1 objections (Cairo, Tufte, Shklovsky, Holmes, Mace)

Measured 2026-11-12T02:09Z on a production build after the last edit. Raw: design/panel/measure-R2.json. Live: http://localhost:3200. Screenshots: design/shots/R2/ (dr2_<page>_<width>.png; map with Docker selected: dr2_map_sel_*.png). Your R1 report: design/panel/R1/<seat>.md.

Changes since R1:
- Cairo F1 (C "more than any other concept" false: JavaScript is in 18 graphs): lede now reads "...it turns up in 17 graphs across 6 of the 8 regions. No concept reaches more regions, and of the 6 that reach 6, C is in the most graphs (the most-shared concept overall is in 18)." All figures computed in app/page.jsx.
- Cairo F2 + Tufte F1 (row totals vs distinct concepts, unlabelled): figure rows read "15 graphs · 3,885 rec." (records); caption (1280) / note below the hero (375): "Block width = the graph's own records, so a concept shared by two graphs counts in both (15,618 records for 13,299 concepts)." Region cards read "3,321 concepts at home"; About explains records versus concepts.
- Tufte F2 ("one scale" claimed across figure and cards): card intro now says the card bars "share one scale with each other".
- Debord (optional): caption adds "'Shared' means the same label after normalising (how concepts are merged)".
- Krug: "1,397 of them" no longer underlined (yellow, not a link style); the thread label "C · 17 graphs · 6 regions ›" is a link at both widths; the "xterm" caption sentence removed (kept on About).
- Shklovsky F4 (concept pages lose the device): every concept page now opens with its own thread through the 80 graph blocks on a dark panel ("Docker in 5 of 80 graphs · 3 of 8 regions · 122 recorded links"), at 1:1 (mini 760 wide; narrow 343 on phones). Shklovsky F2 (map is a stock hairball): not changed; see DESIGN-LOG resolutions.
- Holmes F1 (role="img" hid the figure's links): figure SVGs are now role="group" with aria-labelledby title + desc. Holmes F2 (no browse route before selection): map panel lists the 4 most connected concepts of each region as buttons. Holmes F3 (touch hint): hint reads "tap a dot · drag · pinch to zoom" on coarse pointers and is kept clear of the zoom buttons (max-width calc(100% - 84px)).
- Mace F1 (88 Tab stops in the figure): the 80 graph blocks have tabIndex=-1 (still clickable and exposed to screen readers); Tab visits the 8 region rows and the thread label only. Same on concept-page threads.
- Nietzsche (thread over block labels): thread dots now sit in the gap above the blocks (y = block top - 1).

Probes after the edits: first-screen union bottom 572 px at 1280, 754 px at 375; overflow 0; contrast failures 0; small targets 0; 384 internal links, 0 broken; fixtures fire. Tests 8/8.
