Anchor used: Tufte, graphical integrity (one scale, lie factor ~1, label the data) and data-ink.

Observed
- Landing figure (dr1__1280.png): one scale holds. Row ends measured against labels: Languages 3,885 gives about 577 px, Networks 2,714 gives about 412 px, Paradigms 1,607 gives about 244 px. All are about 0.152 px per concept, and the baseline is zero. Lie factor is about 1.
- Region cards (dr1_regions_1280.png): Languages 3,321 gives 254 px, Paradigms 1,169 gives 90 px, Networks 2,449 gives 188 px, Machines 880 gives 67 px, P2P 529 gives 40 px. All are about 13 concepts per px, so one scale.
- Graph page (dr1_graphs_docker_1280.png): no bars. Counts are in numerals and chips.
- Map (dr1_map_sel_1280.png): position encodes no measured quantity, and the page says so.

Findings
1. [defect] The same region carries two different totals on the same landing page. The figure row says "Languages 3,885" (sum of graph sizes, overlaps counted twice). The card below says "3,321 concepts". Networks reads 2,714 against 2,449. Neither number is labelled as to what it counts, and the page's own subject is overlap.
2. [defect] The two bar systems use different scales, 0.152 px per concept in the figure and about 0.076 px per concept in the cards. They sit one screen apart, so Languages looks half as long in one as in the other. The intro line says "one scale" for both, which overclaims.
3. [claim] The thread is the only data-ink that does extra work. Its dots and snake route add connecting length that encodes nothing. It does not undermine the block widths.
4. [claim] Small blocks (Peer-to-peer, Security, the tail of Web) are 2 to 8 px wide and unlabelled. They are legible only through the row link and hover.
5. [premise] The map's haze of overplotted links is disclosed as "linked, not measured". Under Tufte this passes as decoration with honest labelling.

Verdict: OBJECT. The data-ink is mostly honest, but finding 1 is a graphical-integrity defect, because one entity is given two unlabelled totals.

Requested change
- Label the figure rows "3,885 placements" (or similar) and the cards "3,321 home concepts". Better, put both in one place, for example "3,321 at home, 3,885 incl. shared".
- Either use one px per concept across the figure and the cards, or drop "one scale" from the card intro.
