# Critic: Inclusion (Mace) - R2

**Anchor used:** Mace, Principles of Universal Design: 6 Low Physical Effort, 4 Perceptible Information, 2 Flexibility in Use.

**Observed** (real Tab presses, Playwright, 1280x800, production build :3200)
- Landing: after "Follow C" (stop 10) the next stops are the 8 region rows (11-18), the C thread link (19), the "how concepts are merged" link (20), then the first region card (21). That is 10 stops between hero buttons and cards, down from 89. No block receives focus (tabIndex -1).
- /concepts/docker: after the search input and breadcrumbs (7-9) come the 8 region rows (10-17), the "Docker: 5 graphs, 3 regions" thread link (18), then the references. 9 stops through the figure, down from 89.
- Focus visibility: rows show the 3px #8ab4ff stroke on the rect (anchor outline none); thread links and all other stops show a 3px solid outline. Every sampled stop is visible.

**Findings**
1. [resolved] R1 F1 (88 Tab stops) is fixed; 8 rows plus a thread link is proportionate.
2. [observation, not a defect] The 8 row stops duplicate the region cards that follow (and the caption link adds one). The effort is small and each stop is a meaningful destination.
3. [carried, minor] R1 F2 (no map keyboard pan) unchanged; selection centres the view, so the route works.

**Verdict: PASS**

**Requested change:** None required. Optional: make the rows one roving stop.
