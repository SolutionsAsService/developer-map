import Link from 'next/link';
import { loadAtlas } from '../../lib/atlas.js';

export const metadata = { title: 'About the data', description: 'How the Developer Map joins 80 source graphs: merging rules, what is kept apart, and how every number is counted.' };

const fmt = n => n.toLocaleString('en');

export default function About() {
  const atlas = loadAtlas();
  const au = atlas.raw.audit;
  const sum = atlas.raw.summary;
  return (
    <main className="manpage">
      <div className="wrap" style={{ paddingBottom: 56 }}>
        <header className="page-head">
          <p className="crumbs"><Link href="/">~</Link> / about</p>
          <h1>About the data</h1>
          <p className="lede">Every page is generated at build time from the JSON source graphs in <code>data/</code>. Nothing is fetched from a third party.</p>
        </header>
        <dl className="facts">
          <div><dt>Source graphs</dt><dd>{atlas.graphs.length}</dd></div>
          <div><dt>Source node records</dt><dd>{fmt(au.sourceNodeRecords)}</dd></div>
          <div><dt>Concepts after merging</dt><dd>{fmt(sum.concepts)}</dd></div>
          <div><dt>Recorded links</dt><dd>{fmt(sum.relationships)}</dd></div>
          <div><dt>Editorial links</dt><dd>{sum.bridges}</dd></div>
          <div><dt>In more than one graph</dt><dd>{fmt(atlas.multiCount)}</dd></div>
        </dl>
        <section className="section" style={{ paddingTop: 24 }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>How each number is counted</h2>
          <dl>
            <dt><strong>{fmt(sum.concepts)} concepts</strong></dt>
            <dd>Records whose labels match across files after normalising case, spacing, underscores and hyphens, generic qualifiers and acronyms become one concept. There is no fuzzy matching. People, claims, ambiguous single words (host, kernel, switch, frame…) and {au.declinedMerges?.length ?? 0} declined pairs are never merged. The build made {fmt(au.autoMerges.length)} automatic merges.</dd>
            <dt><strong>{fmt(atlas.multiCount)} in more than one graph</strong></dt>
            <dd>Concepts whose merged records come from two or more source files.</dd>
            <dt><strong>{fmt(sum.relationships)} links</strong></dt>
            <dd>{fmt(sum.sourceRelationships)} relationships exactly as the source files record them (predicate and direction unchanged), plus {sum.bridges} editorial bridges, marked wherever they appear.</dd>
            <dt><strong>{fmt(atlas.paged.size)} concept pages</strong></dt>
            <dd>The {fmt(atlas.overview.size)} concepts in the connected overview (each has at least two distinct neighbours), plus every concept found in more than one graph. All other concepts are listed, with their description, on their graph’s page.</dd>
          </dl>
        </section>
        <section className="section">
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>What is kept honest</h2>
          <ul>
            <li>Source assertions are shown as recorded and not independently fact-checked. {fmt(au.unsupportedClaims.length)} links carry no claim-level citation in their source.</li>
            <li>{fmt(au.conflicts.length)} concepts have descriptions that differ between files; the variants are preserved, not resolved.</li>
            <li>{au.skippedSources.length} file could not be imported ({au.skippedSources.map(s => s.file).join(', ')}): {au.skippedSources[0]?.reason}.</li>
            <li>Every original file is offered for download, byte for byte, on its graph’s page.</li>
          </ul>
        </section>
        <section className="section">
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Colours</h2>
          <p>The eight regions use colours from the xterm 256-colour terminal palette (220, 208, 44, 69, 77, 170, 203, 250), with darker equivalents on the light pages. White marks the traced concept on the front page.</p>
        </section>
        <section className="section">
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Speed</h2>
          <p>The site is pre-rendered. The map’s layout is computed once at build time and sent as a compact file; the browser only draws it. Search loads its index the first time you use it.</p>
        </section>
      </div>
    </main>
  );
}
