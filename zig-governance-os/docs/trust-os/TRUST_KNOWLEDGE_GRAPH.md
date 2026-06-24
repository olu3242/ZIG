# Trust Knowledge Graph

> Batch 5. This document explicitly **extends** `docs/convergence/governance-graph.md` and
> `docs/convergence/knowledge-graph.md` rather than replacing them. Per Batch 1, the only
> code implementing a graph today is `packages/knowledge-graph/src/index.ts:1-12` (a
> 12-line type sketch with no persistence) — the *design* of the graph is already mature in
> `docs/convergence/`; this doc adds the Trust Score node and the AI branch that design did
> not yet cover, and reconciles graph vocabulary with the Universal Governance Model in
> `CLAUDE.md`.

## Relationship to the existing Governance Graph

`docs/convergence/governance-graph.md:9-29` already defines these nodes: Tenant, Project,
Framework, Control, Asset, Risk, Evidence, Task, Assessment, Audit, Learning, Scenario,
Governance Score, Recommendation — with the required spine:

```text
Tenant -> Project -> Asset -> Risk -> Control -> Framework -> Evidence -> Task
```

and the extended convergence paths:

```text
Evidence -> Audit -> Finding -> Task
Risk -> Control -> Evidence -> Assessment -> Audit Readiness
Framework -> Control -> Evidence -> Certification Readiness
```

This is, functionally, the same model as the Universal Governance Model in CLAUDE.md
(`Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence →
Task → Report`) using slightly different node names (Tenant instead of Organization,
Framework instead of Framework Requirement). Trust OS adopts the Governance Graph's
vocabulary exactly, rather than introducing a third synonym set.

## What the Governance Graph spec is missing today

Reading `docs/convergence/governance-graph.md` and `docs/convergence/knowledge-graph.md` in
full, two things relevant to Trust OS are absent:

1. No **Trust Score** node distinct from Governance Score — because Trust Score did not
   exist as a concept when those docs were written.
2. No **AI Asset / AI Risk / AI Control / AI Decision** branch — AI governance is
   referenced only as "AI-generated recommendations and human approval decisions" under
   Knowledge Sources (`docs/convergence/knowledge-graph.md:21`), not as governed entities in
   their own right.

This document fills exactly those two gaps and nothing else.

## Extended node list

All nodes from `docs/convergence/governance-graph.md:9-29` remain unchanged. Trust OS adds:

| New node | Job |
|---|---|
| Vendor | Third-party entity assessed via questionnaire and risk rating — already a table (`vendors`, `supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`), promoted here to a first-class graph node alongside Asset |
| Questionnaire | A structured set of incoming trust/security questions about the tenant, answered from graph evidence |
| Trust Score | Explainable metric extending Governance Score with Vendor and AI Governance dimensions (see `TRUST_SCORE_MODEL.md`) — a sibling node to Governance Score, not a replacement |
| Certification (compliance sense) | External attestation record, reusing the existing `certifications` table with a `certification_type` discriminator (`TRUST_OS_OPERATING_MODEL.md`, stage 6) |
| AI Asset | A governed AI system, model, or agent exposed to or operating on behalf of the organization |
| AI Risk | A risk specific to an AI Asset (e.g. model drift, hallucination, data leakage, bias) |
| AI Control | A control mitigating an AI Risk (e.g. human-in-the-loop review, output filtering, model monitoring) |
| AI Decision | A logged decision made or materially influenced by an AI Asset, carrying the same explainability payload required of every Zig AI output (`CLAUDE.md:122-125`) |

## Extended spine

The Universal Governance Model spine is unchanged. Trust OS adds a parallel branch:

```text
Tenant -> Project -> Asset -> Risk -> Control -> Framework -> Evidence -> Task   [existing]

Tenant -> Project -> Vendor -> Questionnaire -> Evidence -> Trust Score          [Trust OS]
Framework -> Control -> Evidence -> Certification (compliance) -> Trust Score    [Trust OS]

Project -> AI Asset -> AI Risk -> AI Control -> AI Evidence -> AI Trust Score    [future, sketched below]
```

The AI branch mirrors the existing Asset → Risk → Control → Evidence spine exactly,
node-for-node, by design — an AI Asset is governed the same way any other asset is, with
"AI" as a typed specialization rather than a parallel ontology. This is consistent with
CLAUDE.md's rule that frameworks (and, by extension, AI governance) must attach as metadata
to the existing model rather than create a separate hardcoded path
(`CLAUDE.md:107-109`).

### AI branch detail (future — sketch only, not built in this batch)

| Stage | Mirrors | Notes |
|---|---|---|
| AI Asset | Asset | Registered model, agent, or AI-powered feature; criticality and data sensitivity tagged the same way Asset criticality is today |
| AI Risk | Risk | Drift, bias, hallucination, prompt injection, data leakage — typed risk categories specific to AI, attached to an AI Asset the same way a Risk attaches to an Asset |
| AI Control | Control | Human-in-the-loop review, output filtering, model evaluation cadence, red-teaming — modeled directly on the existing governed-agent pattern already proven for Zig's own internal agents (`governed_agents`, `agent_certifications`, `supabase/migrations/202606180009_agent_governance_os.sql:55-94`) |
| AI Evidence | Evidence | Model card, evaluation report, audit log export — reuses `EvidenceService` rather than a new AI-evidence service |
| AI Trust Score | Trust Score | A dimension of the overall Trust Score (see `TRUST_SCORE_MODEL.md`'s AI Governance weight), not a fourth competing score |

## Invariants (inherited unchanged from `docs/convergence/governance-graph.md:47-54`)

- Every new node (Vendor, Questionnaire, Trust Score, Certification, AI Asset, AI Risk, AI
  Control, AI Decision) is tenant-scoped.
- No Trust OS feature may create an orphan record — a Questionnaire must trace to a Vendor
  and to the Evidence used to answer it; an AI Decision must trace to an AI Asset.
- Every AI-generated questionnaire answer or AI governance recommendation must include
  reason, confidence, supporting data, and framework references where applicable — the same
  contract already required graph-wide.
- Trust Score must be explainable from graph inputs, never manually entered — the same rule
  already stated for Governance Score (`docs/convergence/governance-graph.md:54`).

## Acceptance criteria (extends `docs/convergence/governance-graph.md:69-75`)

- A user can inspect a Vendor and see its Questionnaire history and the Evidence used to
  answer each question.
- A user can inspect an AI Asset (once built) and see its upstream AI Risks, AI Controls,
  and AI Evidence the same way they inspect an Asset today.
- Trust Score can be decomposed into the same explainable per-dimension breakdown
  Governance Score already supports, plus the two new dimensions.
- The Trust Center can render entirely from graph queries, with no separate "trust" data
  store.
