import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const atlas = JSON.parse(
  await readFile(new URL("../data/atlas.json", import.meta.url)),
);
const scripts = await Promise.all(
  ["map-key", "network", "app"].map((name) =>
    readFile(new URL(`../src/${name}.js`, import.meta.url), "utf8"),
  ),
);

test("map, search, route, source inspector and Escape work without a server", async () => {
  const dom = new JSDOM(html, {
    url: "http://localhost:4173/",
    runScripts: "outside-only",
  });
  const { window } = dom;
  const { document } = window;
  window.fetch = async () => ({ ok: true, json: async () => atlas });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
    width: 960,
    height: 620,
    left: 0,
    top: 0,
  });
  window.HTMLCanvasElement.prototype.getContext = () =>
    new Proxy(
      {},
      {
        get: (_, key) =>
          key === "measureText"
            ? (value) => ({ width: value.length * 7 })
            : () => {},
      },
    );
  window.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
  for (const script of scripts) window.eval(script);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(
    document.querySelector("#metric-concepts").textContent,
    atlas.nodes.length.toLocaleString(),
  );
  assert.equal(
    document.querySelector("#map-count").textContent,
    `${atlas.nodes.length.toLocaleString()} nodes · ${atlas.edges.length.toLocaleString()} links`,
  );
  assert.match(
    document.querySelector("#inspector").textContent,
    /Virtual machines/,
  );
  document.querySelector("#demo-docker").click();
  assert.match(document.querySelector("#map-mode").textContent, /DOCKER/);
  assert.equal(document.querySelector("#map-preview").hidden, false);
  assert.match(
    document.querySelector("#inspector").textContent,
    /Original source records/,
  );
  assert.ok(
    document
      .querySelector("#inspector .source-variant a")
      .href.includes("/data/"),
  );
  document.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert.equal(document.querySelector("#map-preview").hidden, true);
  assert.match(document.querySelector("#map-mode").textContent, /ALL NODES/);
  const search = document.querySelector("#search");
  search.value = "kubernetes";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.ok(document.querySelectorAll("#search-results [data-concept]").length);
  document.querySelector("#routes-more").click();
  assert.equal(
    document.querySelectorAll("#route-list .route-card").length,
    atlas.paths.length,
  );
  document.querySelector("#route-list .route-card").click();
  assert.equal(document.querySelector("#route-detail").hidden, false);
  window.close();
});

async function mount(url = "http://localhost:4173/") {
  const dom = new JSDOM(html, { url, runScripts: "outside-only" });
  const { window } = dom;
  window.fetch = async () => ({ ok: true, json: async () => atlas });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
    width: 960,
    height: 620,
    left: 0,
    top: 0,
  });
  window.HTMLCanvasElement.prototype.getContext = () =>
    new Proxy(
      {},
      {
        get: (_, key) =>
          key === "measureText"
            ? (value) => ({ width: value.length * 7 })
            : () => {},
      },
    );
  window.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
  for (const script of scripts) window.eval(script);
  await new Promise((resolve) => setTimeout(resolve, 30));
  return dom;
}

test("Docker quick query highlights the exact editorial edge and evidence", async () => {
  const dom = await mount();
  const d = dom.window.document;
  const button = d.querySelector(
    '[data-edge="editorial:docker-runs-container"]',
  );
  assert.ok(button);
  button.click();
  assert.match(
    d.querySelector(".dynamic-proof").textContent,
    /ACTIVE EDGE \/ EDITORIAL/,
  );
  assert.match(
    d.querySelector(".dynamic-proof").textContent,
    /Docker → Container/,
  );
  assert.match(
    d.querySelector(".dynamic-proof").textContent,
    /not an original source edge/,
  );
  assert.ok(
    d.querySelector('[data-relation-id="editorial:docker-runs-container"]'),
  );
  assert.equal(
    dom.window.DeveloperMapKey.classify(
      atlas.edges.find((e) => e.id === "editorial:docker-runs-container"),
    ).id,
    "editorial",
  );
  assert.match(d.querySelector("#connection-trail").textContent, /Container/);
  assert.equal(d.querySelector("#selection-empty").hidden, true);
  d.querySelector("#preview-close").click();
  assert.equal(d.querySelector("#selection-empty").hidden, false);
  dom.window.close();
});

test("legacy K8s URL resolves to the unified canonical neighborhood", async () => {
  const dom = await mount("http://localhost:4173/?concept=k8s");
  const d = dom.window.document;
  assert.match(d.querySelector("#map-mode").textContent, /KUBERNETES/);
  assert.equal(
    new URL(dom.window.location.href).searchParams.get("concept"),
    "kubernetes",
  );
  dom.window.close();
});

test("exact concept search outranks source text and slash shortcut respects modifiers", async () => {
  const dom = await mount();
  const { document: d } = dom.window;
  const input = d.querySelector("#search");
  input.value = "container";
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(
    d.querySelector("#search-results [data-concept]").dataset.concept,
    "container",
  );
  d.querySelector("#demo-docker").focus();
  d.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", {
      key: "/",
      ctrlKey: true,
      bubbles: true,
    }),
  );
  assert.notEqual(d.activeElement, input);
  d.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "/", bubbles: true }),
  );
  assert.equal(d.activeElement, input);
  assert.ok(d.querySelector(".skip-link"));
  assert.equal(d.querySelectorAll(".top-nav a").length, 3);
  dom.window.close();
});

test("ambiguous old Host link offers scoped choices rather than silently guessing", async () => {
  const dom = await mount("http://localhost:4173/?concept=host");
  const d = dom.window.document;
  assert.match(
    d.querySelector("#search-results").textContent,
    /multiple meanings/,
  );
  assert.ok(d.querySelector('[data-concept="docker:host"]'));
  assert.ok(d.querySelector('[data-concept="virtual_machine:host"]'));
  d.querySelector('[data-concept="docker:host"]').click();
  assert.match(d.querySelector("#map-mode").textContent, /DOCKER HOST/);
  dom.window.close();
});
test("selected edge focus is reversible and editorial evidence is a real link", async () => {
  const dom = await mount("http://localhost:4173/?concept=docker");
  const d = dom.window.document;
  const control = d.querySelector("#edge-focus");
  assert.equal(control.hidden, false);
  assert.equal(control.getAttribute("aria-pressed"), "false");
  control.click();
  assert.equal(control.getAttribute("aria-pressed"), "true");
  control.click();
  assert.equal(control.getAttribute("aria-pressed"), "false");
  const edge = d.querySelector(
    '[data-relation-id="editorial:docker-runs-container"]',
  );
  assert.ok(edge.querySelector('a[href^="https://docs.docker.com/"]'));
  d.querySelector("#active-edge-evidence").click();
  assert.equal(d.activeElement, edge);
  dom.window.close();
});


test('all new domains and neutral fallback have colors and featured source trails', async () => {
  const dom = await mount(); const w = dom.window, d = w.document;
  for (const graph of ['operating_system','python_language','optical_disc_image','system_image','volume_computing','sandbox_computer_security']) {
    assert.equal(w.DeveloperMapKey.groupOf({topics:[graph],type:'concept'}), graph);
    assert.ok(w.DeveloperMapKey.domainById.get(graph).color);
    assert.ok(d.querySelector('[data-route="' + graph + ':path:0"]'));
  }
  assert.equal(w.DeveloperMapKey.groupOf({topics:['unknown'],type:'concept'}), 'neutral');
  assert.equal(d.querySelectorAll('#route-list .route-card').length,10);
  for (const id of ['os','python','sandbox','volume_computing:volume','optical_disc_image','system_image']) {
    d.querySelector('[data-start="' + id + '"]').click();
    assert.equal(new URL(w.location.href).searchParams.get('concept'),id);
    assert.match(d.querySelector('#inspector').textContent,/Original source records/);
  }
  dom.window.close();
});
test('text paths display full prose, preserve unresolved gaps and handle zero resolved concepts', async () => {
  const dom = await mount(); const d = dom.window.document;
  d.querySelector('#routes-more').click();
  d.querySelector('[data-route="python_language:path:0"]').click();
  assert.equal(d.querySelector('.route-source-text').textContent,'python -> goals -> paradigms -> philosophy');
  d.querySelector('[data-step="1"]').click();
  assert.match(d.querySelector('#route-detail').textContent,/Unresolved source segment/);
  assert.equal(d.querySelector('#route-explore'),null);
  d.querySelector('[data-route="python_language:path:13"]').click();
  assert.match(d.querySelector('#route-detail').textContent,/Cython\/Nuitka\/Numba/);
  assert.equal(d.querySelector('#route-explore'),null);
  d.querySelector('#route-next').click();
  assert.match(d.querySelector('#route-detail').textContent,/No recorded source edge asserted/);
  dom.window.close();
});
test('new ambiguous bare URLs offer scoped choices and qualified legacy aliases resolve', async () => {
  for (const key of ['vm','linux','kernel','filesystem']) {
    const dom = await mount('http://localhost:4173/?concept=' + key);
    assert.match(dom.window.document.querySelector('#search-results').textContent,/multiple meanings/);
    for (const id of atlas.ambiguousAliases[key]) assert.ok(dom.window.document.querySelector('#search-results [data-concept="' + id + '"]'));
    dom.window.close();
  }
  for (const [key,id] of [['jvm','jvm'],['python_language:jvm','jvm'],['sandbox','sandbox'],['docker:vm','virtual_machine'],['python_language:vm','python_language:vm']]) {
    const dom = await mount('http://localhost:4173/?concept=' + encodeURIComponent(key));
    assert.equal(new URL(dom.window.location.href).searchParams.get('concept'),id);
    dom.window.close();
  }
});
test('rich inspector exposes section provenance, mechanism, conditions and effects', async () => {
  const dom = await mount('http://localhost:4173/?concept=os'); const d = dom.window.document;
  const entry = d.querySelector('[data-relation-id="operating_system:rich_semantic_relationships:0"]');
  assert.ok(entry);
  for (const text of ['Mechanism','Conditions','Effect','Scope','/rich_semantic_relationships/0']) assert.ok(entry.textContent.includes(text), text);
  assert.match(d.querySelector('#inspector').textContent,/Operating System — Full Relationship/);
  dom.window.close();
});


test('high degree reselect preserves every incoming outgoing parallel rich edge across overview filters', async () => {
  const dom = await mount(); const w=dom.window, d=w.document;
  for (const id of ['os','python','virtual_machine','sandbox','metaclass','embedded','realtime']) {
    const expected = atlas.edges.filter(edge => edge.source===id || edge.target===id).map(edge=>edge.id).sort();
    w.selectConcept(id);
    const verify = () => {
      assert.deepEqual(JSON.parse(d.querySelector('#network').dataset.incidentEdgeIds).sort(), expected);
      assert.deepEqual([...d.querySelectorAll('[data-relation-id]')].map(el=>el.dataset.relationId).sort(), expected);
      assert.equal(d.querySelector('#network').dataset.selectedConcept,id);
      for (const entry of d.querySelectorAll('[data-relation-id]')) assert.match(entry.textContent, /Why this connection:/);
      const headings = [...d.querySelectorAll('#inspector h4')].map(el => el.textContent);
      assert.ok(headings.findIndex(text => text.startsWith('All connections')) < headings.findIndex(text => text.startsWith('Original source records')));
    };
    verify(); d.querySelector('#edge-focus').click(); verify();
    d.querySelector('[data-topic="docker"]').click(); verify();
    w.selectConcept(id); verify();
    assert.equal(d.querySelector('#edge-focus').getAttribute('aria-pressed'),'false');
    d.querySelector('[data-start="python"]').focus(); verify();
    assert.match(d.querySelector('#map-count').textContent,/all sources/);
  }
  w.clearSelection({fit:true});
  d.querySelector('[data-start="os"]').focus();
  assert.deepEqual(JSON.parse(d.querySelector('#network').dataset.incidentEdgeIds).sort(),atlas.edges.filter(e=>e.source==='os'||e.target==='os').map(e=>e.id).sort());
  assert.equal(d.querySelector('#network').dataset.selectedConcept,'');
  dom.window.close();
});
