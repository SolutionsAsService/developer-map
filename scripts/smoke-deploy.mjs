import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Read-only smoke test. Explicit URL may include a static-host subdirectory.
const root = fileURLToPath(new URL('../', import.meta.url));
const base = new URL(process.argv[2] || 'http://localhost:4173/');
if (!base.pathname.endsWith('/')) base.pathname += '/';
assert.ok(['https:', 'http:'].includes(base.protocol), 'HTTP(S) URL required');
const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
assert.ok(base.protocol === 'https:' || local, 'Public deployments need HTTPS for evidence SHA-256');
const exact = process.argv.includes('--exact');
let checked = 0;
async function get(file, type) {
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(new URL(file, base), {signal:AbortSignal.timeout(20000)});
    if (response.status !== 429) break;
    const retry = response.headers.get('retry-after');
    const delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : retry ? Date.parse(retry) - Date.now() : 10000;
    await response.body?.cancel();
    // Do not retry early or wait indefinitely on a host's quota.
    assert.ok(Number.isFinite(delay) && delay <= 60000, file + ': host rate limit; retry later');
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, Math.max(1000, delay)));
  }
  assert.equal(response.status, 200, file + ': HTTP status');
  assert.ok((response.headers.get('content-type') || '').includes(type), file + ': content type');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length, file + ': empty response');
  if (exact) assert.deepEqual(bytes, await readFile(path.join(root, file)), file + ': differs from checkout');
  checked++;
  return bytes;
}
function decode(bytes) { return JSON.parse(bytes.toString('utf8')); }
function verify(bytes, ref) {
  assert.equal(bytes.length, ref.bytes, ref.file + ': byte count');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), ref.sha256, ref.file + ': SHA-256');
}
const html = (await get('index.html', 'text/html')).toString('utf8');
for (const match of html.matchAll(/(?:src|href)="\.\/(src\/[^"?#]+)"/g)) {
  await get(match[1], match[1].endsWith('.css') ? 'text/css' : 'javascript');
}
const overview = decode(await get('data/overview.json', 'application/json'));
assert.ok(overview.nodes.length && overview.edges.length && overview.documents.length);
const manifestBytes = await get('data/' + overview.details.file, 'application/json');
verify(manifestBytes, overview.details);
const manifest = decode(manifestBytes);
// Bounded requests, including every shard: a healthy homepage alone is not deploy proof.
const refs = Object.values(manifest.shards);
const pause = () => local ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, 1500));
for (let i = 0; i < refs.length; i += 3) {
  await pause();
  await Promise.all(refs.slice(i, i + 3).map(async ref => {
    const bytes = await get('data/' + ref.file, 'application/json');
    verify(bytes, ref);
    assert.ok(ref.bytes <= 192 * 1024, ref.file + ': shard cap');
    assert.equal(decode(bytes).schemaVersion, 1);
  }));
}
for (let i = 0; i < overview.documents.length; i += 3) {
  await pause();
  await Promise.all(overview.documents.slice(i,i+3).map(async doc => {
    const bytes = await get('data/' + doc.file, 'application/json');
    assert.ok(decode(bytes), doc.file + ': source JSON must parse');
  }));
}
console.log(JSON.stringify({base:base.href, exact, resources:checked, sources:overview.documents.length,
  concepts:overview.nodes.length, relationships:overview.edges.length, shards:refs.length,
  result:'PASS: HTTP, MIME, complete evidence hashes' }, null, 2));
