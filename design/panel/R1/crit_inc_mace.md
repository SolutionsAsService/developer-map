# Critic: Inclusion (Mace) - R1

**Anchor used:** Mace, Principles of Universal Design: 2 Flexibility in Use, 4 Perceptible Information, 6 Low Physical Effort, 7 Size and Space for Approach and Use.

**Observed** (real Tab presses, Playwright, 1280x800, production build on :3200)
- Header (skip link, wordmark, 4 nav links, search), map (find box, 8 region toggles, zoom buttons, footer links) and concept page (breadcrumbs, links): every stop shows a 3px solid outline, offset 2px, blue #8ab4ff on dark or #1d4ed8 on light. Visible in all stops sampled.
- Landing figure: SVG anchors have outline none, but the inner rect takes a 3px #8ab4ff stroke. Screenshot confirms the Languages row ringed clearly. Blocks behave the same.
- Header search: "/" focuses; role=combobox, aria-expanded, aria-activedescendant; ArrowDown moves the active option (aria-selected true); Enter navigates (to /graphs/docker#event-...); focus stays on the input.
- Map: find box listbox (10 options) with ArrowDown/Enter selects "Docker Image"; URL gets ?c=; focus lands on the panel H2. Tab then reaches "Open the full page", then neighbour buttons; Enter on a neighbour re-selects and focus returns to the new H2. Canvas is role=img, tabindex -1; every canvas function has a keyboard route.
- Targets: zoom 44x44, toggles 40 high.

**Findings**
1. [defect] The landing figure is 88 consecutive Tab stops (8 rows + 80 blocks, plus the thread link) between the hero buttons and the region cards. No bypass. Mace 6: sustained effort for keyboard and switch users. The cards below duplicate the row links.
2. [defect, minor] Map has no keyboard pan, only zoom and fit. Selection centres the view, so the route still works. Low priority.
3. [claim] "Focus moves to the panel heading" is true and the heading ring is visible.

**Verdict: OBJECT** (finding 1 only)

**Requested change:** Make the figure a single tab stop (roving tabindex: Tab enters, arrows move across blocks and rows, Tab leaves) or add a "Skip the figure" link after the C thread link. Keep the current stroke focus ring.
