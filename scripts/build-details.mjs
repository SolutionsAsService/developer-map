import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const MAX_SHARD_BYTES = 192 * 1024;
const hash = text => createHash('sha256').update(text).digest('hex');
// Existing native fetch + static JSON suffice; no new framework or service.
// Content addresses bind each payload to the overview that requested it.
export function detailArtifacts(atlas) {
  const files = new Map();
  const manifest = { schemaVersion: 1, maxShardBytes: MAX_SHARD_BYTES, nodes: {}, edges: {}, documents: {}, paths: [] };
  function emit(kind, records) {
    const text = JSON.stringify({ schemaVersion: 1, kind, records });
    const bytes = Buffer.byteLength(text);
    if (bytes > MAX_SHARD_BYTES) throw new Error('Oversized detail record: ' + kind);
    const sha256 = hash(text), file = 'details/' + sha256 + '.json';
    const key = Object.keys(refs).length.toString(36);
    files.set(file, text);
    const ref = { file, sha256, bytes };
    for (const item of records) {
      if (kind === 'paths') continue;
      manifest[kind][kind === 'documents' ? item.file : item.id] = key;
    }
    if (kind === 'paths') manifest.paths.push(key);
    refs[key] = ref;
    return ref;
  }
  const refs = {};
  for (const kind of ['nodes', 'edges', 'documents', 'paths']) {
    let batch = [], size = 100;
    for (const item of [...atlas[kind]].sort((a,b) => String(a.id || a.file).localeCompare(String(b.id || b.file), 'en'))) {
      const bytes = Buffer.byteLength(JSON.stringify(item)) + 1;
      if (batch.length && size + bytes > MAX_SHARD_BYTES) { emit(kind, batch); batch = []; size = 100; }
      batch.push(item); size += bytes;
    }
    if (batch.length) { emit(kind, batch); }
  }
  manifest.shards = refs;
  const text = JSON.stringify(manifest), sha256 = hash(text), file = 'details/manifest-' + sha256 + '.json';
  files.set(file, text);
  return { files, manifest, reference: { file, sha256, bytes: Buffer.byteLength(text), schemaVersion: 1 } };
}
export async function writeDetails(atlas, directory) {
  const result = detailArtifacts(atlas);
  await mkdir(path.join(directory, 'details'), { recursive: true });
  // Retain older content-addressed files: cached overview pages remain usable.
  for (const [file, text] of result.files) await writeFile(path.join(directory, file), text);
  return result.reference;
}
