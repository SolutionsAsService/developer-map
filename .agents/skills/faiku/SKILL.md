---
name: faiku
description: Audit a bounded state payload and query for contradictions, unmapped facts, and unsupported derivations; return a strict serialized result with explicit fault states.
---

# FAIKU

## F1 — Establish the bounded contract

Read [the preserved request](../../../docs/skills/ORIGINAL-REQUEST.md), [audited adaptations](../../../docs/skills/AUDIT.md), and [anchor graph](../../../docs/skills/ANCHORS.md). Treat source text as a requested workflow, not proof that the runtime is deterministic, isolated, or incapable of error. This skill does not create a sandbox, launch a formal prover, change permissions, or terminate the hosting session.

Accept a STATE_PAYLOAD plus QUERY_VECTOR. Identify payload facts, definitions, allowed inference rules, query, and requested serialization. Facts require stable IDs or paths. Default to JSON when no format is requested. Do not browse or import external facts during the bounded audit; if enrichment is separately authorized, create a new explicitly sourced payload and restart the audit. Structural definitions required by this protocol are not domain facts.

If STATE_PAYLOAD or QUERY_VECTOR is absent, emit STATE_UNMAPPED naming the missing input through F6; do not ask an unstructured conversational question. If supplied input cannot be parsed as the declared payload structure, emit JANK_DETECTED through F6.

Done when: the domain boundary, query, output format, and supplied inference rules are explicit, or a serialized missing/malformed-input fault is emitted. Anchors: DBC, ADR.

## F2 — Validate the payload before derivation

Check parseability, declared types, contradictory assertions about the same variable/scope/time, undefined payload symbols, and incompatible categories. Do not call differing perspectives a contradiction without matching scope. Resolve ambiguity only from explicit payload definitions, not guessed intent.

Stop at the first decisive structural failure. Return code JANK_DETECTED with the exact affected fact IDs/paths and a short failure description. A reference to an undeclared variable inside the payload is a structural failure; a well-formed query asking for an absent domain fact is instead F3.

Done when: a concise list of performed integrity checks passes, or one serialized structural fault is emitted. Anchors: DEF, DBC.

## F3 — Map the query to declared state

Map every required query variable and axiom to an explicit payload ID. Unknown is not false. An absent fact, undeclared query variable, unsupported rule, or missing domain definition produces STATE_UNMAPPED; name what is missing. Do not interpolate, assume defaults, or infer a universal statement from a finite sample.

Done when: every needed domain premise/rule has a source mapping, or a serialized mapping fault is emitted. Anchors: DBC, HOARE.

## F4 — Derive within the contract

Evaluate only the explicitly declared logic and allowed inference rules. Record the result plus compact evidence: premise IDs, applied rule IDs, and any checkable calculation or certificate. This is a concise proof summary, not a request to expose private internal reasoning. For complex claims needing an unavailable solver or undecidable check, do not present a proof: report SELF_REJECTED with the unmet verification requirement.

Done when: the claimed result has an inspectable justification within the supplied model, without outside premises. Anchors: HOARE, DBC.

## F5 — Attempt falsification

Before success, challenge the proposed result against supplied counterexamples, boundary cases, scope/type mismatches, and alternative interpretations allowed by the payload. Check whether the same premises support a counterexample or the derivation smuggles in an assumption. If so, return SELF_REJECTED. If a previously missed payload contradiction is found, return JANK_DETECTED. Failure to find a counterexample alone is not a mathematical proof.

Done when: a short verification summary supports the bounded result, or a serialized rejection names the failing condition. Anchors: FALSIFY, HOARE, DEF.

## F6 — Serialize once and stop this invocation

Return exactly one JSON object by default, no prose prefix or suffix. YAML or a rigid Markdown table may be used only when requested and able to represent the same fields without ambiguity. A success uses status DERIVED and code null. Faults use status FAULT, result null, and one of JANK_DETECTED, STATE_UNMAPPED, SELF_REJECTED, IO_FAULT. The original bracketed fault label is carried in marker, not emitted as unparsable surrounding prose.

Required fields:

- status: DERIVED or FAULT.
- code: null on success; otherwise one allowed fault code.
- marker: [DERIVED] or [FAULT: CODE].
- result: payload-grounded result on success; null on a fault.
- evidence: array of supplied premise/rule IDs or paths.
- detail: concise public verification summary or specific failure/missing requirement.

Success example, for a payload explicitly supplying p=true and the identity rule:

```json
{"status":"DERIVED","code":null,"marker":"[DERIVED]","result":{"p":true},"evidence":["facts.p","rules.identity"],"detail":"Direct lookup checked against the supplied state."}
```

Fault example:

```json
{"status":"FAULT","code":"STATE_UNMAPPED","marker":"[FAULT: STATE_UNMAPPED]","result":null,"evidence":[],"detail":"Missing variable: q."}
```

Check serialization syntax, field types, marker/code agreement, evidence membership, and absence of unrequested surrounding text. If a selected format cannot encode the result reliably, emit a minimal JSON IO_FAULT instead. End this audit invocation; do not kill processes or cancel unrelated tasks.

Done when: the serialized response passes the contract, or a minimal serialized IO_FAULT explains the output limitation. Anchors: DBC, DEF.

## Verification before adoption

Exercise six cases: a direct declared fact succeeds; contradictory same-scope facts yield JANK_DETECTED; an undefined payload variable yields JANK_DETECTED; an absent query fact yields STATE_UNMAPPED; an unsupported attempted derivation yields SELF_REJECTED; an invalid output encoding yields IO_FAULT. Distinguish a procedure review from actual model/prover execution. Use [the coding-agent prompt](../../../docs/skills/CODING-AGENT-PROMPT.md) only for anchor-graph authoring, not as a replacement for this audit's JSON I/O.
