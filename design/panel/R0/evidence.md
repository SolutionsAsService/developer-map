# R0 evidence: premortem on the inherited Developer Map (legacy branch, main @ c920d2a), measured 2026-11-12

Screenshots: design/shots/R0/dm0_1280.png (landing, 1280x800), dm0_375.png (375x812), dm1_map.png (the map section, scrolled, 1280).

- Stack: hand-written static site (index.html + src/app.js 54.9 KB, network.js 24.8 KB, styles.css 61.6 KB, map-key.js, details.js). Canvas map.
- First interactive load fetches data/overview.json = 16,417,784 bytes (16.4 MB) before the map can draw. Full evidence then loads from content-addressed shards: data/details holds 1,399 files, 266 MB. data/atlas.json 51.8 MB is also committed. Repository checkout 354 MB.
- The page is 7,270 px tall at 1280 wide. The map sits below the fold (starts ~y 860 at 1280); the first screen shows a headline ("Trace a relationship. Check its source."), a three-row "Docker connections" card and four count tiles (13,299 canonical records / 19,024 explicit relationships / 1397 cross-source concepts / "19000 source links + 24 labeled editorial links").
- The map draws ~4,300 overview concepts from 80 sources as a single dense cloud; at 1280 most dots are purple/blue/pink with a handful of 7-9 px labels overlapping ("Application programming…", "Fortran programming lan…"). The map key lists 16 domain colours for 80 sources.
- A "Dataset" <select> lists 80 sources. A canvas-free text index exists further down.
- README claims "all 37 source graphs", "1,529 concepts", "111 detail shards"; the data now holds 80 graphs, 13,299 concepts, 1,399 shards.
- Every page is one URL (no per-concept or per-graph pages); deep links use query parameters.
