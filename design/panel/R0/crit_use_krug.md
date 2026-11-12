**Critic: Usability (Krug)**

**Anchor used:** Five-second test; what is clickable; first action; needless words.

**Observed:** dm0_1280: headline "Trace a relationship. Check its source.", lime "Explore Docker" button, Docker card with 3 rows, four stat tiles ("1397" and "13,299" in different number styles), then search box, "Dataset" select, tabs. dm1_map: map is one dense purple/blue/pink cloud, 7-9 px grey labels overlap; right panel says "{ ? }  Pick a starting point." and lists links with arrows. Map starts ~y 860 (evidence). The 375 shot shows the Docker card pushed below the button.

**Findings**
F1 [defect] Five-second test fails: the first screen never says what the thing is. "Trace a relationship" does not name a subject; the user must read two lines to learn it is concepts and networks/languages/infrastructure.
F2 [defect] First action is ambiguous: "Explore Docker" is the primary button, but the site covers 80 sources; why Docker? "Click to inspect", "Select one", the card and the stats all compete for the click.
F3 [defect] Clickability unclear: the three Docker rows, the stat tiles, and the "SOURCE/EDITORIAL" tags all carry the same small arrow; nothing separates a link from a label.
F4 [defect] The map itself is unreadable as the thing to click: thousands of same-weight dots, overlapping 7-9 px labels. The user cannot pick a node; the side panel "Pick a starting point" is the real, better first action, but it sits below the fold.
F5 [claim] Needless words: "Originals preserved", "dimmed context retained", "01 — 03", "01 / WORKSPACE", "19000 source links + 24 labeled editorial links" are insider noise.
F6 [premise] Users will want to browse a 4,300-dot field; evidence suggests they want to look up one concept.

**Verdict:** OBJECT

**Requested change:** One-sentence subject line; one primary action (search box, above the fold); sample concepts as plain links; cut tile and jargon copy; label only a few big nodes.
