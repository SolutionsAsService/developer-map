'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Header search. The index (about 13,000 rows) loads on first focus, not with the page.
export default function Search() {
  const [index, setIndex] = useState(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  const load = () => {
    if (index) return;
    fetch('/search-index.json').then(r => r.json()).then(setIndex).catch(() => setIndex({ regions: [], rows: [] }));
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!index || term.length < 2) return [];
    const starts = [], contains = [];
    for (const row of index.rows) {
      const label = row[0].toLowerCase();
      if (label.startsWith(term)) starts.push(row);
      else if (label.includes(term)) contains.push(row);
      if (starts.length >= 12) break;
    }
    return [...starts, ...contains].slice(0, 12);
  }, [index, q]);

  const go = row => { setOpen(false); setQ(''); router.push(row[1]); };

  return (
    <div className="search" role="search">
      <label htmlFor="site-search" className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>Search concepts</label>
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="site-search-results"
        aria-activedescendant={open && results[active] ? `sr-${active}` : undefined}
        aria-autocomplete="list"
        placeholder="search 13,299 concepts"
        autoComplete="off"
        value={q}
        onFocus={() => { load(); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => { setQ(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
          else if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); }
        }}
      />
      {open && q.trim().length >= 2 && (
        <ul id="site-search-results" className="search-results" role="listbox" aria-label="Matches">
          {!index && <li className="search-empty">Loading the index…</li>}
          {index && results.length === 0 && <li className="search-empty">No concept named “{q}”.</li>}
          {results.map((row, i) => (
            <li key={row[1] + i} id={`sr-${i}`} role="option" aria-selected={i === active}>
              <a href={row[1]} onMouseDown={e => { e.preventDefault(); go(row); }} className={row[2] >= 0 ? `rg-${index.regions[row[2]]}` : ''}>
                <span className="dot" aria-hidden="true" />
                <span><strong>{row[0]}</strong><small>{row[4]} · {row[3]}</small></span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
