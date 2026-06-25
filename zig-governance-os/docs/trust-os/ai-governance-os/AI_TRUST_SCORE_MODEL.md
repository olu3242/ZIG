# AI Governance OS — AI Trust Score Model (Batch 46)

> Batch 46. This document exists specifically to prevent a fourth, conflicting score from
> being invented carelessly. Three scores already exist in Trust OS: the org-level **Trust
> Score** (`TRUST_SCORE_MODEL.md`, Batch 9), the per-response **Confidence Score**
> (`CONFIDENCE_SCORING_MODEL.md`, Batch 17), and the per-evidence-item **Evidence Health
> Score** (`EVIDENCE_HEALTH_MODEL.md`, Batch 25). Each of those three established an
> explicit non-collision statement against the others when it was introduced. **AI Trust
> Score follows that same pattern as the fourth score**, scoped to a single AI System.

## Formula

```
AITrustScore = 0.10 * InventoryComponent
             + 0.20 * GovernanceComponent
             + 0.20 * ControlsComponent
             + 0.15 * MonitoringComponent
             + 0.15 * EvidenceComponent
             + 0.10 * OversightComponent
             + 0.10 * AssessmentsComponent
```

Each component is 0-100; the weighted sum is 0-100.

| Component | Weight | How computed |
|---|---|---|
| Inventory | 10 | 100 if the AI System row has all required fields populated (provider, model, owner, department, use_case, data_types) per `AI_INVENTORY_DATA_MODEL.md`; partial credit per field missing |
| Governance | 20 | Derived from `AI_REGISTRY_LIFECYCLE_MODEL.md` state: `registered`/`monitored` → 100; `approved` → 75; `under_review` → 40; `requested` → 0; `retired` → excluded from the active score entirely (see "Unpopulated and retired dimensions" below) |
| Controls | 20 | Percentage of the 7 control domains (`AI_GOVERNANCE_CONTROLS_LIBRARY.md`) with `status = 'implemented'` or `'verified'` for this AI System |
| Monitoring | 15 | 100 if the AI Risk Engine (Batch 44) has re-scored this system within the current monitoring cadence window; decays toward 0 the longer a system goes unmonitored, mirroring `AutonomousEvidenceEngine`'s freshness-window precedent (`EVIDENCE_HEALTH_MODEL.md`) |
| Evidence | 15 | Derived from AI Evidence mapping coverage (`AI_EVIDENCE_MAPPING_MODEL.md`, Batch 48) — percentage of mapped AI Controls that have at least one linked, non-expired evidence item |
| Oversight | 10 | 100 if the AI System has an assigned `owner_id` and at least one documented human-in-the-loop control (`AI_GOVERNANCE_CONTROLS_LIBRARY.md` domain 1) implemented; 0 otherwise |
| Assessments | 10 | 100 if the AI Risk Engine has run at least once and produced a non-null `risk_level`; 0 if never assessed |

## Worked example

An AI System ("Customer Support Copilot," `status = monitored`) with:
- Inventory: all fields populated → 100 × 0.10 = 10
- Governance: `monitored` → 100 × 0.20 = 20
- Controls: 5 of 7 domains implemented → 71 × 0.20 = 14.2
- Monitoring: re-scored 10 days ago, within cadence → 100 × 0.15 = 15
- Evidence: 4 of 5 mapped controls have linked evidence → 80 × 0.15 = 12
- Oversight: owner assigned, human-in-the-loop control implemented → 100 × 0.10 = 10
- Assessments: risk engine has run → 100 × 0.10 = 10
- **Total: 81.2**

## Explicit non-collision statement

This score is **not** the Trust Score (`TRUST_SCORE_MODEL.md`, Batch 9, weights:
Governance 15 / Risk 15 / Controls 20 / Evidence 20 / Audit 10 / Vendors 10 /
AI Governance 10), **not** the Confidence Score (`CONFIDENCE_SCORING_MODEL.md`, Batch 17,
per-questionnaire-response, weights: Evidence 40 / Controls 25 / Framework Mapping 20 /
Review Status 15), and **not** the Evidence Health Score (`EVIDENCE_HEALTH_MODEL.md`,
Batch 25, per-evidence-item freshness/review state). All four are legitimately different
scopes:

| Score | Scope | Storage |
|---|---|---|
| Governance Score | one project | existing `governance_scores` table |
| Trust Score | one project/tenant, extends Governance Score with Vendor + AI Governance dimensions | proposed extension of `governance_scores` (`TRUST_SCORE_MODEL.md`) |
| Confidence Score | one questionnaire response | `responses.confidence_score` column (`QUESTIONNAIRE_DATA_MODEL.md`) |
| Evidence Health Score | one evidence item | reconciled across two existing engines (`EVIDENCE_HEALTH_MODEL.md`) |
| **AI Trust Score** | **one AI System** | **new `ai_systems.ai_trust_score` column (proposed)** |

## Relationship to Trust Score's reserved AI Governance dimension

`TRUST_SCORE_MODEL.md` (Batch 9) reserves a 10-point "AI Governance" weight in the
project/tenant-level Trust Score formula and states it "defaults to 0/unscored... until
this dimension is built." **AI Trust Score is the computation that fills that reserved
slot**, the same way `evidence_coverage` feeds the Evidence dimension of Trust Score today.
Concretely:

```
TrustScore.AIGovernanceComponent = average(AITrustScore across all registered/monitored
                                            AI Systems in the project)
```

A project with zero registered AI Systems still gets a fully valid Trust Score — the
AI Governance dimension is explicitly excluded/renormalized (per `TRUST_SCORE_MODEL.md`'s
existing rule for unpopulated dimensions), never silently scored as 0, the same "zero empty
states applied to scoring" principle Batch 9 already established. **AI Trust Score does
not write into `governance_scores` directly** — it is read as one aggregated input the same
way `evidence_coverage` is, an explicit future integration point at the implementation
phase, not built here.

## Unpopulated and retired dimensions

Following `TRUST_SCORE_MODEL.md`'s precedent exactly: any component with no underlying data
(e.g. Monitoring before the AI Risk Engine has ever run) is shown as "not yet measured" and
excluded from the weighted sum with the remaining weight renormalized — never defaulted to
a misleadingly low or high number. A `retired` AI System is excluded from the active
AI Trust Score computation entirely (it no longer represents a live risk surface) but its
historical score is preserved for audit trail continuity, consistent with how retired AI
Systems are preserved, not deleted, per `AI_REGISTRY_LIFECYCLE_MODEL.md`.
