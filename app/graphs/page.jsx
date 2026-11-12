import Link from 'next/link';
import { loadAtlas } from '../../lib/atlas.js';
import { shortName } from '../../lib/figure.js';

export const metadata = { title: 'Source graphs', description: 'All 80 source knowledge graphs, by region, with their size and a download of the original JSON.' };

export default function Graphs() {
  const atlas = loadAtlas();
  const max = Math.max(...atlas.graphs.map(g => g.nodeCount));
  return (
    <main className="wrap">
      <header className="page-head">
        <p className="crumbs"><Link href="/">~</Link> / graphs</p>
        <h1>{atlas.graphs.length} source graphs</h1>
        <p className="lede">Each one is a JSON knowledge graph in the repository. Bars share one scale (full width = {max} concepts).</p>
      </header>
      {atlas.regions.map(r => (
        <section key={r.id} className={`section rg-${r.id}`} style={{ padding: '28px 0' }}>
          <h2 style={{ color: 'var(--c)', fontSize: 22, marginBottom: 12 }}><Link href={`/regions/${r.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.name}</Link></h2>
          <div className="table-wrap">
            <table>
              <tbody>
                {r.graphs.map(gid => { const g = atlas.graphById.get(gid); return (
                  <tr key={g.id}>
                    <td style={{ width: '32%' }}><Link href={`/graphs/${g.slug}`} className="mono"><strong>{shortName(g)}</strong></Link><br /><span className="muted" style={{ fontSize: 13 }}>{g.title}</span></td>
                    <td><span className="unit-bar" style={{ width: `${(g.nodeCount / max) * 100}%` }} aria-hidden="true" /></td>
                    <td className="num mono" style={{ width: 120 }}>{g.nodeCount} / {g.edgeCount}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="muted" style={{ fontSize: 13, paddingBottom: 48 }}>Numbers are concepts / links as recorded in each source file.</p>
    </main>
  );
}
