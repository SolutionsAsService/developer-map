/* Native static-data loader: bounded concurrency, verified immutable payloads, retryable failures. */
(function () {
  function create(atlas, fetcher = (...args) => fetch(...args)) {
    const pending = new Map(), cache = new Map();
    const nodes = new Map(), edges = new Map(), documents = new Map();
    let active = 0;
    const queue = [];
    function schedule(work) {
      return new Promise((resolve, reject) => {
        queue.push({ work, resolve, reject }); drain();
      });
    }
    function drain() {
      while (active < 3 && queue.length) {
        const job = queue.shift(); active++;
        Promise.resolve().then(job.work).then(job.resolve, job.reject).finally(() => { active--; drain(); });
      }
    }
    function verified(ref) {
      if (!ref || !/^details[/][a-z0-9-]+[.]json$/.test(ref.file) || !/^[a-f0-9]{64}$/.test(ref.sha256) || ref.bytes > 2 * 1024 * 1024) return Promise.reject(new Error('Invalid detail manifest. Reload to get the current map.'));
      if (cache.has(ref.file)) return Promise.resolve(cache.get(ref.file));
      if (pending.has(ref.file)) return pending.get(ref.file);
      const promise = schedule(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetcher('./data/' + ref.file, { signal: controller.signal, cache: 'no-cache' });
          if (!response.ok) throw new Error('Detail request failed (HTTP ' + response.status + ').');
          const text = await response.text();
          const bytes = new TextEncoder().encode(text);
          if (!bytes.length) throw new Error('The server returned an empty detail file.');
          if (bytes.length !== ref.bytes) throw new Error('Detail file is incomplete or from a different build.');
          const digest = await crypto.subtle.digest('SHA-256', bytes);
          const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
          if (actual !== ref.sha256) throw new Error('Detail version check failed. Reload the map if retry does not help.');
          let value;
          try { value = JSON.parse(text); } catch { throw new Error('The server returned malformed detail JSON.'); }
          if (value.schemaVersion !== 1) throw new Error('Unsupported detail version. Reload the map.');
          cache.set(ref.file, value);
          // Limit raw shard cache; extracted records needed by active entries remain indexed.
          if (cache.size > 32) cache.delete(cache.keys().next().value);
          return value;
        } finally { clearTimeout(timeout); }
      });
      pending.set(ref.file, promise);
      promise.then(() => pending.delete(ref.file), () => pending.delete(ref.file));
      return promise;
    }
    async function manifest() {
      const value = await verified(atlas.details);
      if (!value.nodes || !value.edges || !value.documents || !value.shards || !Array.isArray(value.paths)) throw new Error('Incomplete detail manifest.');
      return value;
    }
    async function shard(m, key, kind) {
      const ref = m.shards[key];
      if (!ref || ref.bytes > 192 * 1024) throw new Error('Missing or oversized detail shard.');
      const data = await verified(ref);
      if (data.kind !== kind || !Array.isArray(data.records)) throw new Error('Unexpected detail shard contents.');
      const index = { nodes, edges, documents }[kind];
      if (index) for (const item of data.records) index.set(kind === 'documents' ? item.file : item.id, item);
      return data.records;
    }
    async function concept(id, incident) {
      const m = await manifest();
      await shard(m, m.nodes[id], 'nodes');
      const node = nodes.get(id);
      if (!node || !Array.isArray(node.variants)) throw new Error('Selected record is missing from its shard.');
      const edgeKeys = [...new Set(incident.map(e => m.edges[e.id]))];
      const docKeys = [...new Set(node.variants.map(v => m.documents[v.document]))];
      await Promise.all([...edgeKeys.map(key => shard(m,key,'edges')), ...docKeys.map(key => shard(m,key,'documents'))]);
      const relations = incident.map(e => edges.get(e.id));
      if (relations.some((edge,i) => !edge || edge.source !== incident[i].source || edge.target !== incident[i].target || edge.relation !== incident[i].relation)) throw new Error('Relationship index mismatch. Reload the current map.');
      if (node.variants.some(v => !documents.has(v.document))) throw new Error('Source context is incomplete.');
      return { node, edges: relations, documents: node.variants.map(v => documents.get(v.document)) };
    }
    async function paths() {
      const m = await manifest();
      return (await Promise.all(m.paths.map(key => shard(m,key,'paths')))).flat();
    }
    return { concept, paths };
  }
  window.DeveloperDetails = { create };
})();
