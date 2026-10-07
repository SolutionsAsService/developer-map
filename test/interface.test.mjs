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
    String(atlas.nodes.length),
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
  assert.equal(control.getAttribute("aria-pressed"), "true");
  control.click();
  assert.equal(control.getAttribute("aria-pressed"), "false");
  control.click();
  assert.equal(control.getAttribute("aria-pressed"), "true");
  const edge = d.querySelector(
    '[data-relation-id="editorial:docker-runs-container"]',
  );
  assert.ok(edge.querySelector('a[href^="https://docs.docker.com/"]'));
  d.querySelector("#active-edge-evidence").click();
  assert.equal(d.activeElement, edge);
  dom.window.close();
});
