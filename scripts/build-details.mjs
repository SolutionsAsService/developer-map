import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const MAX_SHARD_BYTES = 192 * 1024;
const hash = text => createHash('sha256').update(text).digest('hex');
// Existing native fetch + static JSON suffice; no new framework or service.
// Content addresses bind each payload to the overview that requested it.
// A record too large for one shard (for example a concept merged from many
// files) is shortened step by step; the full record stays in atlas.json.
function compact(record) {
  const fits = item => Buffer.byteLength(JSON.stringify({ schemaVersion: 1, kind: 'x', records: [item] })) <= MAX_SHARD_BYTES - 64;
  const note = 'Shortened to fit a detail shard; the full record is in data/atlas.json.';
  if (Array.isArray(record.variants)) {
    let item = { ...record, truncated: note, variants: record.variants.map(variant => ({ ...variant, related: (variant.related || []).map(({ record, ...rest }) => rest) })) };
    if (fits(item)) return item;
    item = { ...item, variants: item.variants.map(({ related, ...variant }) => ({ ...variant, related: [] })) };
    if (fits(item)) return item;
    item = { ...item, variants: item.variants.map(({ record, ...variant }) => variant) };
    if (fits(item)) return item;
  }
  for (const drop of [['record'], ['record', 'metadata'], ['record', 'metadata', 'fields']]) {
    const item = { ...record, truncated: note };
    for (const key of drop) delete item[key];
    if (fits(item)) return item;
  }
  return { id: record.id, file: record.file, label: record.label, truncated: note };
}

export function detailArtifacts(atlas) {
  const files = new Map();
  const manifest = { schemaVersion: 1, maxShardBytes: MAX_SHARD_BYTES, nodes: {}, edges: {}, documents: {}, paths: [] };
  function emit(kind, records) {
    // Split batches until every shard stays within the byte cap.
    const text = JSON.stringify({ schemaVersion: 1, kind, records });
    const bytes = Buffer.byteLength(text);
    if (bytes > MAX_SHARD_BYTES) {
      if (records.length < 2) return emit(kind, [compact(records[0])]);
      const middle = Math.floor(records.length / 2);
      emit(kind, records.slice(0, middle));
      emit(kind, records.slice(middle));
      return;
    }
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
