# Critic: Evidence (Cairo), R1

**Anchor used:** Cairo, The Truthful Art / How Charts Lie: a chart is an argument; the display must not claim more than the data holds; disclose what is excluded and what position means.

**Observed:** Reproduced from lib/atlas.js: 13,299 concepts; 1,397 in 2+ graphs; 80 graphs; C in 17 graphs and 6 regions. Region counts 15/8/5/10/14/11/7/10 match the live rows. Live DOM: block widths scale (cobol 70.2, python 60.6 ...). Map page prints "4,656 of 13,299 ... nearness means 'linked', not any measured distance." Landing figure (dr1__1280.png) is legible, zero-based widths, one scale. The landing SVG exists twice (760 px shown, one display:none), 8 rows/80 blocks each, which is fine.

**Findings:**
1. [defect] The caption says C is in "17 graphs across 6 of the 8 regions, more than any other concept." Measured: javascript is in 18 graphs, cpp in 17 (C ties). The claim holds only for region span (6 vs 4 and 3). The sentence reads as graph count, so it is false as written.
2. [defect] Row labels "3,885", "1,607" ... sum to 15,618 (graph node counts), not 13,299. Shared concepts are counted in every graph they appear in. The h1 shows 13,299 and the rows show a different total, with no note. Cairo: the unit (concept-memberships, not distinct concepts) must be named. The region cards below use "at home" counts, so the two panels disagree silently.
3. [claim] Underlined "1,397 of them" is not encoded in the figure. Only C's thread shows overlap, so the figure supports the headline by one example. This is acceptable as an illustration, but it is not labelled as one.
4. [premise] Colour: 8 regions, 80 blocks. Region colour is decodable, and the legend, direct labels and ΔE 44 are adequate. This resolves R0 F3.
5. [premise] The map disclosure (sample, rule, meaning of nearness) resolves R0 F1/F6. Counts are computed and test-asserted, resolving F5.

**Verdict:** OBJECT (findings 1 and 2 are observable errors on the first screen).

**Requested change:** Reword to "in 6 of the 8 regions, more than any other concept" or "17 graphs, joint second". Label the row counts "concept-graph entries (shared concepts counted per graph)" or use distinct concepts, and state that 15,618 entries come from 13,299 concepts.
