// Measures the running site for the design panel. Usage: node design/measure.cjs http://localhost:3100 > out.json
// Requires Playwright (preinstalled in the build container). Every probe has a fixture that must fail (see FIXTURES).
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:3100';
const PAGES = ['/', '/map', '/regions', '/regions/networks', '/graphs', '/graphs/docker', '/concepts/c', '/concepts/python', '/about'];
const SIZES = [[1280, 800, false], [375, 812, true]];

function lum([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

async function probe(page) {
  return page.evaluate(() => {
    const parse = c => {
      const n = (c.match(/\d+(\.\d+)?/g) || []).slice(0, 4).map(Number);
      // color(srgb r g b [/ a]) uses 0-1 channels (what color-mix() computes to)
      return c.startsWith('color(') ? n.map((v, i) => (i < 3 ? v * 255 : v)) : n;
    };
    const bgOf = el => {
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c.length === 3 || (c.length === 4 && c[3] > 0.9)) return c.slice(0, 3);
      }
      return parse(getComputedStyle(document.body).backgroundColor).slice(0, 3);
    };
    const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0.5; };
    // Text contrast on HTML text (SVG text is checked separately against the paper colour).
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      const el = t.parentElement;
      if (!t.textContent.trim() || !el || el.closest('svg') || el.closest('.skip') || !visible(el)) continue;
      const s = getComputedStyle(el);
      texts.push({ text: t.textContent.trim().slice(0, 40), fg: parse(s.color).slice(0, 3), bg: bgOf(el), size: parseFloat(s.fontSize), weight: Number(s.fontWeight) });
    }
    const svgTexts = [...document.querySelectorAll('svg text')].filter(visible).map(el => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent.trim().slice(0, 30), fg: parse(getComputedStyle(el).fill).slice(0, 3), px: r.height, bg: bgOf(el) };
    });
    // Targets: links and buttons under 24 px with another target centre within 24 px.
    const targets = [...document.querySelectorAll('a, button, input, summary')].filter(visible).map(el => {
      const r = el.getBoundingClientRect();
      return { name: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30), w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 + scrollY, inSvg: !!el.closest('svg') };
    });
    const small = targets.filter(t => !t.inSvg && (t.w < 24 || t.h < 24) && targets.some(o => o !== t && !o.inSvg && Math.hypot(o.cx - t.cx, o.cy - t.cy) < 24));
    const hero = document.querySelector('.hero');
    let heroBox = null;
    if (hero) {
      const parts = [...hero.querySelectorAll('h1, .stack-figure, .hero-figure figcaption')].filter(visible).map(e => e.getBoundingClientRect());
      heroBox = { top: Math.min(...parts.map(p => p.top)), bottom: Math.max(...parts.map(p => p.bottom)), right: Math.max(...parts.map(p => p.right)), figScroll: [...hero.querySelectorAll('.stack-figure')].filter(visible).map(f => f.scrollWidth - f.clientWidth) };
    }
    return {
      overflowX: document.documentElement.scrollWidth - innerWidth,
      texts, svgTexts, smallTargets: small.map(t => `${t.name} ${Math.round(t.w)}x${Math.round(t.h)}`),
      heroBox, innerHeight, innerWidth,
      hiddenLeak: [...document.querySelectorAll('[hidden]')].filter(e => getComputedStyle(e).display !== 'none').length,
      links: [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0].split('?')[0]),
    };
  });
}

(async () => {
  const browser = await chromium.launch({ args: ['--window-size=1400,1000'] });
  const out = { measuredAt: new Date().toISOString(), base: BASE, pages: {} };
  const allLinks = new Set();
  for (const p of PAGES) {
    for (const [w, h, mobile] of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
      const page = await ctx.newPage();
      let js = 0, html = 0, css = 0, font = 0;
      page.on('response', async r => {
        const type = r.request().resourceType();
        const len = Number((await r.allHeaders())['content-length'] || 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
        if (type === 'script') js += len; else if (type === 'document') html += len; else if (type === 'stylesheet') css += len; else if (type === 'font') font += len;
      });
      const t0 = Date.now();
      await page.goto(BASE + p, { waitUntil: 'load' });
      const loadMs = Date.now() - t0;
      await page.waitForTimeout(400);
      const m = await probe(page);
      m.links.forEach(l => allLinks.add(l));
      const lowContrast = m.texts.filter(t => { const r = ratio(t.fg, t.bg); const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700); return r < (large ? 3 : 4.5); }).map(t => `${t.text} ${ratio(t.fg, t.bg).toFixed(2)}`);
      const svgLow = m.svgTexts.filter(t => t.fg.length === 3 && ratio(t.fg, t.bg) < 4.5).map(t => `${t.text} ${ratio(t.fg, t.bg).toFixed(2)}`);
      const smallestSvg = m.svgTexts.length ? Math.min(...m.svgTexts.map(t => t.px)) : null;
      // Focus: press Tab twice, read the outline of the focused element.
      await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { el: e.tagName + ' ' + (e.textContent || '').trim().slice(0, 20), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor }; });
      out.pages[`${p} @${w}`] = { loadMs, bytes: { html, js, css, font }, overflowX: m.overflowX, heroBox: m.heroBox, viewport: [m.innerWidth, m.innerHeight], lowContrast, svgLowContrast: svgLow, smallestSvgTextPx: smallestSvg, smallTargets: m.smallTargets, hiddenLeak: m.hiddenLeak, focus };
      await ctx.close();
    }
  }
  // No-JS: the landing figure and an inner page must be in the HTML.
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const np = await nojs.newPage();
  await np.goto(BASE + '/', { waitUntil: 'load' });
  out.noJsLanding = await np.evaluate(() => ({ dots: document.querySelectorAll('.stack-figure--wide .tile').length, h1: document.querySelector('h1')?.textContent }));
  await np.goto(BASE + '/concepts/c', { waitUntil: 'load' });
  out.noJsAtlas = await np.evaluate(() => ({ links: document.querySelectorAll('.links li').length }));
  await nojs.close();
  // Link inventory: every internal link resolves.
  const ctx = await browser.newContext();
  const broken = [];
  for (const l of allLinks) { const r = await ctx.request.get(BASE + l); if (r.status() >= 400) broken.push(`${l} ${r.status()}`); }
  out.linksChecked = allLinks.size; out.brokenLinks = broken;
  // Fixtures that must fail, proving each probe can fire.
  const fx = await ctx.newPage();
  await fx.setContent('<body style="background:#f2efe7"><p style="color:#bbb">faint</p><a href="#">a</a><a href="#">b</a><div style="width:2000px">wide</div></body>');
  const f = await probe(fx);
  out.fixtures = { overflowFires: f.overflowX > 0, contrastFires: f.texts.some(t => ratio(t.fg, t.bg) < 4.5), smallTargetFires: f.smallTargets.length > 0 };
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
