import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadAtlas } from '../../../lib/atlas.js';
import { shortName } from '../../../lib/figure.js';

export const dynamicParams = false;
export function generateStaticParams() { return [...loadAtlas().slugOf.values()].map(id => ({ id })); }
export async function generateMetadata({ params }) {
  const { id } = await params;
  const atlas = loadAtlas();
  const n = atlas.nodeById.get(atlas.idBySlug.get(id));
  return n ? { title: n.label, description: n.description || `${n.label}: ${n.type}` } : {};
}

export default async function ConceptPage({ params }) {
  const { id: slug } = await params;
  const atlas = loadAtlas();
  const n = atlas.nodeById.get(atlas.idBySlug.get(slug));
  if (!n) notFound();
  const region = atlas.regions.find(r => r.id === n.region);
  const links = atlas.incident.get(n.id);
  // Group by relation and direction, largest group first.
  const groups = new Map();
  for (const l of links) {
    const key = `${l.dir}|${l.relation}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(l);
  }
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  const neighbourRegions = {};
  for (const l of links) { const o = atlas.nodeById.get(l.other); if (o?.region) neighbourRegions[o.region] = (neighbourRegions[o.region] || 0) + 1; }

  return (
    <main className={`manpage rg-${n.region || 'p2p'}`}>
      <div className="wrap">
        <p className="crumbs" style={{ paddingTop: 28 }}>
          <Link href="/">~</Link> / {region ? <Link href={`/regions/${region.id}`}>{region.id}</Link> : 'concepts'} / {slug}
        </p>
        <div className="concept-head">
          <p className="type">{n.type}{n.claim ? ' · source claim' : ''}</p>
          <h1>{n.label}</h1>
          {n.description && <p className="desc">{n.description}</p>}
        </div>
        <dl className="facts">
          <div><dt>Recorded links</dt><dd>{links.length}</dd></div>
          <div><dt>Source graphs</dt><dd>{n.graphs.length}</dd></div>
          <div><dt>Regions</dt><dd>{n.regions.length}</dd></div>
        </dl>

        <div className="two-col" style={{ paddingBottom: 56 }}>
          <section aria-labelledby="links-title">
            <h2 id="links-title" className="kicker">Every recorded link</h2>
            {links.length === 0 && <p>No links are recorded for {n.label} in the source graphs.</p>}
            {ordered.map(([key, list]) => {
              const [dir, relation] = key.split('|');
              return (
                <div key={key} className="link-group">
                  <h3><span className="muted">{dir === 'out' ? `${n.label} →` : `→ ${n.label}`}</span> {relation} <span className="muted">· {list.length}</span></h3>
                  <ul className="links">
                    {list.map(l => {
                      const o = atlas.nodeById.get(l.other);
                      const href = atlas.href(l.other);
                      return (
                        <li key={l.id + l.dir} className={`rg-${o?.region || 'p2p'}`}>
                          <span className="dir" aria-label={dir === 'out' ? 'outgoing' : 'incoming'}>{dir === 'out' ? '→' : '←'}</span>
                          <div>
                            <span className="swatch" aria-hidden="true" style={{ marginRight: 6 }} />
                            {href ? <Link href={href}><strong>{o?.label || l.other}</strong></Link> : <strong>{o?.label || l.other}</strong>}
                            {l.editorial && <span className="editorial" style={{ marginLeft: 8 }}>editorial</span>}
                            {l.semantic && <p className="sem">{l.semantic}</p>}
                            <span className="src">{l.graph ? shortName(atlas.graphById.get(l.graph)) : 'editorial'} · {l.id}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
          <aside>
            <h2 className="kicker">Appears in</h2>
            <ul className="chips" style={{ marginBottom: 24 }}>
              {n.graphs.map(gid => { const g = atlas.graphById.get(gid); return <li key={gid}><Link className={`chip rg-${g.region}`} href={`/graphs/${g.slug}`}><span className="swatch" aria-hidden="true" />{shortName(g)}</Link></li>; })}
            </ul>
            {Object.keys(neighbourRegions).length > 0 && (
              <>
                <h2 className="kicker">Where its links lead</h2>
                <ul className="links" style={{ marginBottom: 24 }}>
                  {atlas.regions.filter(r => neighbourRegions[r.id]).map(r => (
                    <li key={r.id} className={`rg-${r.id}`} style={{ gridTemplateColumns: '12px minmax(0,1fr) auto', alignItems: 'center' }}>
                      <span className="swatch" aria-hidden="true" />
                      <span>{r.name}</span>
                      <span className="mono">{neighbourRegions[r.id]}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p><Link className="button" href={`/map?c=${slug}`}>See it on the map →</Link></p>
            <p className="muted" style={{ fontSize: 13 }}>Links are source assertions, shown as recorded in each graph and not independently fact-checked. Editorial links are marked.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
