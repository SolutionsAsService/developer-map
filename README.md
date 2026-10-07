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

The four original JSON files remain in `data/`. `scripts/build-atlas.mjs` imports their nodes, source claims, original relationships and learning paths into `data/atlas.json`, and stores the full record behind every point and link. Explicit source-qualified identities and conservative matching unify reviewed equivalent concepts. Claims, references, source documents, and conflicting scopes retain separate identities. Eight reviewed alias groups unify equivalent concepts (including K8s/Kubernetes), while ambiguous meanings such as Docker Host/VM Host and Linux/Kubernetes namespaces remain distinct. Five documented editorial semantic links make core relationships explicit, including Docker → Container. Each is marked editorial and includes primary-source evidence; the UI never presents it as an original source edge. See [the complete data audit](docs/DATA-AUDIT.md).

The relation legend groups many source verbs into **reading aids**, not formal ontologies. An arrow reflects source/target direction, **not** necessarily causation, dependency, or chronological order. Open a link to read its exact source verb, semantic description, claim evidence (when supplied) and original fields. Source line references are authors' metadata, not independently verified citations.

The explorer uses a precomputed D3 layout; it draws the complete graph on Canvas, keeps all nodes visible when filtering/focusing, and provides search, pan/zoom, an accessible text index and full source downloads. No telemetry, sign-in or external API is used; system fonts keep the interface self-contained without external font requests.

## Validate

`npm test` checks the import invariants, original records, ID scoping, source/bridge distinction, and the map controls. `npm run build` fails on dangling links or missing learning-path steps.

## Developer workbench

- Graph-first dark instrument palette, monospace identifiers, live relationship query, and separate inspector pane.
- Select a query row to emphasize its exact edge and show the same subject, predicate, target and provenance in the inspector. Toggle **Active edge / Neighborhood** for context.
- **/** focuses search; **Escape** clears selection. Exact labels rank ahead of text mentions. Native buttons, text index and relationship list provide canvas-free navigation.
- **Inspect this relationship** moves keyboard focus to the exact relationship record, with clickable primary-source evidence for editorial additions.
- Old IDs redirect using the generated alias map. Ambiguous Host links ask which scoped concept you intended instead of guessing.
- The map preserves disconnected records rather than inventing edges: 228 weakly connected components and 213 zero-degree records remain. Details, not a false completeness claim, are in the audit.

## Design and verification

[DADA design log](DESIGN-LOG.md), [anchor frontier](docs/design-frontier.md), and [QA report](docs/QA.md) record decisions, critiques, limitations and verification. The design uses Adaptive mode: developer-native character with readable relationships and provenance.
