import MapCanvas from '../../components/MapCanvas.jsx';
import { loadAtlas } from '../../lib/atlas.js';

export const metadata = { title: 'Map', description: 'Every connected developer concept on one map, clustered by region and joined by its recorded links.' };

export default function MapPage() {
  const atlas = loadAtlas();
  return (
    <main>
      <div className="wrap">
        <header className="page-head" style={{ paddingBottom: 4 }}>
          <p className="kicker"><span style={{ color: 'var(--r-networks)' }}>$</span> map · {atlas.paged.size.toLocaleString('en')} concepts</p>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 40px)' }}>Every connected concept, by region</h1>
          <p className="muted" style={{ margin: '8px 0 0', fontSize: 14, maxWidth: '62em' }}>
            {atlas.paged.size.toLocaleString('en')} of {atlas.nodes.length.toLocaleString('en')} concepts: the ones with at least two distinct neighbours, plus every concept
            shared by two or more graphs. The rest are listed on their graph’s page. Each region has a fixed home on a ring; a dot sits near its
            region and is pulled by its links, so nearness means “linked”, not any measured distance.
          </p>
        </header>
      </div>
      <div className="wrap"><MapCanvas /></div>
    </main>
  );
}
