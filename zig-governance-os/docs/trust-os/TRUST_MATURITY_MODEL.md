# Trust Maturity Model

> Batch 7. Levels 0-5. Each level states what existing Zig capability is required to reach
> it, citing Batch 1 evidence, and what is still missing to advance further.

## Levels

| Level | Name | Description | Required existing capability | What's missing to reach the next level |
|---|---|---|---|---|
| 0 | **Reactive** | No structured governance; trust claims are made ad hoc, evidence is scattered, no score exists. | None — this is the starting state for any new tenant before Zig's onboarding flow (`apps/web/app/onboarding/`) runs. | A first Governance Score calculation (`governance_scores` table) and a populated Asset/Risk/Control set. |
| 1 | **Documented** | Policies, controls, and risks are recorded but not yet linked to evidence or scored continuously. | `ControlService`, `RiskService`, `policies` table exist (`packages/services/src/{ControlService,RiskService}.ts`; `supabase/migrations/202606180005_grc_core_engine.sql:319+`). | Evidence attached to controls (`EvidenceService.findByControl`, `EvidenceService.ts:6-8`) and a first `governance_scores` row with `evidence_coverage > 0`. |
| 2 | **Managed** | Evidence is attached to controls; Governance Score exists and is explainable; gaps are tracked. | `EvidenceService`, `GovernanceService`, `gap_assessments` table all exist and are wired (`packages/services/src/{EvidenceService,GovernanceService}.ts`; `supabase/migrations/202606180005_grc_core_engine.sql:360-372`). | Recurring evidence review cadence (`evidence_reviews` table exists but no automated freshness/expiry tracking yet — Batch 2 Evidence Vault extension) and at least one completed governance Assessment (`assessments`/`risk_assessments` tables). |
| 3 | **Measured** | Trust Score (Governance Score + Vendor + AI Governance dimensions) is computed and explainable across all in-scope domains from `TRUST_TAXONOMY.md`; vendor risk is tracked with a real service. | Requires the Batch 2 "Build/Extend" items: `VendorService` (net-new, wraps existing `vendors` table) and the Trust Score formula extension (`TRUST_SCORE_MODEL.md`). | A Trust Center surface (currently MISSING per `TRUST_OS_EXISTING_ROUTES_MAP.md`) exposing the measured score externally, and a Questionnaire Agent able to answer from measured evidence. |
| 4 | **Automated** | Questionnaire responses are AI-drafted from live evidence with human approval; Trust Score recalculates automatically on every relevant graph change rather than on a manual trigger; audit engagements draw directly from the same evidence trail. | Requires Questionnaire Agent (Batch 2, confirmed net-new in Batch 1) and an `AuditEngagementService` wrapping the existing `audits`/`audit_findings` tables (currently ungoverned by any service per Batch 1). | AI Governance coverage (AI Asset/Risk/Control/Evidence/Decision tracking — confirmed missing in Batch 1) and BCM coverage (confirmed missing in `TRUST_TAXONOMY.md`) closing the remaining domain gaps. |
| 5 | **Continuously Trusted** | All nine `TRUST_TAXONOMY.md` domains — including AI Governance and BCM — are covered by live services and evidence; Trust Score, Trust Center, and Questionnaire Agent all read the same always-current graph; certifications (compliance sense) are tracked alongside learner credentials without schema duplication. | Requires every "Build" item in `TRUST_OS_HARMONIZATION_PLAN.md` to be implemented, plus the `certification_type` discriminator (Batch 2 item 8) and the AI branch of `TRUST_KNOWLEDGE_GRAPH.md`. | This is the ceiling of the current Trust OS scope — no further gap identified beyond execution. |

## How a tenant's current level is determined (explainability requirement)

Consistent with CLAUDE.md's rule that every score "must be explainable: every score states
why it exists, what affects it, and how to improve it" (`CLAUDE.md:113-114`), Trust
Maturity Level for a tenant should be derived from concrete graph state, not self-reported:

- Level 0→1: at least one `controls` row and one `risks` row exist for the project.
- Level 1→2: `evidence_coverage` in the tenant's latest `governance_scores` row is greater
  than zero (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:291`).
- Level 2→3: a `VendorService`-backed vendor risk rating exists and the extended Trust
  Score (with Vendor + AI Governance dimensions) has been calculated at least once.
- Level 3→4: at least one Questionnaire has been answered with an AI-drafted-and-approved
  response, and at least one audit engagement has been logged through the (net-new)
  `AuditEngagementService`.
- Level 4→5: at least one AI Asset is registered with a complete AI Risk → AI Control → AI
  Evidence chain, and a BCM artifact (e.g. a completed BIA per `docs/artifacts/BIA.md`) is
  linked to at least one critical asset.

## Relationship to the existing Governance progression engine

`docs/architecture/governance-scoring-engine.md:14` (currently a STUB) already names a
five-stage progression engine — Foundation, Visibility, Control, Managed, Optimized — for
Governance Score generally. Trust Maturity Level is a **superset** of that progression,
not a competing one: Trust Maturity Levels 0-2 correspond roughly to
Foundation/Visibility/Control, and Levels 3-5 extend past where the Governance Score
progression model currently stops, because they require the Vendor, AI Governance, and
external-facing dimensions that are specific to Trust OS. When
`governance-scoring-engine.md` is filled in (it is still a stub as of this audit), it
should reference this maturity model rather than define a third, separate progression
scale.
