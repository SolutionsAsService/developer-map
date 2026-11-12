// Copies the original source graphs into public/sources so each graph page can offer a
// byte-exact download. Generated files (atlas.json, overview.json) are not copied.
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isSourceFile } from './normalize-source.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'sources');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const files = (await readdir(path.join(root, 'data'), { withFileTypes: true })).filter(f => f.isFile() && isSourceFile(f.name)).map(f => f.name);
for (const f of files) await cp(path.join(root, 'data', f), path.join(out, f));
console.log(`Copied ${files.length} source graphs to public/sources`);
