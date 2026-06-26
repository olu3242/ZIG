# Trust OS Roadmap

> Batch 10. Prioritized sequence per the task brief: 1. Questionnaire Agent, 2. Trust
> Knowledge Graph, 3. Trust Center, 4. Evidence Intelligence, 5. AI Governance, 6. Trust
> Intelligence. Each phase states its real dependency on the existing codebase (per Batches
> 1-9) and what becomes possible only after it ships.

## Phase 1 — Questionnaire Agent

- **Depends on (existing, reused)**: `vendors` table, `EvidenceService`, `ControlService`,
  the AI Command Center explainability pattern (`CLAUDE.md:122-125`).
- **Builds (net-new, per `TRUST_OS_DATA_MODEL.md`)**: `questionnaires`, `questions`,
  `responses` tables; `QuestionnaireService` and `VendorService`.
- **Unlocks**: the first externally-meaningful Trust OS output — a vendor questionnaire
  answered from real evidence instead of by hand. This is sequenced first because it is the
  capability with the clearest immediate value and the smallest dependency footprint (it
  needs Evidence and Control data that already exists, not a new graph or new scoring
  model).

## Phase 2 — Trust Knowledge Graph

- **Depends on (existing, reused)**: the already-specified `docs/convergence/governance-graph.md`
  and `docs/convergence/knowledge-graph.md` designs; `packages/knowledge-graph/src/index.ts`
  as the implementation starting point.
- **Builds**: persists the graph (today it is type-only, per Batch 1), adds the Trust Score
  node and Vendor/Questionnaire nodes introduced in Phase 1, sketches the AI branch.
  Implementation of the graph itself (turning the 12-line type sketch into a real, queried
  structure) is application code and explicitly out of scope for this docs-only exercise —
  but the design in `TRUST_KNOWLEDGE_GRAPH.md` must exist before that implementation
  starts, per the "never implement before documenting" rule (`CLAUDE.md:23-24`).
- **Unlocks**: every later phase. Trust Center, Evidence Intelligence, and AI Governance
  all need a queryable graph to compose their views from — without Phase 2, each later
  phase would otherwise be tempted to write its own bespoke query layer, recreating the
  duplication this whole exercise exists to prevent.

## Phase 3 — Trust Center

- **Depends on**: Phase 1 (Questionnaire Agent data to show completion stats), Phase 2
  (graph queries), existing `GovernanceService`/`governance_scores`, existing
  `compliance-command-center/` and `executive-assurance/` routes as prior art to avoid
  duplicating.
- **Builds**: a new public/external route (confirmed missing in
  `TRUST_OS_EXISTING_ROUTES_MAP.md`) — read-only, zero new business logic, composing Trust
  Score, Evidence Vault summaries, Framework coverage, and Certification status.
- **Unlocks**: the first trust artifact an organization can actually share with a customer
  or auditor.

## Phase 4 — Evidence Intelligence

- **Depends on**: `EvidenceService`, `evidence_reviews`, `control_evidence` (all existing).
- **Builds**: extension of `EvidenceService` with freshness/expiry detection, reuse-across-
  controls indexing, and AI-assisted evidence-gap detection — feeding directly into the
  Evidence component of Trust Score (`TRUST_SCORE_MODEL.md`).
- **Unlocks**: a Trust Score whose Evidence dimension reflects evidence *currency*, not just
  presence — closing the gap CLAUDE.md's stub scoring doc already flagged as required
  ("review completion") but which the real `governance_scores` table does not yet compute
  (per `TRUST_SCORE_MODEL.md`'s "what actually exists" section).

## Phase 5 — AI Governance

- **Depends on**: Phase 2 (graph, for the AI branch), the existing governed-agent pattern
  (`governed_agents`/`agent_certifications`, `supabase/migrations/202606180009_agent_governance_os.sql`)
  as the architectural template.
- **Builds**: `ai_assets`, `ai_risks`, `ai_controls`, `ai_decisions` tables and an
  `AiGovernanceService`, per `TRUST_OS_DATA_MODEL.md`.
- **Unlocks**: the AI Governance dimension of Trust Score, currently excluded/null per
  `TRUST_SCORE_MODEL.md`'s explicit no-fabricated-number rule. This is sequenced fifth, not
  first, because it has the largest net-new surface area of any Trust OS capability (per
  `TRUST_OS_HARMONIZATION_PLAN.md`'s "Build" classification) and depends on the graph
  existing first.

## Phase 6 — Trust Intelligence

- **Depends on**: all five prior phases.
- **Builds**: the synthesis layer — AI-generated insights across the full Trust Score
  history, questionnaire answer quality trends, evidence freshness trends, and AI
  Governance posture, following the same Knowledge Object pattern (`Gap`, `Signal`,
  `Insight`, `Recommendation`, `Readiness State`) already specified for the general
  Knowledge Graph in `docs/convergence/knowledge-graph.md:23-33`.
- **Unlocks**: the "Continuously Trusted" maturity level (`TRUST_MATURITY_MODEL.md`, Level
  5) — the point at which Trust Score, Trust Center, and Questionnaire Agent are no longer
  separate features but expressions of one continuously-current trust intelligence layer.

## Sequencing rationale (why this order and not another)

1→2→3 ships value fastest with the smallest dependency chain (Questionnaire Agent needs
only Evidence/Control data that already exists). 4 strengthens the Evidence dimension before
5 adds the hardest, most net-new domain (AI Governance), so the codebase isn't carrying an
unscored dimension any longer than necessary. 6 is last because it requires every other
phase's data to already exist — it has nothing to synthesize otherwise.
