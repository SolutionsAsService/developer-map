const state = {
  atlas: null,
  byId: new Map(),
  edgesById: new Map(),
  searchText: new Map(),
  selected: null,
  featuredEdge: null,
  topic: "all",
  query: "",
  catalogQuery: "",
  catalogLimit: 36,
  route: null,
  routeStep: 0,
  routesExpanded: false,
  edgeFocus: false,
  neighborhood: true,
  selectionHistory: [],
  relationQuery: "",
  relationDirection: "all",
  relationKind: "all",
};
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const humanize = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const category = (node) => window.DeveloperMapKey.groupOf(node);

function connectIndexes(atlas) {
  state.byId = new Map(atlas.nodes.map((node) => [node.id, node]));
  state.edgesById = new Map();
  for (const edge of atlas.edges) {
    for (const id of new Set([edge.source, edge.target])) {
      if (!state.edgesById.has(id)) state.edgesById.set(id, []);
      state.edgesById.get(id).push(edge);
    }
  }
  state.searchText = new Map(
    atlas.nodes.map((node) => [
      node.id,
      [
        node.id,
        node.label,
        ...(node.aliases || []),
        node.type,
        node.description,
        node.note?.intuition,
        ...node.variants.flatMap((variant) => [
          variant.document,
          ...variant.fields.map((field) => JSON.stringify(field.value)),
          ...variant.claims.map((claim) => JSON.stringify(claim)),
          ...(variant.related || []).map((item) => JSON.stringify(item.record)),
        ]),
        ...(state.edgesById.get(node.id) || []).map(
          (edge) => `${edge.relation} ${edge.semantic}`,
        ),
      ]
        .join(" ")
        .toLowerCase(),
    ]),
  );
}

function relationDescription(edge, id) {
  const other = state.byId.get(edge.source === id ? edge.target : edge.source);
  const direction = edge.source === edge.target ? "↻" : edge.source === id ? "→" : "←";
  const relation = edge.semantic || humanize(edge.relation).toLowerCase();
  return { other, direction, relation };
}

let detailsLoader;
let selectionGeneration = 0;
const detailStates = new Map();
let pathsPromise;
function detailStatus(id) { return !state.atlas.lightweight ? 'ready' : detailStates.get(id)?.status || 'loading'; }
function statusMarkup(id) {
  if (detailStatus(id) === 'ready') return '<p class="detail-status ready" role="status">Evidence loaded · all recorded incident relationships</p>';
  const error = detailStates.get(id)?.error;
  return '<div class="detail-status" role="status"><strong>' + (error ? 'Evidence unavailable · overview retained' : 'Loading full evidence…') + '</strong><p>All recorded incoming/outgoing links are visible. Original fields, citations and source context are not yet loaded; this is a partial record.</p>' + (error ? '<p>' + escapeHtml(error) + '</p><button type="button" data-retry-details>Retry evidence</button>' : '') + '</div>';
}
function refreshSelectedDetails() {
  const host = $('#map-preview'), priorScroll = host.scrollTop;
  const active = document.activeElement, activeId = active?.id;
  const start = active?.selectionStart, end = active?.selectionEnd;
  renderPreview(); renderInspector(); host.scrollTop = priorScroll;
  if (activeId && host.querySelector('#' + activeId)) {
    const replacement = host.querySelector('#' + activeId); replacement.focus({preventScroll:true});
    if (start != null && replacement.setSelectionRange) replacement.setSelectionRange(start,end);
  }
}
async function loadSelectionDetails(id, generation) {
  if (!state.atlas.lightweight || detailStatus(id) === 'ready') return;
  detailStates.set(id, {status:'loading'});
  try {
    const result = await detailsLoader.concept(id, state.edgesById.get(id) || []);
    Object.assign(state.byId.get(id), result.node);
    const edgeMap = new Map(state.atlas.edges.map(e => [e.id,e]));
    for (const edge of result.edges) Object.assign(edgeMap.get(edge.id), edge);
    for (const doc of result.documents) Object.assign(state.atlas.documents.find(d => d.file === doc.file), doc);
    detailStates.set(id, {status:'ready'});
  } catch (error) {
    detailStates.set(id, {status:'error', error: error.name === 'AbortError' ? 'Request timed out. Try again.' : error.message});
  }
  if (state.selected === id && generation === selectionGeneration) refreshSelectedDetails();
}
async function ensurePaths() {
  if (!state.atlas.lightweight || state.pathsLoaded) return;
  if (!pathsPromise) pathsPromise = detailsLoader.paths().then(paths => {state.atlas.paths=paths;state.pathsLoaded=true;}).catch(error => {pathsPromise=null;throw error;});
  await pathsPromise;
}
function selectConcept(id, { scroll = false, remember = true } = {}) {
  id = state.atlas.aliases?.[id] || id;
  if (!state.byId.has(id)) return;
  if (remember && state.selected && state.selected !== id) state.selectionHistory.push(state.selected);
  state.relationQuery = "";
  state.relationDirection = "all";
  state.relationKind = "all";
  state.selected = id;
  const generation = ++selectionGeneration;
  state.edgeFocus = false;
  network?.edgeFocus(false);
  $("#edge-focus").setAttribute("aria-pressed", "false");
  $("#edge-focus").textContent = "Emphasize one edge";
  renderMap();
  renderPreview();
  renderInspector();
  loadSelectionDetails(id, generation);
  if (scroll) $("#explorer").scrollIntoView({ behavior: "smooth" });
  history.replaceState(
    null,
    "",
    `${location.pathname}?concept=${encodeURIComponent(id)}#explorer`,
  );
}

function clearSelection({ fit = false } = {}) {
  if (!state.selected && !fit) return;
  const wasFocused = Boolean(state.featuredEdge);
  state.selected = null;
  selectionGeneration++;
  state.featuredEdge = null;
  if (fit || wasFocused) network.fit();
  renderMap();
  renderPreview();
  renderInspector();
  const url = new URL(location.href);
  url.searchParams.delete("concept");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function renderFilters() {
  const filters = [
    { id: "all", label: "All sources" },
    ...state.atlas.documents.map((doc) => ({
      id: doc.graphId,
      label: doc.title,
    })),
  ];
  $("#topic-filters").innerHTML = `<label class="source-select-label">Dataset <select id="source-select" aria-label="Choose source dataset">${filters.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === state.topic ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label><span id="source-filter-summary">${state.atlas.documents.length} sources · dimmed context retained</span>` + `<div class="source-filter-buttons">` + filters
    .map(
      (item) =>
        `<button type="button" class="filter ${item.id === state.topic ? "active" : ""}" data-topic="${escapeHtml(item.id)}" aria-pressed="${item.id === state.topic}">${escapeHtml(item.label)}</button>`,
    )
    .join("") + "</div>";
  $("#source-select").addEventListener("change", event => { state.topic=event.target.value; renderFilters(); renderSearch(); renderMap(); renderCatalog(); });
  $("#topic-filters")
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () => {
        state.topic = button.dataset.topic;
        renderFilters();
        renderSearch();
        renderMap();
        renderCatalog();
      }),
    );
}

function inTopic(node) {
  return state.topic === "all" || node.topics.includes(state.topic);
}
function filteredNodes(query) {
  const term = query.trim().toLowerCase();
  const rank = (node) =>
    node.id.toLowerCase() === term
      ? -1
      : node.label.toLowerCase() === term
      ? 0
      : node.label.toLowerCase().startsWith(term)
        ? 1
        : node.claim
          ? 4
          : node.label.toLowerCase().includes(term)
            ? 2
            : 3;
  return state.atlas.nodes
    .filter(
      (node) =>
        inTopic(node) &&
        (!term || state.searchText.get(node.id).includes(term)),
    )
    .sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label));
}

function renderSearch() {
  const host = $("#search-results");
  if (!state.query.trim()) {
    host.hidden = true;
    return;
  }
  const matches = filteredNodes(state.query);
  const results = matches.slice(0, 9);
  host.hidden = false;
  host.innerHTML = `<div class="search-meta">${matches.length} matches in ${state.topic === "all" ? "the full concept index" : "this source"} · names, aliases, descriptions &amp; link summaries</div>${results.map((node) => `<button type="button" data-concept="${escapeHtml(node.id)}"><span class="result-dot ${category(node)}"></span><span><strong>${escapeHtml(node.label)}</strong><small>${escapeHtml(node.description || node.note?.intuition || "No description supplied")}</small></span><span class="result-arrow">↗</span></button>`).join("") || '<p class="search-empty">No matching concepts. Try a broader term or another source.</p>'}`;
  host.querySelectorAll("[data-concept]").forEach((button) =>
    button.addEventListener("click", () => {
      selectConcept(button.dataset.concept);
      state.query = "";
      $("#search").value = "";
      renderSearch();
    }),
  );
}

let network;
function renderMap() {
  network?.select(state.selected);
  network?.topic(state.topic);
  $("#details-jump").hidden = !state.selected;
  $("#edge-focus").hidden = !state.selected;
  $("#neighborhood-view").hidden = !state.selected;
  $("#fit-selection").hidden = !state.selected;
  $("#selection-back").disabled = !state.selectionHistory.length;
  $("#neighborhood-view").setAttribute("aria-pressed", String(state.neighborhood));
  $("#neighborhood-view").textContent = state.neighborhood ? "Highlight · same map" : "Whole-map context";
  $("#map-mode").textContent = state.selected
    ? `FOCUS / ${state.byId.get(state.selected).label.toUpperCase()} · ALL INCIDENT LINKS / ALL SOURCES`
    : "WHOLE FIELD / ALL NODES ARCHIVED · CONNECTED CONCEPT OVERVIEW";
  $("#map-count").textContent =
    `${state.atlas.overview.nodeIds.length.toLocaleString()} overview nodes · ${state.atlas.overview.edgeIds.length.toLocaleString()} overview links / ${state.atlas.nodes.length.toLocaleString()} archived nodes · ${state.atlas.edges.length.toLocaleString()} archived links${state.selected ? ` · ${(state.edgesById.get(state.selected) || []).length} incident links · ${network?.counts().connected || 0} direct neighbors · all sources (overview filter does not hide incident links)` : ""}`;
  const directed = (state.edgesById.get(state.selected) || []).filter(
    (edge) => window.DeveloperMapKey.classify(edge).arrow,
  );
  const connections = state.edgesById.get(state.selected) || [];
  state.featuredEdge =
    connections.find(
      (edge) =>
        [edge.source, edge.target].includes("container") &&
        [edge.source, edge.target].includes("docker"),
    ) ||
    directed.find(
      (edge) => window.DeveloperMapKey.classify(edge).id === "orchestration",
    ) ||
    directed[0] ||
    connections[0] ||
    null;
  if (state.featuredEdge) network?.focusEdge(state.featuredEdge);
}

function sourceTitle(file) {
  return (
    state.atlas.documents.find((document) => document.file === file)?.title ||
    (file === "curated" ? "Editorial relationship" : file)
  );
}

function lineSample(style) {
  const endpoint = style.arrow ? 34 : 41;
  const head =
    style.arrow === "filled"
      ? `<path d="M40 5 32 1v8z" fill="${style.color}"/>`
      : style.arrow === "open"
        ? `<path d="m33 1 7 4-7 4" fill="none" stroke="${style.color}" stroke-width="2"/>`
        : "";
  return `<svg class="line-sample" viewBox="0 0 42 10" width="42" height="10" aria-hidden="true"><path d="M1 5 H${endpoint}" fill="none" stroke="${style.color}" stroke-width="2.2" stroke-dasharray="${style.dash.join(" ") || "none"}"/>${head}</svg>`;
}

function renderMapKey() {
  const key = window.DeveloperMapKey;
  $("#domain-key").innerHTML =
    `<span class="key-title">POINTS / DOMAINS</span>${key.domains.map((domain) => `<span class="domain-item"><i style="--domain-color:${domain.color}" aria-hidden="true"></i>${escapeHtml(domain.label)}</span>`).join("")}`;
  $("#relation-key").innerHTML =
    key.relationships
      .map(
        (style) =>
          `<span class="relation-key-item" title="${escapeHtml(style.description)}">${lineSample(style)}${escapeHtml(style.label)}</span>`,
      )
      .join("") +
    '<span class="key-note">Arrow = recorded source → target. A bridge is editorial and clearly marked; inspect each original record for context.</span>';
}

function renderPreview() {
  const host = $("#map-preview");
  const node = state.selected && state.byId.get(state.selected);
  host.hidden = !node;
  $("#selection-empty").hidden = Boolean(node);
  renderConnectionTrail(node);
  if (!node) {
    host.replaceChildren();
    return;
  }
  const sourceExcerpt =
    node.description ||
    node.variants
      .flatMap((variant) => variant.fields)
      .find(
        (field) =>
          ["definition", "description", "semantic_definition"].includes(
            field.key,
          ) && typeof field.value === "string",
      )?.value;
  const preface =
    sourceExcerpt ||
    node.note?.intuition ||
    "No prose definition is supplied by the source graphs. The recorded connections and original fields appear in the full entry.";
  const provenance = sourceExcerpt
    ? "SOURCE EXCERPT"
    : node.note?.intuition
      ? "CURATED TEACHING NOTE"
      : "CONNECTION-ONLY RECORD";
  const sources = [
    ...new Set(node.topics.map((topic) => state.atlas.documents.find(doc => doc.graphId === topic)?.title || topic)),
  ];
  const connections = state.edgesById.get(node.id) || [];
  const examples = [];
  const seen = new Set();
  const ordered = [...connections].sort((left, right) => {
    if (left === state.featuredEdge) return -1;
    if (right === state.featuredEdge) return 1;
    const rank = (edge) =>
      ({ orchestration: 0, workflow: 1, dependency: 2, structure: 3 })[
        window.DeveloperMapKey.classify(edge).id
      ] ?? 4;
    return rank(left) - rank(right);
  });
  for (const edge of ordered) {
    const family = window.DeveloperMapKey.classify(edge).id;
    if (!seen.has(family) && examples.length < 4) {
      examples.push(edge);
      seen.add(family);
    }
  }
  for (const edge of ordered) {
    if (examples.length >= 4) break;
    if (!examples.includes(edge)) examples.push(edge);
  }
  const why = examples
    .map((edge) => {
      const { other, direction } = relationDescription(edge, node.id);
      if (!other) return "";
      const style = window.DeveloperMapKey.classify(edge);
      return `<button type="button" class="preview-link" data-concept="${escapeHtml(other.id)}"><span class="preview-link-top">${lineSample(style)}<span>${escapeHtml(style.label)}</span></span><strong>${direction} ${escapeHtml(other.label)}</strong><span class="preview-link-reason">${escapeHtml(humanize(edge.relation))}${edge.semantic ? ` · ${escapeHtml(edge.semantic)}` : ""}</span><small>${escapeHtml(sourceTitle(edge.document))}</small></button>`;
    })
    .join("");
  const leading = state.featuredEdge;
  const proof = leading
    ? '<div class="dynamic-proof"><span class="preview-kicker">ACTIVE EDGE / ' +
      (leading.curated ? "EDITORIAL" : "SOURCE") +
      "</span><strong>" +
      escapeHtml(state.byId.get(leading.source)?.label) +
      " → " +
      escapeHtml(state.byId.get(leading.target)?.label) +
      "</strong><span>" +
      escapeHtml(leading.relation) +
      "</span><p>" +
      escapeHtml(
        leading.semantic ||
          leading.record?.mechanism ||
          "WHY not supplied: source records this predicate without a separate mechanism or rationale.",
      ) +
      "</p><small>" +
      (leading.curated
        ? "Editorial connection · not an original source edge"
        : "Recorded in " + escapeHtml(sourceTitle(leading.document))) +
      '</small><div class="in-place-evidence"><strong>WHAT · exact triple</strong><code>' + escapeHtml(leading.source+' — '+leading.relation+' → '+leading.target) + '</code><p>WHY · ' + escapeHtml(leading.semantic || leading.record?.rationale || 'Not supplied by source; no cause inferred from this link.') + '</p><p>' + escapeHtml(leading.kind+' · '+leading.assertionStatus) + '</p><p>' + escapeHtml(leading.document+' · '+(leading.sourcePointer||leading.id)) + '</p>' + renderFields(leading.fields||[]) + (leading.evidence||[]).map(renderClaim).join('') + '<details><summary>Exact raw relationship fields</summary><pre>'+escapeHtml(JSON.stringify(leading.record,null,2))+'</pre></details></div><button type="button" id="active-edge-evidence">Inspect this relationship ↓</button></div>'
    : "";
  host.innerHTML = `<div class="preview-heading"><span class="label-chip ${category(node)}">${escapeHtml(humanize(node.type))}</span><button type="button" id="preview-close" aria-label="Clear concept selection">×</button></div><p class="preview-kicker">${provenance}</p><h3>${escapeHtml(node.label)}</h3><p class="preview-id">${escapeHtml(node.id)}</p><p class="preview-preface">${escapeHtml(preface)}</p><div class="preview-meta"><span>${connections.length} relationships</span><span>${sources.length} source documents</span></div><p class="preview-sources">${sources.length ? escapeHtml(sources.slice(0, 2).join(" · ")) + (sources.length > 2 ? ` · +${sources.length - 2} more` : "") : "No original source record"}</p>${statusMarkup(node.id)}${proof}${why ? `<div class="preview-why"><span class="preview-kicker">WHY THESE POINTS CONNECT</span>${why}<p>Showing ${examples.length} of ${connections.length} recorded links. All links and evidence appear in the full entry.</p></div>` : ""}<button type="button" id="preview-read">Read full entry ↓</button>`;
  host.querySelector('[data-retry-details]')?.addEventListener('click', () => { const generation = ++selectionGeneration; loadSelectionDetails(node.id,generation); refreshSelectedDetails(); });
  const oldPreview = host.querySelector('.preview-why');
  if (oldPreview) oldPreview.remove();
  const panel = document.createElement('section'); panel.className = 'connection-browser';
  panel.innerHTML = '<h4>All connections &amp; why</h4><label>Find a connection<input id="connection-search" type="search" placeholder="Name, relation, explanation, source…" /></label><label>Direction<select id="connection-direction"><option value="all">All directions</option><option value="outgoing">Outgoing</option><option value="incoming">Incoming</option><option value="loop">Self-loops</option></select></label><p id="connection-match-count" role="status"></p><div id="connection-results"></div>';
  const proofBlock=host.querySelector('.dynamic-proof');
  if(proofBlock) proofBlock.before(panel);else host.querySelector('#preview-read').before(panel);
  const kinds = [...new Set(connections.map(edge => edge.kind || 'other'))].sort();
  const kindControl = document.createElement('label');
  kindControl.innerHTML = 'Connection type<select id="connection-kind"><option value="all">All connection types</option>' + kinds.map(kind => '<option value="'+escapeHtml(kind)+'">'+escapeHtml(humanize(kind.replaceAll('-',' ')))+' ('+connections.filter(e=>(e.kind||'other')===kind).length+')</option>').join('') + '</select>';
  panel.querySelector('#connection-match-count').before(kindControl);
  const help = document.createElement('details'); help.className='relation-help';
  help.innerHTML='<summary>How to read these connections</summary><p>Arrows keep the exact source direction: → outgoing, ← incoming. Written in / implemented in describes software implementation; uses language does not. Runs on is a runtime relationship; implements spec is conformance, not an implementation language. Compilation targets, libraries, dependencies and related-to links remain distinct. Source claims are preserved, not universally verified. No supplied link means unknown, not impossible.</p>';
  kindControl.after(help);
  const reset = document.createElement('button');reset.id='connection-reset';reset.type='button';reset.textContent='Reset connection filters';help.after(reset);
  const kindSelect=panel.querySelector('#connection-kind');kindSelect.value=state.relationKind;
  const input = panel.querySelector('#connection-search'), directionSelect = panel.querySelector('#connection-direction');
  input.value = state.relationQuery; directionSelect.value = state.relationDirection;
  const signatureCounts = new Map();
  for (const edge of connections) { const key = JSON.stringify([edge.source,edge.target,edge.relation]); signatureCounts.set(key,(signatureCounts.get(key)||0)+1); }
  const renderConnections = () => {
    const query = state.relationQuery.trim().toLowerCase();
    const matches = connections.filter(edge => {
      if(state.relationKind!=='all' && (edge.kind||'other')!==state.relationKind)return false;
      const loop = edge.source === edge.target;
      if (state.relationDirection==='outgoing' && (loop || edge.source !== node.id)) return false;
      if (state.relationDirection==='incoming' && (loop || edge.target !== node.id)) return false;
      if (state.relationDirection==='loop' && !loop) return false;
      const haystack = [state.byId.get(edge.source)?.label,state.byId.get(edge.target)?.label,edge.relation,edge.semantic,sourceTitle(edge.document),JSON.stringify(edge.record)].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });
    panel.querySelector('#connection-match-count').textContent = matches.length + ' of ' + connections.length + ' records · graph always shows all links';
    const orderedMatches = [...matches].sort((a,b)=>(a.kind||'other').localeCompare(b.kind||'other'));
    panel.querySelector('#connection-results').innerHTML = orderedMatches.map((edge,index) => {
      const {other,direction,relation} = relationDescription(edge,node.id);
      const reason = edge.record?.rationale || edge.record?.mechanism || edge.semantic || '';
      const repeated = signatureCounts.get(JSON.stringify([edge.source,edge.target,edge.relation]));
      const heading = !index || orderedMatches[index-1].kind !== edge.kind ? '<h5 class="connection-group">'+escapeHtml(humanize((edge.kind||'other').replaceAll('-',' ')))+'</h5>' : '';
      return heading + '<article class="connection-card" data-connection-id="'+escapeHtml(edge.id)+'"><button type="button" class="connection-neighbor" data-neighbor="'+escapeHtml(other.id)+'">'+escapeHtml(direction+' '+other.label)+'</button><p><b>'+escapeHtml(humanize(edge.relation))+'</b></p><p>'+escapeHtml(reason ? (typeof reason==='string'?reason:JSON.stringify(reason)) : 'Recorded source relationship; no separate causal explanation supplied.')+'</p><small>'+escapeHtml((edge.curated?'Editorial · ':'Source · ')+sourceTitle(edge.document)+' · '+(edge.sourcePointer||edge.id))+'</small>'+(repeated>1?'<small class="duplicate-note">'+repeated+' source records share these endpoints and predicate; details are preserved.</small>':'')+'<button type="button" data-inspect-edge="'+escapeHtml(edge.id)+'" aria-pressed="'+String(state.featuredEdge?.id===edge.id)+'">Emphasize &amp; explain</button></article>';
    }).join('') || '<p>No matching connections. Clear the search or choose all directions.</p>';
    panel.querySelectorAll('[data-neighbor]').forEach(button => button.addEventListener('click',()=>selectConcept(button.dataset.neighbor)));
    panel.querySelectorAll('[data-inspect-edge]').forEach(button => button.addEventListener('click',()=>{
      state.featuredEdge=connections.find(edge=>edge.id===button.dataset.inspectEdge); state.edgeFocus=true;
      network.focusEdge(state.featuredEdge); network.edgeFocus(true);
      $('#edge-focus').setAttribute('aria-pressed','true'); $('#edge-focus').textContent='Edge emphasized · all links shown';
      const priorScroll=host.scrollTop; renderPreview(); host.scrollTop=priorScroll;
    }));
  };
  kindSelect.addEventListener('change',()=>{state.relationKind=kindSelect.value;renderConnections();});
  reset.addEventListener('click',()=>{state.relationKind='all';state.relationQuery='';state.relationDirection='all';kindSelect.value='all';input.value='';directionSelect.value='all';renderConnections();});
  input.addEventListener('input',()=>{state.relationQuery=input.value;renderConnections();});
  directionSelect.addEventListener('change',()=>{state.relationDirection=directionSelect.value;renderConnections();});
  renderConnections();
  host.scrollTop = 0;
  $("#active-edge-evidence")?.addEventListener("click", () => {
    const entry = [...document.querySelectorAll("[data-relation-id]")].find(
      (el) => el.dataset.relationId === state.featuredEdge?.id,
    );
    entry?.scrollIntoView({ behavior: "smooth", block: "start" });
    entry?.focus({ preventScroll: true });
  });
  $("#preview-close").addEventListener("click", () => clearSelection());
  $("#preview-read").addEventListener("click", () =>
    $("#inspector").scrollIntoView({ behavior: "smooth", block: "start" }),
  );
  host
    .querySelectorAll(".preview-link")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectConcept(button.dataset.concept),
      ),
    );
}

function displayValue(value) {
  if (value === null) return '<span class="field-empty">Null in source</span>';
  if (Array.isArray(value))
    return value.length
      ? `<ul class="value-list">${value.map((item) => `<li>${displayValue(item)}</li>`).join("")}</ul>`
      : '<span class="field-empty">Empty list in source</span>';
  if (typeof value === "object")
    return `<dl class="value-object">${Object.entries(value)
      .map(
        ([key, item]) =>
          `<div><dt>${escapeHtml(humanize(key))}</dt><dd>${displayValue(item)}</dd></div>`,
      )
      .join("")}</dl>`;
  if (typeof value === "string" && /^https?:[/][/]/i.test(value)) {
    try {
      const url = new URL(value);
      if (["https:", "http:"].includes(url.protocol))
        return (
          '<a href="' +
          escapeHtml(url.href) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(value) +
          "</a>"
        );
    } catch {
      /* Render malformed source URLs as plain text. */
    }
  }
  return escapeHtml(value);
}

function renderFields(fields) {
  return fields
    .map(
      (field) =>
        `<div class="source-field"><strong>${escapeHtml(field.label)}</strong><div>${displayValue(field.value)}</div></div>`,
    )
    .join("");
}

function renderClaim(claim) {
  const fields = Object.entries(claim)
    .filter(([key]) => key !== "id")
    .map(([key, value]) => ({ label: humanize(key), value }));
  return `<div class="claim"><b>${escapeHtml(claim.id)}</b>${renderFields(fields)}</div>`;
}

function renderStudyMaterial(records, file) {
  if (!records.length) return "";
  return `<details class="related-material"><summary>Linked source material · ${records.length} records</summary>${records
    .map((item) => {
      const sequence = Array.isArray(item.record.sequence)
        ? item.record.sequence.map(id => state.atlas.sourceNodeMap[file.split("_full_")[0] + ":" + id]).filter((id) => state.byId.has(id))
        : [];
      return `<article class="study-record"><h6>${escapeHtml(humanize(item.section))}</h6>${renderFields(item.fields)}${sequence.length ? `<div class="study-sequence">Explore this source path: ${sequence.map((id) => `<button type="button" data-concept="${escapeHtml(id)}">${escapeHtml(state.byId.get(id).label)}</button>`).join(" → ")}</div>` : ""}</article>`;
    })
    .join("")}</details>`;
}

function renderInspector() {
  const host = $("#inspector");
  const node = state.selected ? state.byId.get(state.selected) : null;
  if (!node) {
    host.innerHTML =
      '<div class="inspector-empty"><span class="inspector-orbit" aria-hidden="true">◉</span><p class="eyebrow">YOUR SYSTEMS ATLAS</p><h3>Explore the complete field.</h3><p>The connected concept overview stays on the map; every original record remains searchable and downloadable. Choose a point or search to illuminate its direct connections and read the evidence behind them.</p><div class="starter-links"><button data-concept="virtual_machine">Virtual machines ↗</button><button data-concept="containerization">Containerization ↗</button><button data-concept="docker">Explore Docker ↗</button></div></div>';
    host
      .querySelectorAll("[data-concept]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          selectConcept(button.dataset.concept),
        ),
      );
    return;
  }
  if (detailStatus(node.id) !== 'ready') {
    host.innerHTML = '<div class="inspector-content"><h3>' + escapeHtml(node.label) + '</h3><p>' + escapeHtml(node.description || 'No prose definition supplied.') + '</p>' + statusMarkup(node.id) + '<p>Explore the complete recorded connection list in the selection pane while evidence loads.</p></div>';
    host.querySelector('[data-retry-details]')?.addEventListener('click', () => {loadSelectionDetails(node.id,++selectionGeneration);refreshSelectedDetails();});
    return;
  }
  const connections = state.edgesById.get(node.id) || [];
  const explanation =
    node.description ||
    node.note?.intuition ||
    `No prose definition is supplied for this concept. Its ${connections.length} recorded connections and source records are listed below.`;
  const keyFacts = new Set([
    "definition",
    "description",
    "semantic_definition",
    "scope",
    "conceptual_basis",
    "significance",
    "history_note",
    "distinction",
    "foundational_issue",
    "role",
    "charge_definition",
    "canonical_examples",
    "not_to_conflate_with",
  ]);
  const perspectives = node.variants
    .flatMap((variant) =>
      variant.fields
        .filter((field) => keyFacts.has(field.key) && field.value)
        .map(
          (field) =>
            `<div class="perspective"><strong>${escapeHtml(field.label)} · ${escapeHtml(sourceTitle(variant.document))}</strong><div>${displayValue(field.value)}</div></div>`,
        ),
    )
    .join("");
  const connectedDefinitions = connections
    .map((edge) => ({ edge, ...relationDescription(edge, node.id) }))
    .filter((item) => item.other?.description)
    .slice(0, 5);
  const guide = `<div class="inspector-section"><h4>Source-backed field guide</h4><div class="perspectives-grid">${perspectives || "<p>No prose explanation was provided by the source graphs for this concept.</p>"}</div>${connectedDefinitions.length ? `<h5>Connected definitions · first ${connectedDefinitions.length} of ${connections.length} links</h5>${connectedDefinitions.map(({ edge, other, relation }) => `<button type="button" class="perspective-link" data-concept="${escapeHtml(other.id)}"><b>${escapeHtml(other.label)}</b> · ${escapeHtml(relation)}<small>${escapeHtml(other.description)} · ${escapeHtml(sourceTitle(edge.document))}</small></button>`).join("")}` : ""}</div>`;
  const sourceRecords = node.variants
    .map((variant) => {
      const document = state.atlas.documents.find(
        (item) => item.file === variant.document,
      );
      const encodedFile = variant.document
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      const context =
        document?.metadata?.source || document?.metadata?.source_policy || null;
      return `<article class="source-variant"><h5>${escapeHtml(sourceTitle(variant.document))}</h5><p class="source-file">${escapeHtml(variant.document)} · <a href="./data/${encodedFile}" download>Download source JSON ↓</a></p>${renderFields(variant.fields) || "<p>No descriptive fields supplied in this record.</p>"}${variant.claims.length ? `<div class="claim-list"><strong>Supporting claims · ${variant.claims.length}</strong>${variant.claims.map(renderClaim).join("")}</div>` : ""}${renderStudyMaterial(variant.related || [], variant.document)}${context ? `<div class="source-field"><strong>Source policy / origin</strong>${displayValue(context)}</div>` : ""}${document ? `<details class="document-context" data-file="${escapeHtml(variant.document)}"><summary>Source context, references &amp; complete metadata ↗</summary><div class="document-fields"></div><details class="document-raw"><summary>Full source metadata JSON</summary><pre></pre></details></details>` : ""}</article>`;
    })
    .join("");
  const relations = connections
    .map((edge) => {
      const { other, direction, relation } = relationDescription(edge, node.id);
      const style = window.DeveloperMapKey.classify(edge);
      return `<article class="relation-entry" tabindex="-1" data-relation-id="${escapeHtml(edge.id)}"><button type="button" data-concept="${escapeHtml(other?.id || "")}"><span class="relation-direction">${direction}</span><span><span class="relation-style">${lineSample(style)}${escapeHtml(style.label)}</span><small>${edge.source === edge.target ? "Self-loop" : edge.source === node.id ? "Outgoing" : "Incoming"} · ${edge.curated ? "Editorial relation" : "Source relation"}: ${escapeHtml(humanize(edge.relation))}</small><strong>${escapeHtml(other?.label || other?.id || "Unknown")}</strong></span><span class="relation-arrow">↗</span></button><div class="relation-proof"><p><strong>WHAT · exact source triple:</strong> ${escapeHtml(state.byId.get(edge.source)?.label || edge.source)} → ${escapeHtml(edge.relation)} → ${escapeHtml(state.byId.get(edge.target)?.label || edge.target)}.</p>${!edge.semantic && !edge.record.rationale && !edge.record.explanation ? "<p>WHY not supplied: the source records this predicate without a separate mechanism or rationale.</p>" : ""}${other?.description ? `<p class="neighbor-description">${escapeHtml(other.description)}</p>` : ""}<span>${edge.curated ? "Editorial connection ·" : "Recorded in"} ${escapeHtml(sourceTitle(edge.document))}${edge.sourcePointer ? ` · ${escapeHtml(edge.sourcePointer)}` : ""}</span>${edge.semantic ? `<p>${escapeHtml(relation)}</p>` : ""}${renderFields(edge.fields || [])}${edge.evidence.length ? `<div class="claim-list"><strong>Supporting claims · ${edge.evidence.length}</strong>${edge.evidence.map(renderClaim).join("")}</div>` : "<p>No claim-level citation supplied for this relationship.</p>"}</div></article>`;
    })
    .join("");
  host.innerHTML = `<div class="inspector-content"><div class="inspector-heading"><span class="label-chip ${category(node)}">${escapeHtml(humanize(node.type))}</span><span class="record-number">${connections.length} LINKS · ${new Set(node.variants.map((variant) => variant.document)).size} SOURCE DOCUMENTS</span></div><h3>${escapeHtml(node.label)}</h3><p class="inspector-id">${escapeHtml(node.id)}</p><button type="button" id="clear-focus" class="clear-focus">Clear selection <kbd>Esc</kbd></button>${node.note?.intuition ? `<div class="insight"><span class="insight-icon">✧</span><div><strong>IN PLAIN LANGUAGE · CURATED NOTE</strong><p>${escapeHtml(node.note.intuition)}</p></div></div>` : ""}<div class="inspector-section"><h4>WHAT · Concept overview</h4><p>${escapeHtml(explanation)}</p>${node.note?.example ? `<p class="example"><b>For example</b> · ${escapeHtml(node.note.example)}</p>` : ""}${node.addedByEditor ? '<p class="provenance-warning">Editorial note added to resolve a source reference; not an original graph node.</p>' : ""}</div><div class="inspector-section"><h4>All connections <span>${connections.length}</span></h4><p class="connection-note">Direction, meaning and source evidence are shown for each recorded link. A link without a cited claim has no claim-level citation in the source data.</p><div class="relation-list">${relations || "<p>No relationships are recorded for this concept yet.</p>"}</div></div>${guide}<div class="inspector-section"><h4>Original source records <span>${node.variants.length}</span></h4><div class="source-record-grid">${sourceRecords || "<p>No original source record.</p>"}</div></div><div class="inspector-section"><details class="raw-record"><summary>Inspect complete JSON records <span>↗</span></summary><pre></pre></details></div></div>`;
  host
    .querySelectorAll("[data-concept]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectConcept(button.dataset.concept),
      ),
    );
  $("#clear-focus").addEventListener("click", () => clearSelection());
  host.querySelectorAll(".document-context").forEach((details) =>
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      const document = state.atlas.documents.find(
        (item) => item.file === details.dataset.file,
      );
      details.querySelector(".document-fields").innerHTML = renderFields(
        document.fields,
      );
      details.querySelector("pre").textContent = JSON.stringify(
        document.metadata,
        null,
        2,
      );
    }),
  );
  const details = host.querySelector(".raw-record");
  details.addEventListener("toggle", () => {
    if (details.open)
      details.querySelector("pre").textContent = JSON.stringify(
        {
          id: node.id,
          variants: node.variants,
          teachingNote: node.note || null,
          relationships: connections,
        },
        null,
        2,
      );
  });
}

function renderRoutes() {
  if (state.atlas.lightweight && !state.pathsLoaded) { $("#route-list").innerHTML="<p>Source learning paths load when you explore or request all paths.</p>"; return; }
  const featured = state.atlas.documents.map(doc => state.atlas.paths.find(path => path.document === doc.file)).filter(Boolean);
  $("#route-list").innerHTML = (state.routesExpanded ? state.atlas.paths : featured)
    .map(
      (route, index) =>
        `<button class="route-card ${escapeHtml(route.color)}" type="button" data-route="${escapeHtml(route.id)}"><span class="route-top"><span>PATH / 0${index + 1}</span><span aria-hidden="true">↗</span></span><span class="route-art" aria-hidden="true">${route.steps.map((_, step) => `<i style="--step:${step}"></i>`).join("")}</span><strong>${escapeHtml(route.title)}</strong><span class="route-subtitle">${escapeHtml(route.subtitle)}</span><span class="route-bottom">${route.steps.length} resolved · ${route.unresolvedSegments} unresolved <span>FOLLOW THIS ROUTE →</span></span></button>`,
    )
    .join("");
  $("#routes-more").hidden =
    state.routesExpanded || state.atlas.paths.length <= featured.length;
  $("#route-list")
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () => {
        state.route = state.atlas.paths.find(
          (route) => route.id === button.dataset.route,
        );
        state.routeStep = 0;
        renderRouteDetail();
        $("#route-detail").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }),
    );
}

function renderRouteDetail() {
  const host = $("#route-detail");
  if (!state.route) {
    host.hidden = true;
    return;
  }
  host.hidden = false;
  const route = state.route;
  const segment = route.segments[state.routeStep];
  const id = segment?.conceptId;
  const concept = state.byId.get(id);
  const previous = route.segments[state.routeStep - 1]?.conceptId;
  const bridge = previous && id ? state.atlas.edges.find(edge => !edge.curated &&
    ((edge.source === previous && edge.target === id) || (edge.target === previous && edge.source === id))) : null;
  const transition = bridge
    ? 'Recorded source edge: ' + state.byId.get(bridge.source).label + ' → ' + humanize(bridge.relation) + ' → ' + state.byId.get(bridge.target).label + ' (' + bridge.id + ').'
    : 'No recorded source edge asserted for this transition. Source ordering is a learning suggestion, not a graph relationship.';
  host.innerHTML = '<div><p class="eyebrow">FOLLOWING / ' + escapeHtml(route.title.toUpperCase()) + '</p>' +
    (route.sequenceText ? '<h4>Original source prose</h4><p class="route-source-text">' + escapeHtml(route.sequenceText) + '</p>' : '') +
    '<h3>' + escapeHtml(concept?.label || segment?.text || route.title) + '</h3><p class="' + (concept ? '' : 'route-unresolved') + '">' +
    escapeHtml(concept ? concept.description || 'Resolved against this source document; inspect the original record.' : 'Unresolved source segment: ' + (segment?.reason || 'No exact local concept')) +
    '</p><small>' + escapeHtml(transition) + '</small><p>' + escapeHtml(route.transitionPolicy) + '</p><div class="route-actions">' +
    (concept ? '<button class="button primary" id="route-explore" type="button">Explore this idea ↗</button>' : '') +
    '<button class="button outline" id="route-next" type="button">' + (state.routeStep + 1 === route.segments.length ? 'Start again ↺' : 'Next segment →') +
    '</button></div><details><summary>Complete original path record</summary><pre>' + escapeHtml(JSON.stringify(route.record, null, 2)) + '</pre></details></div><div class="route-progress"><span>YOUR ROUTE / ' +
    (state.routeStep + 1) + ' OF ' + route.segments.length + '</span>' + route.segments.map((item, index) =>
      '<button type="button" data-step="' + index + '" class="' + (index === state.routeStep ? 'current' : '') + '"><b>' + String(index + 1).padStart(2, '0') + '</b>' +
      escapeHtml(item.text) + '<small class="' + (item.status === 'unresolved' ? 'route-unresolved' : '') + '">' + escapeHtml(item.status + (item.match ? ' · ' + item.match : ' · ' + item.reason)) + '</small></button>').join('') + '</div>';
  $('#route-explore')?.addEventListener('click', () => selectConcept(id, { scroll: true }));
  $('#route-next').addEventListener('click', () => {
    state.routeStep = (state.routeStep + 1) % route.segments.length;
    renderRouteDetail();
  });
  host.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    state.routeStep = Number(button.dataset.step);
    renderRouteDetail();
  }));
}

function renderCatalog() {
  const filtered = filteredNodes(state.catalogQuery);
  $("#catalog-count").textContent = `${filtered.length} RECORDS`;
  $("#catalog-items").innerHTML =
    filtered
      .slice(0, state.catalogLimit)
      .map(
        (node) =>
          `<button type="button" data-concept="${escapeHtml(node.id)}"><span class="result-dot ${category(node)}"></span><span><strong>${escapeHtml(node.label)}</strong><small>${escapeHtml(node.type.replaceAll("_", " "))}${node.variants.length > 1 ? ` · ${node.variants.length} source records` : ""}</small></span><span aria-hidden="true">↗</span></button>`,
      )
      .join("") ||
    '<p class="search-empty">No concepts found in this source. Try another filter.</p>';
  $("#catalog-more").hidden = filtered.length <= state.catalogLimit;
  $("#catalog-items")
    .querySelectorAll("[data-concept]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectConcept(button.dataset.concept, { scroll: true }),
      ),
    );
}

function setupMapGestures() {
  network = window.DeveloperNetwork.mount(
    $("#network"),
    $("#map-tooltip"),
    state.atlas,
    (id) => selectConcept(id),
  );
  $("#details-jump").addEventListener("click", () =>
    $("#inspector").scrollIntoView({ behavior: "smooth", block: "start" }),
  );
  $("#edge-focus").addEventListener("click", () => {
    state.edgeFocus = !state.edgeFocus;
    network.edgeFocus(state.edgeFocus);
    $("#edge-focus").setAttribute("aria-pressed", String(state.edgeFocus));
    $("#edge-focus").textContent = state.edgeFocus
      ? "Edge emphasized · all links shown"
      : "Emphasize one edge";
    $("#map-count").textContent =
      `${state.atlas.nodes.length.toLocaleString()} nodes · ${state.atlas.edges.length.toLocaleString()} links · ${network?.counts().connected || 0} direct neighbors${state.edgeFocus ? " · edge emphasized; all incident links shown" : " · all incident links shown"}`;
  });
  $("#selection-back").addEventListener("click",()=>{ const id=state.selectionHistory.pop(); if(id)selectConcept(id,{remember:false}); });
  $("#neighborhood-view").addEventListener("click",()=>{state.neighborhood=!state.neighborhood;network.view(state.neighborhood);$("#neighborhood-view").setAttribute("aria-pressed",String(state.neighborhood));$("#neighborhood-view").textContent=state.neighborhood?"Neighborhood · on":"Whole-map context";});
  $("#fit-selection").addEventListener("click",()=>network.fitSelection());
  $("#network").addEventListener("keydown",event=>{ if(['+','=','-','Home'].includes(event.key)){event.preventDefault();if(event.key==='Home')network.fitSelection();else network.zoom(event.key==='-'?1/1.3:1.3);} });
  $("#zoom-in").addEventListener("click", () => network.zoom(1.3));
  $("#zoom-out").addEventListener("click", () => network.zoom(1 / 1.3));
  $("#reset-map").addEventListener("click", () => {
    state.topic="all"; state.query=""; state.catalogQuery=""; state.relationQuery=""; state.relationDirection="all"; state.relationKind="all"; state.selectionHistory=[]; $("#search").value=""; $("#catalog-search").value="";
    clearSelection({ fit: true }); renderFilters(); renderSearch(); renderCatalog();
  });
}

async function init() {
  try {
    const response = await fetch("./data/overview.json");
    if (!response.ok)
      throw new Error(`Could not load atlas (HTTP ${response.status})`);
    state.atlas = await response.json();
    window.DeveloperMapKey.registerDocuments(state.atlas.documents);
    connectIndexes(state.atlas);
    if (state.atlas.lightweight) detailsLoader = window.DeveloperDetails.create(state.atlas);
    $("#metric-concepts").textContent =
      state.atlas.summary.concepts.toLocaleString();
    $("#search").placeholder =
      `Search ${state.atlas.summary.concepts.toLocaleString()} concepts, definitions or claims…`;
    $("#metric-relations").textContent =
      state.atlas.summary.relationships.toLocaleString();
    $("#metric-overlap").textContent = state.atlas.summary.overlaps;
    $("#source-links").innerHTML =
      state.atlas.documents
        .map(
          (doc, index) =>
            `<a href="./data/${doc.file.split("/").map(encodeURIComponent).join("/")}" download><span>${String(index + 1).padStart(2, "0")} / ${escapeHtml(doc.title)}</span><span>↓</span></a>`,
        )
        .join("") +
      `<a href="./data/atlas.json" download><span>${String(state.atlas.documents.length + 1).padStart(2, "0")} / Unified atlas JSON</span><span>↓</span></a>`;
    renderQuickRelations();
    document
      .querySelectorAll("[data-start]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          selectConcept(button.dataset.start),
        ),
      );
    $("#provenance-summary").textContent =
      `${state.atlas.summary.sourceRelationships} source links + ${state.atlas.summary.bridges} labeled editorial links. Originals preserved.`;
    setupMapGestures();
    $("#network").addEventListener("edgeinspect", event => { state.featuredEdge = state.atlas.edges.find(edge => edge.id === event.detail.id); state.edgeFocus = true; $("#edge-focus").setAttribute("aria-pressed", "true"); $("#edge-focus").textContent = "Edge emphasized · all links shown"; renderPreview(); });
    document.addEventListener("focusin", event => { const button = event.target.closest?.("[data-concept], [data-start]"); if (button) network.highlight(state.atlas.aliases?.[button.dataset.concept || button.dataset.start] || button.dataset.concept || button.dataset.start); });
    document.addEventListener("focusout", () => network.highlight(null));
    renderMapKey();
    renderFilters();
    renderMap();
    renderPreview();
    renderInspector();
    renderRoutes();
    renderCatalog();
    $("#demo-docker").addEventListener("click", () => selectConcept("docker"));
    $("#routes-more").addEventListener("click", () => {
      state.routesExpanded = true;
      if (state.atlas.lightweight && !state.pathsLoaded) ensurePaths().then(renderRoutes).catch(error=>{$('#route-list').textContent='Learning paths unavailable: '+error.message+' Select Show all paths to retry.';});
      renderRoutes();
    });
    $("#search").addEventListener("input", (event) => {
      state.query = event.target.value;
      renderSearch();
    });
    $('#search').addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {event.preventDefault();$('#search-results [data-concept]')?.focus();}
      if (event.key === 'Enter') {event.preventDefault();$('#search-results [data-concept]')?.click();}
    });
    $("#catalog-search").addEventListener("input", (event) => {
      state.catalogQuery = event.target.value;
      state.catalogLimit = 36;
      renderCatalog();
    });
    $("#catalog-more").addEventListener("click", () => {
      state.catalogLimit += 36;
      renderCatalog();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !document.activeElement.isContentEditable &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement.tagName,
        )
      ) {
        event.preventDefault();
        $("#search").focus();
        $("#explorer").scrollIntoView({ behavior: "smooth" });
      }
      if (event.key === "Escape") {
        state.query = "";
        $("#search").value = "";
        renderSearch();
        if (state.selected) {
          event.preventDefault();
          clearSelection();
        }
      }
    });
    const initial = new URL(location.href).searchParams.get("concept");
    if (initial && state.atlas.ambiguousAliases?.[initial]) {
      const candidates = state.atlas.ambiguousAliases[initial];
      $("#search-results").hidden = false;
      $("#search-results").innerHTML =
        '<div class="ambiguous-link"><strong>This old link has multiple meanings. Choose the intended concept:</strong>' +
        candidates
          .map(
            (id) =>
              '<button type="button" data-concept="' +
              escapeHtml(id) +
              '">' +
              escapeHtml(state.byId.get(id)?.label || id) +
              "</button>",
          )
          .join("") +
        "</div>";
      $("#search-results")
        .querySelectorAll("button")
        .forEach((button) =>
          button.addEventListener("click", () => {
            selectConcept(button.dataset.concept);
            $("#search-results").hidden = true;
          }),
        );
    } else if (initial) selectConcept(initial);
  } catch (error) {
    $("#inspector").innerHTML =
      `<div class="inspector-empty"><h3>Atlas unavailable</h3><p>${escapeHtml(error.message)}. Serve this folder over HTTP so the JSON can load.</p></div>`;
    $("#map-mode").textContent = "ATLAS UNAVAILABLE";
  }
}

function renderQuickRelations() {
  const connections = state.edgesById.get("docker") || [];
  const priority = [
    "container",
    "containerization",
    "image",
    "docker_engine",
    "kubernetes",
  ];
  const used = new Set();
  const examples = [...connections]
    .sort((a, b) => {
      const rank = (edge) => {
        const id = edge.source === "docker" ? edge.target : edge.source;
        const index = priority.indexOf(id);
        return index < 0 ? 99 : index;
      };
      return rank(a) - rank(b);
    })
    .filter((edge) => {
      const other = edge.source === "docker" ? edge.target : edge.source;
      if (used.has(other)) return false;
      used.add(other);
      return true;
    })
    .slice(0, 3);
  $("#quick-relations").innerHTML = examples
    .map((edge, i) => {
      const other = state.byId.get(
        edge.source === "docker" ? edge.target : edge.source,
      );
      return (
        '<button type="button" data-edge="' +
        escapeHtml(edge.id) +
        '"><span class="line-no">0' +
        (i + 1) +
        "</span><span>" +
        escapeHtml(other.label) +
        '<br><span class="query-relation">' +
        escapeHtml(edge.source === "docker" ? "→ " : "← ") +
        escapeHtml(edge.relation) +
        '</span></span><span class="query-provenance">' +
        (edge.curated ? "EDITORIAL" : "SOURCE") +
        " ↗</span></button>"
      );
    })
    .join("");
  $("#query-status").textContent = connections.length + " Docker relationships";
  $("#quick-relations")
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () => {
        selectConcept("docker", { scroll: true });
        state.featuredEdge = connections.find(
          (edge) => edge.id === button.dataset.edge,
        );
        network.focusEdge(state.featuredEdge);
        renderPreview();
      }),
    );
}

function renderConnectionTrail(node) {
  const host = $("#connection-trail");
  if (!node) {
    host.innerHTML =
      "<span>$ inspect</span> Select a concept to reveal its connections.";
    return;
  }
  const unique = [
    ...new Set(
      (state.edgesById.get(node.id) || []).map((edge) =>
        edge.source === node.id ? edge.target : edge.source,
      ),
    ),
  ];
  host.innerHTML =
    "<span>$ inspect " +
    escapeHtml(node.id) +
    '</span><span aria-hidden="true">→</span>' +
    unique
      .slice(0, 5)
      .map(
        (id) =>
          '<button type="button" data-trail="' +
          escapeHtml(id) +
          '">' +
          escapeHtml(state.byId.get(id).label) +
          "</button>",
      )
      .join('<span aria-hidden="true"> / </span>') +
    "<span> · " +
    unique.length +
    " direct neighbors</span>";
  host
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectConcept(button.dataset.trail),
      ),
    );
}

init();
