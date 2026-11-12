import { loadAtlas } from '../../lib/atlas.js';

export const dynamic = 'force-static';

// Compact search index: [label, href, region index, graph title, type]. Fetched by the
// header search only when it is first focused.
export function GET() {
  const atlas = loadAtlas();
  const regionIndex = new Map(atlas.regions.map((r, i) => [r.id, i]));
  const rows = [];
  for (const g of atlas.graphs) rows.push([g.title, `/graphs/${g.slug}`, regionIndex.get(g.region), 'Source graph', 'graph']);
  for (const n of atlas.nodes) {
    const href = atlas.href(n.id);
    if (!href) continue;
    const g = atlas.graphById.get(n.graphs[0]);
    rows.push([n.label, href, regionIndex.get(n.region) ?? -1, n.graphs.length > 1 ? `${n.graphs.length} graphs` : g?.title.split(/[—(:-]/)[0].trim() || '', n.type]);
  }
  return Response.json({ regions: atlas.regions.map(r => r.id), rows });
}
