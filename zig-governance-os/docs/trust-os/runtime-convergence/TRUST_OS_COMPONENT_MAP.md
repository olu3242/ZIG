# Trust OS Component Map (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. Master inventory of every named component
across all six Trust OS batches (PRs #7, #8, #9, #10, #12, #11), reconciled against fresh
reads of `main`.

Status legend: **Reuse** (call existing code/table unchanged), **Extend** (add a method,
column, or projection to an existing concept), **Implement** (genuinely new — no existing
analog), **Retire** (existing artifact should be removed/superseded).

## Scoring engines

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| GovernanceScoreEngine | Pre-existing (cited by PR #7) | Reuse | `packages/governance-engine/src/GovernanceScoreEngine.ts:27-41` | `governance_scores` table |
| Trust Score Model (composite) | PR #7, Batch 9 | Implement | none — formula documented only | GovernanceScoreEngine (Reuse), Evidence Health Score, AI Trust Score |
| Trust Maturity Model (0-5) | PR #7 | Implement | none | Trust Score bands |
| Confidence Score (questionnaire response) | PR #8, Batch 17 | Implement | none | EvidenceService (Reuse), ControlService (Reuse) |
| Evidence Health Score / `EvidenceManagementEngine` | PR #9 (pre-existing, audited) | Reuse | `packages/evidence/src/index.ts:9-18` | none |
| Evidence Health Score / `AutonomousEvidenceEngine` | PR #9 (pre-existing, audited) | Reuse, pending reconciliation | `packages/autonomous-evidence/src/index.ts:11-24` | none |
| Evidence health vocabulary reconciliation | PR #9 audit finding, resolved by this batch | Implement (a thin adapter, not a third engine) | none — see `TRUST_OS_DATABASE_ALIGNMENT.md` | Both evidence engines above |
| AI Trust Score | PR #12, Batch 47 | Implement (weight reserved in Trust Score, unscored) | none | AI inventory/risk/control tables (Implement) |
| Trust Analytics (trend) | PR #11, Batch 52 | Implement | none | GovernanceScoreEngine (Reuse, read-only) |
| Trust Benchmark Model | PR #11, Batch 53 | Implement | none | Trust Analytics |
| Predictive Trust Risk Model | PR #11, Batch 55 | Implement | none | `autonomous-risk` (Reuse, read-only input) |

## Evidence

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| EvidenceService | Pre-existing | Reuse | `packages/services/src/EvidenceService.ts:4-8` | `evidence` table |
| `evidence_reviews`, `evidence_collections`, `evidence_jobs`, `evidence_types`, `control_evidence` tables | Pre-existing | Extend (wrap in service methods) | `supabase/migrations/202606180005_grc_core_engine.sql`, `202606180006_production_convergence.sql` | none |
| Evidence expiration alerting | PR #9, Batch 26 | Implement | none | `AutonomousEvidenceEngine` (Reuse) |
| Evidence Request Workflow (internal) | PR #9, Batch 28 | Implement | none, but `evidence_collections` schema closely matches | `evidence_collections` (Extend) |
| Evidence Intelligence / discovery | PR #9, Batch 27/29 | Implement | none | Evidence taxonomy (Implement) |
| Evidence exposure classification (public-safe tier) | PR #10, Batch 36 | Implement | none | Evidence OS taxonomy (Implement) |
| `agent-evidence-review` (recommend-only agent) | Pre-existing | Reuse | `packages/agent-evidence-review/src/index.ts` | `EvidenceManagementEngine` (Reuse), `AgentRuntime`/`AgentGovernanceGuard` (Reuse) |

## Questionnaire OS

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| `questionnaires`/`questions`/`responses` tables | PR #8, Batch 12 | Implement | none — `vendors.questionnaire jsonb` is the only existing artifact and cannot represent this | none |
| Question -> Control mapping | PR #8, Batch 14 | Implement | none | ControlService (Reuse, read path once mapped) |
| QuestionnaireResponseEngine | PR #8, Batch 16 | Implement | none | EvidenceService.findByControl (Reuse), ControlService.findMappings (Reuse) |
| Trust Review / Approval workflow | PR #8, Batch 18 | Implement | none | status-column pattern from `evidence_reviews` (pattern reuse only) |
| Export Model (Excel/CSV/PDF/Word) | PR #8, Batch 19 | Implement, pending verification | `packages/services/src/exports/index.ts` exists but scope unconfirmed | flagged uncertainty, carried forward unresolved |
| `/trust/questionnaires` UI | PR #8, Batch 20 | Implement | none | Trust Center route tree (Implement) |

## Trust Center OS

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| `/trust` route group | PR #10, Batch 31 | Implement | none | none |
| TrustCenterService | PR #10, Batch 32 | Implement | none, follows `BaseService<T>` pattern | GovernanceService, FrameworkService, EvidenceService (all Reuse, read-only) |
| Security Overview (externally-safe Trust Score projection) | PR #10, Batch 33 | Extend (projection layer over real score) | none | GovernanceScoreEngine (Reuse) |
| Compliance Center (certification badge wall) | PR #10, Batch 34 | Extend | `FrameworkRegistry` (Reuse) | PublishedCertification (Implement) |
| Documentation Center (publish/version/gate) | PR #10, Batch 35 | Implement, on existing data | `packages/policies/src/index.ts` (Reuse, read) | PublishedDocument (Implement) |
| Evidence Center (exposure-classified evidence) | PR #10, Batch 36 | Extend | `evidence`, `evidence_collections` (Reuse, read) | Evidence exposure classification (Implement) |
| ZARA Trust / AI Security Assistant | PR #10, Batch 37 | Extend (reapplies existing citation rule to new channel) | QuestionnaireResponseEngine's citation rule (Reuse, pattern) | AssistantService (Implement) |
| Customer Assurance Portal / AccessRequestService | PR #10, Batch 38 | Implement | none — Evidence Request Workflow is a structural precedent only | External identity/RLS variant (Implement) |
| Trust Center Access Control Model (external RLS, signed tokens, NDA) | PR #10, Batch 39 | Implement | none — `RbacEngine` has no external-subject concept | `RbacEngine` (Extend — new `RbacResource` values, not a 14th internal role) |
| 9-section IA (added Privacy, Certifications, Vendor Assurance to the original 6) | PR #10, reconciliation pass | Implement | none | see `TRUST_OS_UI_ARCHITECTURE.md` |

## AI Governance OS

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| `packages/ai-governance` (`AiGovernanceLayer.canExecute`) | Pre-existing | Reuse — but for Zig's own agent gating, NOT customer AI inventory (see `TRUST_OS_AGENT_ARCHITECTURE.md`) | `packages/ai-governance/src/index.ts` (14 lines) | none |
| AI Inventory Data Model (`ai_systems`/`ai_models`/`ai_providers`) | PR #12, Batch 43 | Implement | none | none |
| AI Registry Lifecycle (Request->Review->Approve->Register->Monitor->Retire) | PR #12, Batch 44 | Implement | none | AI Inventory Data Model |
| AI Governance Controls Library | PR #12, Batch 45 | Implement | none — ISO 42001 not seeded anywhere; flagged as a framework gap, not invented | `FrameworkRegistry` (Extend, new framework code once ISO 42001 content exists) |
| AI Risk Engine (8 domains) | PR #12, Batch 46 | Implement | none | AI Inventory Data Model |
| AI Trust Score Model | PR #12, Batch 47 | Implement (weight reserved in Trust Score) | none | AI Risk Engine, AI Governance Controls Library |
| AI Decision Registry | PR #12, Batch 41/48 | Implement | none | AI Inventory Data Model |
| AI Evidence Mapping Model | PR #12, Batch 42/49 | Extend (reuses Evidence OS entities/lifecycle) | `EvidenceService` (Reuse) | Evidence OS taxonomy |
| `/trust/ai-governance` dashboard route | PR #12, Batch 50 | Implement | none | Trust Center route tree |

## Trust Intelligence OS

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| Continuous Assurance Model | PR #11, Batch 54 | Extend | scattered gap-detection logic (`control-advisor.ts`, `remediation.ts`, `autonomous-evidence`) — no single Health Advisor package | Evidence OS, Trust Score |
| Trust Recommendation Engine | PR #11, Batch 56 | Implement | none — no `recommend*` package exists | Continuous Assurance, Trust Analytics |
| Executive Intelligence Model | PR #11, Batch 57 | Extend | `executive-assurance/page.tsx`, `compliance-command-center/page.tsx` (real, tenant-gated routes, but every data input is a hardcoded literal today) | Trust Analytics, Trust Certification |
| Trust Certification Engine | PR #11, Batch 58 | Implement | none — explicitly disambiguated from `certification-journeys`/`certification-readiness` (learner-level, unaffected) | Trust Score, Trust Maturity Model, Continuous Assurance |
| Trust Intelligence Dashboard | PR #11, Batch 59 | Implement | none | all of the above |
| `/trust/intelligence` route | PR #11, Batch 59/60 | Implement | none | Trust Center route tree |
| `certification-journeys` / `certification-readiness` (learner-level) | Pre-existing | Retire? — see below | `packages/certification-journeys/src/index.ts`, `packages/certification-readiness/src/index.ts` | none |

## Agent runtime (Zig's own — in scope for `TRUST_OS_AGENT_ARCHITECTURE.md`, not AI Governance OS)

| Component | Originating Batch/PR | Status | Real Code Location | Depends On |
|---|---|---|---|---|
| AgentRuntime / AgentIngestion / RuntimeQueue / RuntimePersistence | Pre-existing | Reuse | `packages/agent-runtime/src/index.ts` | `governed_agents` table family |
| AgentGovernanceGuard (wraps RbacEngine) | Pre-existing | Reuse | `packages/agent-governance/src/index.ts` | `RbacEngine` (Reuse) |
| `agent-trigger-automation` `DomainEventType` (10 values) | Pre-existing | Reuse, with caveat — see `TRUST_OS_EVENT_MODEL.md` | `packages/agent-trigger-automation/src/index.ts:67-77` | none |

## Closing classification tally

| Status | Count (approx., counted across all tables above) |
|---|---|
| Reuse | 16 |
| Extend | 12 |
| Implement | 31 |
| Retire | 0 (see reasoning below) |

**No component is classified Retire.** The one candidate considered —
`certification-journeys`/`certification-readiness` — is not retired because it serves a
genuinely different, still-valid subject (individual learner readiness for a named career
journey), which PR #11's Batch 58 already disambiguated rather than deprecated. Both
packages remain in active use by Learning OS / Career OS, a different product surface
entirely, and removing them would regress that surface for no Trust OS benefit. The two
non-interoperable evidence health engines (`EvidenceManagementEngine`,
`AutonomousEvidenceEngine`) are also not retired — `TRUST_OS_DATABASE_ALIGNMENT.md`
resolves them by reconciliation (one canonical persisted vocabulary, both engines kept as
input signals), not by deleting either one, since each is the only health logic for its
respective evidence-source pattern (manual-review-driven vs. freshness-window-driven) and
deleting either would lose real signal.
