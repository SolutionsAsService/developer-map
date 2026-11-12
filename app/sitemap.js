import { loadAtlas, REGIONS } from '../lib/atlas.js';
const BASE = process.env.NEXT_PUBLIC_SITE_URL || '';
export default function sitemap() {
  const a = loadAtlas();
  return ['/', '/map', '/regions', '/graphs', '/about', ...REGIONS.map(r => `/regions/${r.id}`), ...a.graphs.map(g => `/graphs/${g.slug}`), ...[...a.slugOf.values()].map(s => `/concepts/${s}`)].map(p => ({ url: BASE + p }));
}
