import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('SVG favicon is self-contained and included in the static site', async () => {
  const page = new JSDOM(await read('index.html'));
  const icon = page.window.document.querySelector('link[rel="icon"]');
  assert.equal(icon?.getAttribute('type'), 'image/svg+xml');
  assert.equal(icon?.getAttribute('href'), './favicon.svg');
  const svg = new JSDOM(await read('favicon.svg'), { contentType: 'image/svg+xml' });
  assert.equal(svg.window.document.documentElement.getAttribute('viewBox'), '0 0 32 32');
  assert.equal(svg.window.document.querySelectorAll('circle').length, 3);
  assert.equal(svg.window.document.querySelector('script, foreignObject, image, use, [href]'), null);
  const manifest = JSON.parse(await read('docs/integration-manifest.json'));
  assert.ok(manifest.artifacts.U.includes('favicon.svg'));
  page.window.close();
  svg.window.close();
});

test('learning path hint names the explicit load action', async () => {
  const app = await read('src/app.js');
  const page = new JSDOM(await read('index.html'));
  assert.ok(app.includes('Learning paths load when you choose “Show all paths”.'));
  assert.match(page.window.document.querySelector('#routes-more').textContent, /Show all paths/);
  page.window.close();
});
