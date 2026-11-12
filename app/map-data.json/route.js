import { loadAtlas } from '../../lib/atlas.js';
import { mapLayout } from '../../lib/layout.js';

export const dynamic = 'force-static';

// Compact map data: nodes as [x, y, region, degree, label, slug, graphs], links as a flat
// array of node-index pairs. Fetched by the map page only.
export function GET() {
  const atlas = loadAtlas();
  const { nodes, links } = mapLayout(atlas);
  return Response.json({
    regions: atlas.regions.map(r => ({ id: r.id, name: r.name })),
    nodes: nodes.map(n => {
      const c = atlas.nodeById.get(n.id);
      return [Math.round(n.x), Math.round(n.y), n.r, c.degree, c.label, atlas.slugOf.get(n.id), c.graphs.length];
    }),
    links: links.flatMap(l => [l.source.index, l.target.index]),
  });
}
