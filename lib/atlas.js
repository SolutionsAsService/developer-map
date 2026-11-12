// Build-time model of data/atlas.json (written by scripts/build-atlas.mjs from the source
// graphs in data/). Imported only by server components, route handlers and tests: none of
// this reaches the browser except what a page renders or a route handler emits.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { REGIONS, REGION_BY_ID, regionOfGraph } from './regions.js';

const SOURCE = path.join(process.cwd(), 'data', 'atlas.json');

// The concept traced on the landing graphic. test/data.test.js asserts it spans every
// region it is drawn through.
export const TRACE_ID = 'c';

let cache;

export function loadAtlas() {
  if (cache) return cache;
  cache = buildModel(JSON.parse(readFileSync(SOURCE, 'utf8')));
  return cache;
}

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function slugify(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'concept';
}

function buildModel(raw) {
  const fileToGraph = new Map(raw.documents.map(d => [d.file, d.graphId]));

  const graphs = raw.documents.map(d => {
    const meta = d.fields?.find(f => f.key === 'metadata')?.value || {};
    return {
      id: d.graphId,
      slug: slugify(d.graphId),
      file: d.file,
      title: clean(meta.title || d.title),
      description: clean(meta.description || ''),
      sha256: d.sha256,
      nodeCount: d.nodeCount,
      edgeCount: d.edgeCount,
      region: regionOfGraph(d.graphId),
    };
  });
  const graphById = new Map(graphs.map(g => [g.id, g]));

  // Concepts with the graphs and regions they appear in.
  const nodes = raw.nodes.map(n => {
    const inGraphs = [...new Set(n.variants.map(v => fileToGraph.get(v.document)).filter(Boolean))];
    const regionCounts = {};
    for (const g of inGraphs) { const r = graphById.get(g).region; regionCounts[r] = (regionCounts[r] || 0) + 1; }
    // Primary region: the one most of its graphs sit in; ties go to region order.
    const region = REGIONS.map(r => r.id).sort((a, b) => (regionCounts[b] || 0) - (regionCounts[a] || 0))[0];
    return {
      id: n.id,
      label: clean(n.label) || n.id,
      type: clean(n.type).replace(/_/g, ' '),
      description: clean(n.description),
      graphs: inGraphs,
      regions: Object.keys(regionCounts),
      region: inGraphs.length ? region : null,
      degree: n.degree,
      claim: Boolean(n.claim),
    };
  });
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  // Adjacency in both directions, keeping the source predicate and its document.
  const incident = new Map(nodes.map(n => [n.id, []]));
  const edges = raw.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    relation: clean(e.relation).replace(/_/g, ' '),
    kind: e.kind,
    semantic: clean(e.semantic),
    graph: fileToGraph.get(e.document) || null,
    editorial: e.provenance === 'editorial',
  }));
  for (const e of edges) {
    if (e.source === e.target) continue;
    incident.get(e.source)?.push({ ...e, dir: 'out', other: e.target });
    incident.get(e.target)?.push({ ...e, dir: 'in', other: e.source });
  }

  // Which concepts get their own page: the connected overview plus every concept that
  // appears in more than one graph. Every other concept is listed on its graph's page.
  const overview = new Set(raw.overview.nodeIds);
  const paged = new Set(nodes.filter(n => overview.has(n.id) || n.graphs.length > 1).map(n => n.id));

  // Unique, stable slugs for paged concepts.
  const slugOf = new Map();
  const taken = new Map();
  for (const n of nodes) {
    if (!paged.has(n.id)) continue;
    let s = slugify(n.id);
    if (taken.has(s)) s = `${s}-${taken.get(s) + 1}`;
    taken.set(slugify(n.id), (taken.get(slugify(n.id)) || 0) + 1);
    slugOf.set(n.id, s);
  }
  const idBySlug = new Map([...slugOf].map(([id, s]) => [s, id]));

  const regions = REGIONS.map(r => {
    const rg = graphs.filter(g => g.region === r.id).sort((a, b) => b.nodeCount - a.nodeCount);
    return { ...r, graphs: rg.map(g => g.id), nodeCount: rg.reduce((s, g) => s + g.nodeCount, 0), conceptCount: nodes.filter(n => n.region === r.id).length };
  });

  const paths = raw.paths.map(p => ({
    id: p.id,
    title: clean(p.title),
    graph: p.color,
    steps: (p.segments || []).map(s => ({ text: clean(s.text), id: s.conceptId || null })),
  }));

  const multi = nodes.filter(n => n.graphs.length > 1);
  return {
    raw: { summary: raw.summary, audit: raw.audit },
    graphs,
    graphById,
    regions,
    nodes,
    nodeById,
    edges,
    incident,
    overview,
    paged,
    slugOf,
    idBySlug,
    paths,
    multiCount: multi.length,
    href: id => (slugOf.has(id) ? `/concepts/${slugOf.get(id)}` : nodeById.get(id)?.graphs[0] ? `/graphs/${graphById.get(nodeById.get(id).graphs[0]).slug}#${slugify(id)}` : null),
  };
}

export function regionColorVar(regionId) {
  return regionId ? `var(--r-${regionId})` : 'var(--muted)';
}

export { REGIONS, REGION_BY_ID };
