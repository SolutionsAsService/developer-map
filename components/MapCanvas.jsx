'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// The map: a canvas drawing of the precomputed layout in /map-data.json. No simulation runs
// here; the browser only draws, pans, zooms and highlights.
const COLORS = { languages: '#ffd700', paradigms: '#ff8700', machines: '#00d7d7', systems: '#5f87ff', networks: '#5fd75f', web: '#d75fd7', security: '#ff5f5f', p2p: '#bcbcbc' };

export default function MapCanvas() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const headingRef = useRef(null);
  const view = useRef({ k: 1, x: 0, y: 0 });
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [off, setOff] = useState(() => new Set());
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch('/map-data.json').then(r => r.json()).then(d => {
      const adj = d.nodes.map(() => []);
      for (let i = 0; i < d.links.length; i += 2) { adj[d.links[i]].push(d.links[i + 1]); adj[d.links[i + 1]].push(d.links[i]); }
      const order = d.nodes.map((_, i) => i).sort((a, b) => d.nodes[b][3] - d.nodes[a][3]);
      setData({ ...d, adj, order, slugIndex: new Map(d.nodes.map((n, i) => [n[5], i])) });
    });
  }, []);

  // Select from ?c=slug once the data arrives.
  useEffect(() => {
    if (!data) return;
    const c = new URLSearchParams(window.location.search).get('c');
    if (c && data.slugIndex.has(c)) setSelected(data.slugIndex.get(c));
  }, [data]);

  const fit = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !data) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    const k = Math.min(w, h) / 2500;
    view.current = { k, x: w / 2, y: h / 2 };
  }, [data]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current, stage = stageRef.current;
    if (!canvas || !stage || !data) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth, h = stage.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const { k, x, y } = view.current;
    const sx = n => n[0] * k + x, sy = n => n[1] * k + y;
    const lit = selected !== null ? new Set([selected, ...data.adj[selected]]) : null;
    const dim = i => off.has(data.regions[data.nodes[i][2]].id) || (lit && !lit.has(i));

    // Links: faint everywhere, bright for the selection.
    ctx.lineWidth = 1;
    ctx.strokeStyle = lit ? 'rgba(154,163,178,0.05)' : 'rgba(154,163,178,0.10)';
    ctx.beginPath();
    for (let i = 0; i < data.links.length; i += 2) {
      const a = data.nodes[data.links[i]], b = data.nodes[data.links[i + 1]];
      ctx.moveTo(sx(a), sy(a)); ctx.lineTo(sx(b), sy(b));
    }
    ctx.stroke();
    if (lit) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const s = data.nodes[selected];
      for (const j of data.adj[selected]) { const b = data.nodes[j]; ctx.moveTo(sx(s), sy(s)); ctx.lineTo(sx(b), sy(b)); }
      ctx.stroke();
    }
    // Nodes: radius grows with links, kept small; drawn smallest first.
    const rad = n => Math.max(1.6, Math.min(9, (1.2 + Math.sqrt(n[3]) * 0.55) * Math.sqrt(Math.max(k, 0.25) * 2.2)));
    for (let o = data.order.length - 1; o >= 0; o--) {
      const i = data.order[o], n = data.nodes[i];
      const px = sx(n), py = sy(n);
      if (px < -20 || py < -20 || px > w + 20 || py > h + 20) continue;
      ctx.globalAlpha = dim(i) ? 0.12 : 1;
      ctx.fillStyle = COLORS[data.regions[n[2]].id];
      ctx.beginPath(); ctx.arc(px, py, rad(n), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (selected !== null) {
      const s = data.nodes[selected];
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx(s), sy(s), rad(s) + 4, 0, Math.PI * 2); ctx.stroke();
    }
    // Labels: biggest first, skipped where they would overlap one already drawn.
    ctx.font = '600 12px ui-monospace, Menlo, Consolas, monospace';
    ctx.textBaseline = 'middle';
    const boxes = [];
    const want = lit ? [...lit].sort((a, b) => data.nodes[b][3] - data.nodes[a][3]) : data.order.slice(0, Math.round(40 + k * 220));
    for (const i of want) {
      if (dim(i)) continue;
      const n = data.nodes[i];
      const px = sx(n) + rad(n) + 4, py = sy(n);
      const tw = ctx.measureText(n[4]).width;
      if (px < 0 || py < 8 || px + tw > w || py > h - 8) continue;
      const box = [px - 2, py - 9, px + tw + 2, py + 9];
      if (boxes.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
      boxes.push(box);
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(12,15,20,0.9)'; ctx.strokeText(n[4], px, py);
      ctx.fillStyle = i === selected ? '#ffffff' : '#e8ebf0'; ctx.fillText(n[4], px, py);
    }
  }, [data, selected, off]);

  // Redraw whenever anything changes.
  const raf = useRef(0);
  const request = useCallback(() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(draw); }, [draw]);
  useEffect(() => { if (data && view.current.k === 1) fit(); request(); }, [data, fit, request, selected, off]);
  useEffect(() => { const onResize = () => request(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [request]);

  // Pan, zoom, pick.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !data) return;
    const pick = (cx, cy) => {
      const r = stage.getBoundingClientRect();
      const { k, x, y } = view.current;
      const lx = (cx - r.left - x) / k, ly = (cy - r.top - y) / k;
      let best = null, bd = (14 / k) ** 2;
      data.nodes.forEach((n, i) => { const d = (n[0] - lx) ** 2 + (n[1] - ly) ** 2; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const zoomAt = (f, cx, cy) => {
      const r = stage.getBoundingClientRect();
      const v = view.current;
      const k = Math.min(12, Math.max(0.08, v.k * f));
      const px = cx - r.left, py = cy - r.top;
      v.x = px - ((px - v.x) * k) / v.k; v.y = py - ((py - v.y) * k) / v.k; v.k = k;
      request();
    };
    const pointers = new Map();
    let last = null, pinch = null, moved = 0;
    const down = e => { pointers.set(e.pointerId, e); moved = 0; if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } else last = { x: e.clientX, y: e.clientY }; };
    const move = e => {
      if (!pointers.has(e.pointerId)) { const i = pick(e.clientX, e.clientY); setHover(i); stage.style.cursor = i === null ? 'grab' : 'pointer'; return; }
      pointers.set(e.pointerId, e);
      if (pointers.size === 2 && pinch) { const [a, b] = [...pointers.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zoomAt(d / pinch, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); pinch = d; moved += 10; return; }
      if (!last) return;
      const v = view.current; v.x += e.clientX - last.x; v.y += e.clientY - last.y;
      moved += Math.abs(e.clientX - last.x) + Math.abs(e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
      if (moved > 4) { stage.classList.add('dragging'); stage.setPointerCapture?.(e.pointerId); }
      request();
    };
    const up = e => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (!pointers.size) { last = null; stage.classList.remove('dragging'); if (moved <= 4) setSelected(pick(e.clientX, e.clientY)); }
    };
    const wheel = e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); };
    stage.addEventListener('pointerdown', down); stage.addEventListener('pointermove', move); stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up); stage.addEventListener('pointerleave', () => setHover(null));
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.zoomBy = f => { const r = stage.getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2); };
    return () => { stage.removeEventListener('pointerdown', down); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerup', up); stage.removeEventListener('pointercancel', up); stage.removeEventListener('wheel', wheel); };
  }, [data, request]);

  // Keep the URL and Escape in step with the selection.
  useEffect(() => {
    if (!data) return;
    const url = new URL(window.location.href);
    if (selected === null) url.searchParams.delete('c'); else url.searchParams.set('c', data.nodes[selected][5]);
    window.history.replaceState(null, '', url);
    const onKey = e => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [data, selected]);

  const choose = i => {
    setSelected(i);
    const n = data.nodes[i], stage = stageRef.current;
    const v = view.current;
    v.k = Math.max(v.k, 0.9);
    v.x = stage.clientWidth / 2 - n[0] * v.k; v.y = stage.clientHeight / 2 - n[1] * v.k;
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!data || t.length < 2) return [];
    return data.order.filter(i => data.nodes[i][4].toLowerCase().includes(t)).slice(0, 10);
  }, [data, q]);

  const sel = data && selected !== null ? data.nodes[selected] : null;
  const hov = data && hover !== null && hover !== selected ? data.nodes[hover] : null;

  return (
    <div>
      <div className="map-tools">
        <div className="search" style={{ width: 'min(320px, 100%)' }}>
          <label htmlFor="map-q" style={{ position: 'absolute', left: -9999 }}>Find a concept on the map</label>
          <input id="map-q" type="search" role="combobox" aria-expanded={matches.length > 0} aria-controls="map-results"
            aria-activedescendant={matches[active] !== undefined ? `mr-${active}` : undefined}
            placeholder="find on the map" value={q} autoComplete="off"
            onChange={e => { setQ(e.target.value); setActive(0); }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, matches.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
              else if (e.key === 'Enter' && matches[active] !== undefined) { e.preventDefault(); choose(matches[active]); setQ(''); }
            }} />
          {matches.length > 0 && (
            <ul id="map-results" className="search-results" role="listbox" aria-label="Matches" style={{ left: 0, right: 'auto' }}>
              {matches.map((i, k) => (
                <li key={i} id={`mr-${k}`} role="option" aria-selected={k === active}>
                  <a href={`?c=${data.nodes[i][5]}`} className={`rg-${data.regions[data.nodes[i][2]].id}`} onMouseDown={e => { e.preventDefault(); choose(i); setQ(''); }}>
                    <span className="dot" aria-hidden="true" /><span><strong>{data.nodes[i][4]}</strong><small>{data.regions[data.nodes[i][2]].name} · {data.nodes[i][3]} links</small></span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {data && data.regions.map(r => (
          <button key={r.id} type="button" className={`rg-${r.id}`} aria-label={`${r.name} region`} aria-pressed={!off.has(r.id)}
            onClick={() => setOff(s => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })}>
            <span className="swatch" aria-hidden="true" style={{ marginRight: 6 }} /><span className="rname">{r.name}</span><span className="rshort" aria-hidden="true">{r.name.split(/[ &]/)[0]}</span>
          </button>
        ))}
      </div>
      <div className="map-shell">
        <div className="map-stage" ref={stageRef}>
          <canvas ref={canvasRef} aria-label="Map of developer concepts by region; use the search box or the list in the panel to choose a concept" role="img" />
          {!data && <p className="map-hint" style={{ top: 12, bottom: 'auto' }}>Loading the map…</p>}
          {hov && <p className="map-hint" style={{ top: 12, bottom: 'auto', color: '#fff' }}>{hov[4]} · {hov[3]} links</p>}
          <p className="map-hint"><span className="mouse">drag · scroll to zoom · click a dot · esc clears</span><span className="touch">tap a dot · drag · pinch to zoom</span></p>
          <div className="zoom">
            <button type="button" aria-label="Zoom in" onClick={() => stageRef.current.zoomBy(1.4)}>+</button>
            <button type="button" aria-label="Zoom out" onClick={() => stageRef.current.zoomBy(1 / 1.4)}>−</button>
            <button type="button" aria-label="Fit the whole map" onClick={() => { fit(); request(); }} style={{ fontSize: 13 }}>fit</button>
          </div>
        </div>
        <aside className="map-panel" aria-live="polite">
          {sel ? (
            <div className={`rg-${data.regions[sel[2]].id}`}>
              <p className="meta"><span className="swatch" aria-hidden="true" style={{ marginRight: 6 }} />{data.regions[sel[2]].name} · {sel[6]} graph{sel[6] > 1 ? 's' : ''}</p>
              <h2 ref={headingRef} tabIndex={-1}>{sel[4]}</h2>
              <p><Link href={`/concepts/${sel[5]}`}>Open the full page →</Link></p>
              <p className="meta">{data.adj[selected].length} links on the map</p>
              <ul>
                {[...data.adj[selected]].sort((a, b) => data.nodes[b][3] - data.nodes[a][3]).map(j => (
                  <li key={j} className={`rg-${data.regions[data.nodes[j][2]].id}`}>
                    <span className="swatch" aria-hidden="true" />
                    <button type="button" onClick={() => choose(j)}>{data.nodes[j][4]}</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h2>Pick a concept</h2>
              <p className="muted" style={{ fontSize: 14 }}>
                Each dot is a concept, coloured by region, placed near its region and pulled by its links, so shared concepts sit
                between clusters. Select one to light up its links, then step from neighbour to neighbour. Turn regions on and off above.
              </p>
              <p className="muted" style={{ fontSize: 14 }}>Or start from the most connected concept in each region:</p>
              {data && (
                <ul>
                  {data.regions.map((r, ri) => {
                    const top = data.order.filter(i => data.nodes[i][2] === ri).slice(0, 4);
                    return top.map((i, k) => (
                      <li key={i} className={`rg-${r.id}`}>
                        <span className="swatch" aria-hidden="true" />
                        <button type="button" onClick={() => choose(i)}>{data.nodes[i][4]}</button>
                        {k === 0 && <span className="meta" style={{ marginLeft: 'auto' }}>{r.name}</span>}
                      </li>
                    ));
                  })}
                </ul>
              )}
              <p className="muted" style={{ fontSize: 14 }}>Every concept is also listed on its <Link href="/graphs">graph’s page</Link>.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
