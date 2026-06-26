# Trust Score Model

> Batch 9. This document exists specifically to prevent a parallel, conflicting scoring
> system. `docs/architecture/governance-scoring-engine.md` is currently a **STUB** (it
> states required content but contains no actual formula — see
> `docs/architecture/governance-scoring-engine.md:1-15`). The real, working scoring model
> lives in the `governance_scores` table and is read through `GovernanceService`. Trust
> Score is defined here as an explicit extension of that real model, not an invention.

## What actually exists today (the real Governance Score)

`governance_scores` table (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`):

```sql
create table governance_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  controls_implemented integer not null default 0,
  evidence_coverage integer not null default 0,
  risk_treatment integer not null default 0,
  assessment_completion integer not null default 0,
  explanation text not null default '',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Read through `GovernanceService` (`packages/services/src/GovernanceService.ts:4-13`),
which extends `BaseService<GovernanceScoreRecord>` and adds `findRecommendations(context,
projectId)` over `RecommendationRecord`. The table's own columns
(`controls_implemented`, `evidence_coverage`, `risk_treatment`, `assessment_completion`)
are exactly the four inputs `docs/architecture/governance-scoring-engine.md:11` lists as
required (minus "asset coverage," "framework coverage," "ownership completeness," and
"review completion," which that stub also lists but which have no corresponding column in
the real table — a gap in the *implementation* of Governance Score that predates Trust OS
and is out of scope to fix here).

`explanation text not null default ''` is the column that satisfies CLAUDE.md's
explainability requirement directly at the schema level (`CLAUDE.md:113-114`): every score
row is required to carry its own explanation, not compute one ad hoc at read time.

## Trust Score = Governance Score, extended with two new dimensions

The task specifies seven weighted dimensions: Governance 15, Risk 15, Controls 20, Evidence
20, Audit 10, Vendors 10, AI Governance 10 (sums to 100). Reconciling this against the real
`governance_scores` columns:

| Trust Score dimension | Weight | Existing source | New or existing? |
|---|---|---|---|
| Governance | 15 | `governance_scores.score` baseline / overall program completeness | Existing |
| Risk | 15 | `governance_scores.risk_treatment` | Existing |
| Controls | 20 | `governance_scores.controls_implemented`, cross-checked via `ControlService.findMappings()` (`ControlService.ts:10-12`) for framework coverage | Existing |
| Evidence | 20 | `governance_scores.evidence_coverage`, extended with freshness/expiry once the Evidence Vault extension (Batch 2) lands | Existing, extended |
| Audit | 10 | `governance_scores.assessment_completion` plus audit engagement state once `AuditEngagementService` exists (currently no service wraps `audits`/`audit_findings` — see Batch 1) | Existing column, new service-level input |
| Vendors | 10 | **New** — requires `VendorService` (confirmed missing in Batch 1) reading vendor `risk_rating` from the existing `vendors` table (`supabase/migrations/202606190002_mvp_convergence_schema.sql:92`, already 0-100 scaled) | New dimension, existing data source |
| AI Governance | 10 | **New** — requires the AI Asset/Risk/Control model from `TRUST_OS_DATA_MODEL.md` (confirmed missing in Batch 1); until built, this dimension defaults to 0/unscored rather than a fabricated number | New dimension, new data source |

## Formula

```
TrustScore = 0.15 * GovernanceComponent
           + 0.15 * RiskComponent
           + 0.20 * ControlsComponent
           + 0.20 * EvidenceComponent
           + 0.10 * AuditComponent
           + 0.10 * VendorComponent
           + 0.10 * AIGovernanceComponent
```

Each `*Component` is a 0-100 value, consistent with `governance_scores.score`'s existing
`check (score between 0 and 100)` constraint
(`supabase/migrations/202606180001_batch_21_core_data_platform.sql:289`) — Trust Score
inherits this exact bound rather than defining a new scale.

- `GovernanceComponent`, `RiskComponent`, `ControlsComponent`, `EvidenceComponent`, and
  `AuditComponent` are read directly from the existing `governance_scores` row for the
  project (its `score`, `risk_treatment`, `controls_implemented`, `evidence_coverage`, and
  `assessment_completion` columns respectively, each already 0-100-scaled integers).
- `VendorComponent` is the average `risk_rating` (inverted, since a high risk rating is bad
  and Trust Score weights toward trustworthy) across the tenant's `vendors` rows once
  `VendorService` exists.
- `AIGovernanceComponent` is computed from AI Control effectiveness scores across all
  registered AI Assets, mirroring the existing `control_effectiveness.effectiveness_score`
  pattern (`supabase/migrations/202606180005_grc_core_engine.sql:123-135`) once the AI
  branch is built. Until then, it is explicitly `null`/excluded from the weighted sum
  (renormalizing the remaining 90 points), never silently defaulted to a misleadingly high
  or low number — consistent with the "agents must show source graph records... must not
  hide uncertainty" rule already established in `docs/convergence/autonomous-governance.md:66-67`.

## Relationship to Governance Score — explicit statement

**Trust Score is not a parallel scoring system.** It is the existing, real
`governance_scores` computation with two additional weighted dimensions (Vendor, AI
Governance) layered on top, re-weighted from the original four-input model to the
seven-input model above. A tenant with no vendors and no registered AI assets still gets a
fully valid Trust Score — it simply scores Governance/Risk/Controls/Evidence/Audit at full
weight (90 of 100 possible points reachable) until Vendor and AI Governance data exists,
rather than being blocked or shown a fabricated number for dimensions it hasn't populated
yet. This mirrors CLAUDE.md's "zero empty states" rule (`CLAUDE.md:127-128`) applied to
scoring specifically: an unpopulated dimension is shown as "not yet measured," never as a
silent zero that would unfairly penalize the score.

## What still needs to happen before this formula is real (tracked, not solved, here)

1. `docs/architecture/governance-scoring-engine.md` must be filled in (it is currently a
   STUB) and should reference this document for the Vendor/AI Governance extension rather
   than re-deriving its own weights.
2. `governance_scores` needs either two new columns (`vendor_component`,
   `ai_governance_component`) or a computed view joining `vendors` and the future
   `ai_controls` table — a decision for the implementation phase, not this docs-only batch.
3. `VendorService` and the AI Asset/Risk/Control services must exist before their
   components can be anything other than excluded/null.
