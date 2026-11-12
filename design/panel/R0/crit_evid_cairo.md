# Critic: Evidence (Cairo), R0

**Anchor used:** Cairo, The Truthful Art / How Charts Lie: a chart is an argument; show enough to support it, mark uncertainty, and never let the display claim more than the data holds.

**Observed:** dm1_map.png shows one undifferentiated cloud (~4,300 dots, 80 sources) with five overlapping 7-9 px labels, and the sidebar reads "{ ? } Pick a starting point." Headline: "Trace a relationship. Check its source." Stat tiles: 13,299 / 19,024 / 1397 / "19000 source links + 24 labeled editorial links". README says 37 graphs, 1,529 concepts; data holds 80, 13,299. Map starts ~y 860 of a 7,270 px page. Key shows 16 colours for 80 sources. overview.json is 16.4 MB.

**Findings:**
F1 [defect] The map is a hairball: dense overlap hides structure and edges. Position and proximity imply clusters that nothing in the view explains. No axis, scale or "what does distance mean" note.
F2 [claim] "Trace a relationship" is promised by the headline, but the map shows no relationships, only nodes. The claim lives in a below-fold sidebar.
F3 [defect] 16 colours for 80 sources: colour cannot be decoded to a source. Most dots are purple/blue, so the encoding carries no information. The headline's "check its source" is undermined.
F4 [defect] The tiles mix units ("19000" unformatted vs "13,299" formatted) and set 24 editorial links beside 19,000 source links in one tile. The proportion is unmarked. The "SOURCE/EDITORIAL" labels are good provenance, but only in the card.
F5 [premise] The README's stale counts (37/1,529 vs 80/13,299) mean stated figures cannot be trusted. Counts should be generated from the data, not typed.
F6 [premise] An ~4,300-concept overview drawn from 13,299 is a sample. The page never says what was left out or why.
F7 [defect] Labels are illegible (7-9 px, overlapping). A 16.4 MB blocking fetch delays the only evidence view.

**Verdict:** OBJECT

**Requested change:** Lead the first screen with a legible, small, honest view: a few named relationships with source and editorial marked, and counts computed from the data. Disclose the sampling and the meaning of position. Cut colours to a decodable few, or encode by source explicitly. Show the map only after filtering or focusing.
