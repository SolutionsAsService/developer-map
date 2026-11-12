// Map layout, computed at build time with d3-force. Each region has a fixed home on a
// ring; concepts are pulled toward their home region and by their recorded links, so
// clusters are regions and concepts shared across regions settle between them.
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force';

const R = 900; // ring radius in layout units

export function mapLayout(atlas) {
  const ids = [...atlas.paged];
  const index = new Map(ids.map((id, i) => [id, i]));
  const regionIndex = new Map(atlas.regions.map((r, i) => [r.id, i]));
  const home = atlas.regions.map((r, i) => {
    const a = (i / atlas.regions.length) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(a) * R, y: Math.sin(a) * R };
  });
  const seed = mulberry32(11);
  const nodes = ids.map(id => {
    const n = atlas.nodeById.get(id);
    const h = home[regionIndex.get(n.region) ?? 0];
    return { id, r: regionIndex.get(n.region) ?? 0, deg: n.degree, x: h.x + (seed() - 0.5) * 400, y: h.y + (seed() - 0.5) * 400 };
  });
  const seen = new Set();
  const links = [];
  for (const e of atlas.edges) {
    const a = index.get(e.source), b = index.get(e.target);
    if (a === undefined || b === undefined || a === b) continue;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ source: a, target: b });
  }
  const sim = forceSimulation(nodes)
    .randomSource(mulberry32(5))
    .force('link', forceLink(links).distance(26).strength(0.08))
    .force('charge', forceManyBody().strength(-14).theta(0.95).distanceMax(260))
    .force('x', forceX(d => home[d.r].x).strength(0.05))
    .force('y', forceY(d => home[d.r].y).strength(0.05))
    .force('collide', forceCollide(d => 3 + Math.sqrt(d.deg) * 0.9).iterations(1))
    .stop();
  for (let i = 0; i < 260; i++) sim.tick();
  return { nodes, links, ids, home };
}

function mulberry32(seed) {
  return function next() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
