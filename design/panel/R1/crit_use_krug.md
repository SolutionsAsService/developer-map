**Critic: Usability (Krug)**

**Anchor used:** Five-second test, legibility probe, first action, trunk test, needless words.

**Observed:**
- dr1__1280: the h1 names the subject and scale ("13,299 developer concepts... 1,397 ... more than one graph"). Eyebrow "80 KNOWLEDGE GRAPHS · ONE MAP". Search box top right ("search 13,299 concepts"). Two buttons: "Open the map" (filled) and "Follow C".
- Probe, 1280 first screen only: the site is a map of developer concepts drawn from 80 source graphs. Three topics: Languages, Networks, Security & crypto (blocks Python, COBOL, IPv6, OSI, GC are visible too). Trace C: the white thread starts on the C block in Languages and runs through Paradigms & compilers, Machines, Systems and Networks to Security & crypto. It touches 6 of 8 regions and 17 graphs, as the label says.
- 375: h1, one button, then the legend and figure. The figure's label says "C · 17 graphs · 6 regions", but the paragraph explaining the thread and the "Follow C" button are below the fold, so the thread is unexplained. Row labels are shortened ("Web", "Security").
- dr1_concepts_c_1280 (trunk): wordmark, nav and search are all present. Breadcrumb "~ / languages / c". The kind label "programming language" says what this page is.

**Findings**
1. [claim] "1,397 of them" is underlined like a link but is not one (dr1__1280). Underline should mean clickable. Use bold or a colour instead.
2. [claim] Two competing first actions: "Open the map" and "Follow C". Search is a third. "Follow C" is the better first action; it is the one that teaches the figure. Fine at 1280, but it is missing at 375.
3. [claim] Needless words and jargon: "Colours are xterm terminal colours, one per region" says nothing to a user. On the concept page, "C:relationships:241" under every link is provenance noise.
4. [premise] The h1 reads as a statistic, not a purpose. The eyebrow and the paragraph carry the "what is it", which works but is thin at 375.
5. [claim] Concept pages show no current section in the nav (no highlight on the page you are in). Minor; the breadcrumb compensates.

**Verdict:** PASS. The first screen passes the five-second test and the legibility probe at both widths. No finding is a blocker.

**Requested change:** Remove the underline from "1,397". Show "Follow C" at 375, or make the label "C" itself tappable. Drop the "xterm" sentence. Fold the provenance lines into a title or tooltip.
