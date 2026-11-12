import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadAtlas, REGIONS, REGION_BY_ID } from '../../../lib/atlas.js';
import { shortName } from '../../../lib/figure.js';

export const dynamicParams = false;
export function generateStaticParams() { return REGIONS.map(r => ({ id: r.id })); }
export async function generateMetadata({ params }) {
  const { id } = await params;
  const r = REGION_BY_ID[id];
  return r ? { title: r.name, description: r.blurb } : {};
}

export default async function RegionPage({ params }) {
  const { id } = await params;
  const atlas = loadAtlas();
  const region = atlas.regions.find(r => r.id === id);
  if (!region) notFound();
  const graphs = region.graphs.map(g => atlas.graphById.get(g));
  const maxGraph = Math.max(...atlas.graphs.map(g => g.nodeCount));
  const home = atlas.nodes.filter(n => n.region === id);
  const hubs = home.filter(n => atlas.paged.has(n.id)).sort((a, b) => b.degree - a.degree).slice(0, 30);
  const bridges = home.filter(n => n.regions.length > 1).sort((a, b) => b.regions.length - a.regions.length || b.graphs.length - a.graphs.length).slice(0, 24);

  return (
    <main className={`rg-${id}`}>
      <div className="wrap">
        <header className="page-head">
          <p className="crumbs"><Link href="/">~</Link> / <Link href="/regions">regions</Link> / {id}</p>
          <div className="concept-head" style={{ margin: '8px 0 0' }}>
            <p className="type">region · {graphs.length} graphs</p>
            <h1 style={{ color: 'var(--c)' }}>{region.name}</h1>
            <p className="desc">{region.blurb}</p>
          </div>
        </header>
        <dl className="facts">
          <div><dt>Source graphs</dt><dd>{graphs.length}</dd></div>
          <div><dt>Concepts at home here</dt><dd>{home.length.toLocaleString('en')}</dd></div>
          <div><dt>Also in other regions</dt><dd>{home.filter(n => n.regions.length > 1).length.toLocaleString('en')}</dd></div>
        </dl>

        <section aria-labelledby="g-title" style={{ marginBottom: 40 }}>
          <h2 id="g-title" className="kicker">Graphs in {region.name}, by size</h2>
          <p className="muted" style={{ fontSize: 14 }}>Bars share one scale across the whole site (full width = {maxGraph} concepts, the largest graph).</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Graph</th><th style={{ width: '40%' }}>Concepts</th><th className="num">Links</th></tr></thead>
              <tbody>
                {graphs.map(g => (
                  <tr key={g.id}>
                    <td><Link href={`/graphs/${g.slug}`}><strong className="mono">{shortName(g)}</strong></Link><br /><span className="muted" style={{ fontSize: 13 }}>{g.title}</span></td>
                    <td><span className="unit-bar" style={{ width: `${(g.nodeCount / maxGraph) * 100}%` }} aria-hidden="true" /> <span className="mono" style={{ fontSize: 13 }}>{g.nodeCount}</span></td>
                    <td className="num">{g.edgeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="two-col" style={{ paddingBottom: 56 }}>
          <section aria-labelledby="hubs-title">
            <h2 id="hubs-title" className="kicker">Most connected concepts</h2>
            <ul className="chips">
              {hubs.map(n => <li key={n.id}><Link className={`chip rg-${n.region}`} href={atlas.href(n.id)}>{n.label} <span className="muted">{n.degree}</span></Link></li>)}
            </ul>
          </section>
          <section aria-labelledby="br-title">
            <h2 id="br-title" className="kicker">Bridges to other regions</h2>
            <ul className="chips">
              {bridges.map(n => <li key={n.id}><Link className={`chip rg-${n.region}`} href={atlas.href(n.id)}>{n.label} <span className="muted">{n.regions.length} regions</span></Link></li>)}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
