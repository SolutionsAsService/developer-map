// Static hosts that expect a build output folder (Vercel uses public/) get
// exactly the files the site serves. The generated map data is committed and
// kept current by the Rebuild map workflow, so no rebuild is needed here.
import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, process.argv[2] || 'public');
const copy = file => cp(path.join(root, file), path.join(out, file), { recursive: true });

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'data', 'details'), { recursive: true });
for (const file of ['index.html', 'favicon.svg', 'src']) await copy(file);
// Source files, atlas.json and overview.json.
for (const file of (await readdir(path.join(root, 'data'))).filter(file => file.endsWith('.json'))) await copy('data/' + file);
// data/details keeps every older content-addressed shard in git; a deploy only
// needs the manifest the current overview points to and the shards it lists.
const overview = JSON.parse(await readFile(path.join(root, 'data', 'overview.json')));
const manifest = JSON.parse(await readFile(path.join(root, 'data', overview.details.file)));
const shards = [overview.details.file, ...Object.values(manifest.shards).map(ref => ref.file)];
for (const file of shards) await copy('data/' + file);
console.log(`Wrote ${path.relative(root, out)}/ with ${shards.length} current detail files`);
