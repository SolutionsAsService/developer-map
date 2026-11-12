// Geometry for the landing graphic, computed at build time and drawn at 1:1 in two sizes.
// Encodings: row = region; block = one source graph, width proportional to its concept
// count on ONE scale for every row; white thread and outline = the graphs containing the
// traced concept. Order within a row is largest graph first.
import { TRACE_ID } from './atlas.js';

const TOP = 20; // room above the rows for the thread's label

export const SIZES = {
  wide: { width: 760, labelW: 178, rowH: 46, gap: 2, pad: 4, labelFont: 11 },
  narrow: { width: 343, labelW: 92, rowH: 34, gap: 1, pad: 2, labelFont: 11 },
};

export function figureGeometry(atlas, sizeKey) {
  const s = SIZES[sizeKey];
  const plotX = s.labelW;
  const plotW = s.width - s.labelW - s.pad;
  const maxRegion = Math.max(...atlas.regions.map(r => r.nodeCount + (r.graphs.length - 1) * s.gap / 1e9));
  const trace = atlas.nodeById.get(TRACE_ID);
  const traceGraphs = new Set(trace.graphs);
  // One scale: px per concept, set so the largest region (with its gaps) fills the plot.
  const widest = atlas.regions.reduce((m, r) => Math.max(m, r.nodeCount), 0);
  const maxGaps = Math.max(...atlas.regions.map(r => r.graphs.length - 1)) * s.gap;
  const k = (plotW - maxGaps) / widest;

  const rows = atlas.regions.map((r, i) => {
    const y0 = i * s.rowH;
    let x = plotX;
    const tiles = r.graphs.map(gid => {
      const g = atlas.graphById.get(gid);
      const w = Math.max(1.5, g.nodeCount * k);
      const tile = { id: g.id, slug: g.slug, title: g.title, short: shortName(g), nodes: g.nodeCount, x: round(x), y: y0 + 6, w: round(w), h: s.rowH - 12, trace: traceGraphs.has(g.id) };
      x += w + s.gap;
      return tile;
    });
    for (const t of tiles) t.showLabel = sizeKey === 'wide' && t.w >= t.short.length * s.labelFont * 0.62 + 8;
    return { id: r.id, name: r.name, count: r.nodeCount, graphs: r.graphs.length, y0, tiles };
  });

  // The thread snakes: left to right in one row, right to left in the next, so it never
  // doubles back across a whole row. Dots sit on the blocks' top edge, clear of labels.
  let flip = false;
  const stops = [];
  for (const row of rows) {
    const hits = row.tiles.filter(t => t.trace).map(t => ({ x: round(t.x + t.w / 2), y: round(t.y + 4), id: t.id }));
    if (!hits.length) continue;
    stops.push(...(flip ? hits.reverse() : hits));
    flip = !flip;
  }
  for (const row of rows) { row.y0 += TOP; for (const t of row.tiles) t.y += TOP; }
  for (const p of stops) p.y += TOP;
  return { size: s, plotX, plotW, top: TOP, height: TOP + rows.length * s.rowH, rows, stops, trace, k, maxRegion };
}

// A readable short name for a graph block.
export function shortName(g) {
  const special = { CPP: 'C++', csharp: 'C#', fortran: 'Fortran', asm: 'Assembly', OS: 'OS', x86: 'x86', 'HTTP_regenerated': 'HTTP', 'OSI-Model': 'OSI', TCP_IP: 'TCP/IP', wifi_graph: 'Wi-Fi', Router_Graph: 'Router', React_Graph: 'React', Cuda: 'CUDA', grace_hopper: 'Grace Hopper', gnu_compiler_collection: 'GCC', application_binary_interface_abi: 'ABI', android_runtime_art: 'ART', imperative_programming: 'Imperative', object_oriented_programming: 'OOP', concurrent_computing: 'Concurrency', garbage_collection: 'GC', instruction_set_architecture: 'ISA', virtual_machine: 'VMs', system_image: 'System image', optical_disc_image: 'Disc image', volume_computing: 'Volumes', public_key_cryptography: 'Public key', digital_signature: 'Signatures', cryptographichash: 'Hashes', dsa: 'DSA', proof_of_work: 'Proof of work', denial_of_service: 'DoS', overlay_networks: 'Overlays', torrentfile: 'Torrent file', deep_web: 'Deep web', world_wide_web: 'WWW', search_engine: 'Search', vertical_search_engine: 'Vertical search', Cloud_Computing: 'Cloud', Web_Framework: 'Web frameworks', Network_Packet: 'Packets', Network_Switch: 'Switches', Internet_Protocol: 'IP', Packet_Analyzer: 'Packet analysers', Ruby_on_Rails: 'Rails', React_Native: 'React Native', bittorrent: 'BitTorrent', Containerization: 'Containers', gayfemboy: 'Gayfemboy', mirai: 'Mirai', botnets: 'Botnets', bitcoin: 'Bitcoin', nginx: 'nginx', git: 'git', sandbox: 'Sandboxes', tor: 'Tor', clearnet: 'Clearnet', object: 'Objects', IPv6: 'IPv6', Routing: 'Routing', Firewall: 'Firewalls', CAN: 'CAN bus', DHT: 'DHT', Golang: 'Go' };
  return special[g.id] || g.id.replace(/_/g, ' ');
}

function round(v) {
  return Math.round(v * 10) / 10;
}
