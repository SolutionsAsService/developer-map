import Link from 'next/link';
import { loadAtlas } from '../../lib/atlas.js';

export const metadata = { title: 'Regions', description: 'The eight regions of the Developer Map and the source graphs in each.' };

export default function Regions() {
  const atlas = loadAtlas();
  const max = Math.max(...atlas.regions.map(r => r.conceptCount));
  return (
    <main className="wrap">
      <header className="page-head">
        <p className="crumbs"><Link href="/">~</Link> / regions</p>
        <h1>Eight regions</h1>
        <p className="lede">Every one of the {atlas.graphs.length} source graphs sits in one region. A concept’s home region is the one most of its graphs belong to.</p>
      </header>
      <div className="region-grid" style={{ paddingBottom: 56 }}>
        {atlas.regions.map(r => (
          <Link key={r.id} href={`/regions/${r.id}`} className={`region-card rg-${r.id}`}>
            <h2 style={{ fontSize: 22, color: 'var(--c)' }}>{r.name}</h2>
            <p>{r.blurb}</p>
            <span className="unit-bar" style={{ width: `${(r.conceptCount / max) * 100}%` }} aria-hidden="true" />
            <span className="count">{r.conceptCount.toLocaleString('en')} concepts · {r.graphs.length} graphs</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
