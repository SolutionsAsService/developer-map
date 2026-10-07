# Developer Map

A static, open-access explorer connecting four infrastructure knowledge graphs: **virtual machines**, **containerization**, **Docker**, and **Kubernetes**. Select any point to highlight its direct neighbors, follow a source learning path, search definitions and claims, or inspect the full original records in the field guide. No login or backend is required.

## Run

```sh
npm ci
npm run build
npm test
npm run dev
```

Open `http://localhost:4173`. Set `PORT` to use another port. To deploy, publish the repository root as a static site (no framework build step required when `data/atlas.json` is committed). Regenerate the atlas with `npm run build` after updating any source JSON. The server is for local development only.

## Provenance and scope

The four original JSON files remain in `data/`. `scripts/build-atlas.mjs` imports their nodes, source claims, original relationships and learning paths into `data/atlas.json`, and stores the full record behind every point and link. Concepts with matching IDs **and** labels can be unified across files, but `claim_*` and `ref_*` IDs and reused IDs with different labels stay scoped to their original graph. A single curated `k8s` ↔ `kubernetes` bridge is explicitly marked as editorial and has no source-level citation. The UI never presents it as an original source edge.

The relation legend groups many source verbs into **reading aids**, not formal ontologies. An arrow reflects source/target direction, **not** necessarily causation, dependency, or chronological order. Open a link to read its exact source verb, semantic description, claim evidence (when supplied) and original fields. Source line references are authors' metadata, not independently verified citations.

The explorer uses a precomputed D3 layout; it draws the complete graph on Canvas, keeps all nodes visible when filtering/focusing, and provides search, pan/zoom, an accessible text index and full source downloads. No telemetry, sign-in or external API is used; Google Fonts are optional and have local fallbacks.

## Validate

`npm test` checks the import invariants, original records, ID scoping, source/bridge distinction, and the map controls. `npm run build` fails on dangling links or missing learning-path steps.
