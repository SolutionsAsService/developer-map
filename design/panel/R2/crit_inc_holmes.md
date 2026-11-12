# Critic: Inclusion (Holmes), R2

**Anchor used:** Mismatch: exclusion is a mismatch between person and interface; permanent, temporary and situational share one cause.

**Observed** (live, Playwright ariaSnapshot, 1280 and 375 touch)
- Figure SVG is role=group, named by title + desc. Its accessibility tree lists the region and graph links with names ("Languages: 15 graphs, 3885 records"); 178 anchors present, none presentational.
- Map, before any selection: 32 concept buttons, 4 per region, after the 8 region toggles.
- Hint on a coarse pointer reads "tap a dot · drag · pinch to zoom"; at 375 it sits x 28-258, clear of the zoom buttons. The mouse hint is hidden on touch.

**Findings**
1. [resolved] Links exposed to the screen-reader tree (role=group).
2. [resolved] Browse route on the map exists before selection.
3. [resolved] Touch hint is correct and unclipped.
4. [premise, not a defect] No prefers-color-scheme alternative to the fixed dark landing. Offered in R1 as cheap; it remains an extension, not a mismatch I can show broke a task.
5. [claim] Blocks are tabindex=-1: Tab reaches 8 rows, blocks stay reachable by screen reader and pointer. Acceptable.

**Verdict: PASS**

**Requested change:** none required. Optional: prefers-color-scheme for the landing.
