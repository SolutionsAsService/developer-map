import Link from 'next/link';
import StackFigure from '../components/StackFigure.jsx';
import { loadAtlas, TRACE_ID } from '../lib/atlas.js';

const fmt = n => n.toLocaleString('en');

export default function Home() {
  const atlas = loadAtlas();
  const trace = atlas.nodeById.get(TRACE_ID);
  const total = atlas.nodes.length;
  const shared = atlas.nodes.filter(n => n.graphs.length > 1).sort((a, b) => b.graphs.length - a.graphs.length || b.degree - a.degree);
  const maxConcepts = Math.max(...atlas.regions.map(r => r.conceptCount));
  const lede = (
    <p className="lede">
      Each row is a region and each block one source graph, drawn as wide as the concepts it holds, on one scale. The white
      thread is <Link href={atlas.href(TRACE_ID)}>{trace.label}</Link>: it turns up in {trace.graphs.length} graphs across{' '}
      {trace.regions.length} of the {atlas.regions.length} regions, more than any other concept.
    </p>
  );

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="kicker"><span style={{ color: 'var(--r-networks)' }}>$</span> {atlas.graphs.length} knowledge graphs · one map</p>
          <h1 id="hero-title">
            {fmt(total)} developer concepts. <span className="hl">{fmt(atlas.multiCount)} of them</span> turn up in more than one graph.
          </h1>
          <p className="hero-mobile-cta"><Link className="button button--primary" href="/map">Open the map →</Link></p>
          {lede}
          <div className="hero-ctas">
            <Link className="button button--primary" href="/map">Open the map →</Link>
            <Link className="button" href={atlas.href(TRACE_ID)}>Follow {trace.label}</Link>
          </div>
        </div>
        <figure className="hero-figure">
          <ul className="legend" aria-label="Key">
            {atlas.regions.map(r => <li key={r.id} className={`rg-${r.id}`}><i aria-hidden="true" />{r.name}</li>)}
            <li><i className="trace-key" aria-hidden="true" />{trace.label}</li>
          </ul>
          <StackFigure atlas={atlas} size="wide" id="fw" />
          <StackFigure atlas={atlas} size="narrow" id="fn" />
          <figcaption>Colours are xterm terminal colours, one per region. Select a row for its region, a block for its graph.</figcaption>
        </figure>
      </section>

      <div className="hero-after">
        {lede}
        <Link className="button" href={atlas.href(TRACE_ID)}>Follow {trace.label}</Link>
      </div>

      <div className="wrap">
        <section className="section" aria-labelledby="regions-title">
          <div className="section-head">
            <h2 id="regions-title">Eight regions</h2>
            <p>The {atlas.graphs.length} source graphs grouped by what they describe. Bars share one scale: concepts whose home is that region.</p>
          </div>
          <div className="region-grid">
            {atlas.regions.map(r => (
              <Link key={r.id} href={`/regions/${r.id}`} className={`region-card rg-${r.id}`}>
                <h3>{r.name}</h3>
                <p>{r.blurb}</p>
                <span className="unit-bar" style={{ width: `${(r.conceptCount / maxConcepts) * 100}%` }} aria-hidden="true" />
                <span className="count">{fmt(r.conceptCount)} concepts · {r.graphs.length} graphs</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="shared-title">
          <div className="section-head">
            <h2 id="shared-title">The shared vocabulary</h2>
            <p>The concepts that the most graphs have in common. Each chip opens the concept with every recorded link, from every graph.</p>
          </div>
          <ul className="chips">
            {shared.slice(0, 40).map(n => (
              <li key={n.id}>
                <Link className={`chip rg-${n.region}`} href={atlas.href(n.id)}>
                  <span className="swatch" aria-hidden="true" />{n.label} <span className="muted">{n.graphs.length}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>The number is how many of the {atlas.graphs.length} graphs contain the concept.</p>
        </section>
      </div>
    </main>
  );
}
