import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadAtlas, slugify } from '../../../lib/atlas.js';
import { shortName } from '../../../lib/figure.js';

export const dynamicParams = false;
export function generateStaticParams() { return loadAtlas().graphs.map(g => ({ id: g.slug })); }
export async function generateMetadata({ params }) {
  const { id } = await params;
  const g = loadAtlas().graphs.find(x => x.slug === id);
  return g ? { title: shortName(g), description: g.description || g.title } : {};
}

const cut = (t, n = 220) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t);

export default async function GraphPage({ params }) {
  const { id } = await params;
  const atlas = loadAtlas();
  const g = atlas.graphs.find(x => x.slug === id);
  if (!g) notFound();
  const region = atlas.regions.find(r => r.id === g.region);
  const concepts = atlas.nodes.filter(n => n.graphs.includes(g.id)).sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label));
  const shared = concepts.filter(n => n.graphs.length > 1).sort((a, b) => b.graphs.length - a.graphs.length);
  const paths = atlas.paths.filter(p => p.graph === g.id);

  return (
    <main className={`manpage rg-${g.region}`}>
      <div className="wrap">
        <p className="crumbs" style={{ paddingTop: 28 }}><Link href="/">~</Link> / <Link href={`/regions/${region.id}`}>{region.id}</Link> / {g.slug}</p>
        <div className="concept-head">
          <p className="type">source graph · {region.name}</p>
          <h1>{shortName(g)}</h1>
          <p className="desc">{[g.title, g.description].filter((t, i, all) => t && t !== shortName(g) && all.indexOf(t) === i).join('. ') || g.title}</p>
        </div>
        <dl className="facts">
          <div><dt>Concepts</dt><dd>{g.nodeCount}</dd></div>
          <div><dt>Links</dt><dd>{g.edgeCount}</dd></div>
          <div><dt>Shared with other graphs</dt><dd>{shared.length}</dd></div>
          <div><dt>Learning paths</dt><dd>{paths.length}</dd></div>
        </dl>
        <p style={{ marginBottom: 32 }}>
          <a className="button" href={`/sources/${g.file}`} download>Download {g.file}</a>{' '}
          <span className="muted mono" style={{ fontSize: 12, marginLeft: 8 }}>sha256 {g.sha256.slice(0, 16)}…</span>
        </p>

        {shared.length > 0 && (
          <section aria-labelledby="sh" style={{ marginBottom: 36 }}>
            <h2 id="sh" className="kicker">Shared with other graphs</h2>
            <ul className="chips">
              {shared.slice(0, 60).map(n => <li key={n.id}><Link className={`chip rg-${n.region}`} href={atlas.href(n.id)}><span className="swatch" aria-hidden="true" />{n.label} <span className="muted">{n.graphs.length}</span></Link></li>)}
            </ul>
          </section>
        )}

        {paths.length > 0 && (
          <section aria-labelledby="lp" style={{ marginBottom: 36 }}>
            <h2 id="lp" className="kicker">Learning paths in this graph</h2>
            <ol className="path-list">
              {paths.map(p => (
                <li key={p.id}>
                  <strong className="mono">{p.title}</strong>
                  <div className="path-steps">
                    {p.steps.map((s, i) => {
                      const href = s.id && atlas.href(s.id);
                      const label = (s.id && atlas.nodeById.get(s.id)?.label) || s.text;
                      return <span key={i}>{i > 0 && <span className="arrow" aria-hidden="true">→ </span>}{href ? <Link href={href}>{label}</Link> : label}</span>;
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="all" style={{ paddingBottom: 56 }}>
          <h2 id="all" className="kicker">All {concepts.length} concepts, most connected first</h2>
          <ul className="concept-list">
            {concepts.map(n => {
              const href = atlas.slugOf.has(n.id) ? atlas.href(n.id) : null;
              return (
                <li key={n.id} id={slugify(n.id)}>
                  <span className="t">{n.type}{n.degree ? ` · ${n.degree} links` : ''}</span>
                  {href ? <Link href={href}><strong>{n.label}</strong></Link> : <strong>{n.label}</strong>}
                  {n.description && <p>{cut(n.description)}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
