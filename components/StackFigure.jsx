import Link from 'next/link';
import { figureGeometry } from '../lib/figure.js';

// The landing graphic. Server-rendered SVG; every row and block is a link; ships no JS.
export default function StackFigure({ atlas, size, id, traceId }) {
  const g = figureGeometry(atlas, size, traceId);
  const s = g.size;
  const wide = size !== 'narrow';
  const first = g.stops[0];
  const pts = g.stops.map(p => `${p.x},${p.y}`).join(' ');
  const atlasHref = atlas.href(g.trace.id);

  return (
    <svg className={`stack-figure stack-figure--${size}`} viewBox={`0 0 ${s.width} ${g.height + 4}`} width={s.width} height={g.height + 4} role="group" aria-labelledby={`${id}-t ${id}-d`}>
      <title id={`${id}-t`}>{traceId ? `Where ${g.trace.label} appears among the 80 source graphs` : 'The 80 source graphs, by region'}</title>
      <desc id={`${id}-d`}>
        {`Eight rows, one per region; each block is one source graph, as wide as the concepts it holds. ` +
          `A white thread joins the ${g.stops.length} graphs that contain ${g.trace.label}, across ${g.trace.regions.length} regions.`}
      </desc>
      {g.rows.map(row => (
        <g key={row.id} className={`rg-${row.id}`}>
          <line className="row-rule" x1="0" x2={s.width} y1={row.y0} y2={row.y0} />
          <Link href={`/regions/${row.id}`} className="region-row" aria-label={`${row.name}: ${row.graphs} graphs, ${row.count} records`}>
            <rect className="row-hit" x="0" y={row.y0} width={g.plotX - 6} height={s.rowH} />
            <text className="row-name" x="0" y={row.y0 + (size === 'mini' ? 19 : wide ? 21 : 16)}>{size === 'wide' ? row.name : size === 'mini' ? row.name.replace('Peer-to-peer & hidden web', 'Peer-to-peer').replace('Paradigms & compilers', 'Paradigms') : row.name.split(/[ &]/)[0]}</text>
            {size !== 'mini' && <text className="row-count" x="0" y={row.y0 + (wide ? 37 : 29)}>{wide ? `${row.graphs} graphs · ${row.count.toLocaleString('en')} rec.` : `${row.count.toLocaleString('en')} rec.`}</text>}
          </Link>
          {row.tiles.map(t => (
            <Link key={t.id} href={`/graphs/${t.slug}`} className="region-row" tabIndex={-1} aria-label={`${t.title}: ${t.nodes} concepts${t.trace ? `, contains ${g.trace.label}` : ''}`}>
              <rect className={t.trace ? 'tile tile--trace' : 'tile'} x={t.x} y={t.y} width={t.w} height={t.h} rx="2" />
              {t.showLabel && <text className={t.trace ? 'tile-label' : 'tile-label tile-label--dim'} x={t.x + 5} y={t.y + t.h / 2 + 4}>{t.short}</text>}
            </Link>
          ))}
        </g>
      ))}
      <polyline className="trace-line" points={pts} />
      {g.stops.map(p => <circle key={p.id} className="trace-dot" cx={p.x} cy={p.y} r={wide ? 3.6 : 3} />)}
      <Link href={atlasHref} aria-label={`${g.trace.label}: ${g.stops.length} graphs, ${g.trace.regions.length} regions`}>
        <text className="trace-label" x={first.x > s.width * 0.62 ? first.x + 6 : first.x < g.plotX + 90 ? first.x - 6 : first.x} y={13} textAnchor={first.x > s.width * 0.62 ? 'end' : first.x < g.plotX + 90 ? 'start' : 'middle'}>{g.trace.label} · {g.stops.length} graphs · {g.trace.regions.length} regions ›</text>
      </Link>
      <line className="trace-line" x1={first.x} x2={first.x} y1={17} y2={first.y - 4} />
    </svg>
  );
}
