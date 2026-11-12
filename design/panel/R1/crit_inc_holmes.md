# Critic: Inclusion (Holmes), R1

**Anchor used:** Mismatch: exclusion is a mismatch between person and interface; permanent, temporary and situational share one cause. Solve for one, extend to many.

**Observed**
- Landing: no-JS render has 80 blocks and the h1. HTML is 19 KB gzip. Probes show 0 small targets, 0 overflow, 0 contrast failures. Region identity is carried by colour and also by row text (dr1__375.png: "Languages 3,885"). The trace is a white thread with dots plus a text label, so it does not rely on hue.
- Map: the canvas is `role="img"` with a label that points to the search box and the panel list (MapCanvas.jsx:228). Selection has a combobox, an Escape key, and focus moved to the panel heading. Region toggles are buttons with text. The map data is 125 KB gzip.
- CSS has `:focus-visible` (globals.css:62), `prefers-reduced-motion` and `forced-colors`. There is no `prefers-color-scheme` handling; the dark and light zones are fixed per page type.

**Findings**
1. [defect] StackFigure.jsx:13 sets `role="img"` on an SVG that holds 88 `<Link>`s. In the ARIA spec `img` makes its children presentational, so many screen readers will not expose the region and graph links. Keyboard Tab still lands on them, but silently. The aria-labels on the links (StackFigure.jsx:22, 28) are the main content for the permanent blind user and they are likely hidden. The stated "every row and block is a link" is not delivered to that user.
2. [defect] The map's per-concept knowledge is reachable only by search or by picking a neighbour after a first selection. The canvas has no keyboard way to step through nodes, and no list of concepts until something is selected. This is fine for a screen-reader user who knows what to search for. It is poor for browsing, which is the map's purpose. The "nearness means linked" text is not available as a navigable list.
3. [defect] On the phone (dr1_map_sel_375.png) the hint text "click · esc clears" runs under the zoom buttons and is clipped. The hint also names "esc", which a touch user does not have, and "scroll", which a touch user does not use. This is a situational mismatch (one thumb, glare).
4. [claim] Colour-only region encoding on the canvas: lenses are 8 hues at min ΔE 44. In the selected view, labelled neighbours and the panel text carry the names, so colour-vision deficiency is covered for the selected concept. Unselected clouds rely on hue only, and the toggle buttons give a non-colour way to isolate a region. I accept this.
5. [premise] Fixed dark "terminal" landing: a user with light-mode preference, photophobia or bright-sun use gets no choice. Cheap to extend with prefers-color-scheme.

**Verdict: OBJECT** (finding 1 is a defect for the permanent case).

**Requested change**
- Drop `role="img"` from the figure SVG. Use `role="group"` with `aria-labelledby` pointing at the title and desc, so the links stay exposed. Re-test with a screen reader.
- Give the map a "browse concepts" list (the connected overview, grouped by region) before selection.
- On touch, change the map hint to "tap · drag · pinch". Move the hint clear of the zoom buttons.
