# Questionnaire OS — Confidence Scoring Model

> Batch 17. Defines the per-response Confidence Score (0-100), explicitly distinct from the
> program-level Governance Score and the Trust Score, with a non-collision statement.

## Formula

```
ConfidenceScore = 0.40 * EvidenceComponent
                + 0.25 * ControlsComponent
                + 0.20 * FrameworkMappingComponent
                + 0.15 * ReviewStatusComponent
```

Each component is 0-100; the weighted sum is 0-100.

| Component | Weight | How computed |
|---|---|---|
| Evidence | 40 | Derived from `EvidenceReference` matching tier (`EVIDENCE_MATCHING_RULES.md`): Tier 1 evidence present → 100; Tier 2 only → 60; Tier 3 only → 30 (capped, per the hard rule that Tier 3 alone cannot push total score ≥ 70); no evidence → 0 |
| Controls | 25 | 100 if the question has at least one `ControlReference`; 0 if none (per `CONTROL_MAPPING_ENGINE.md`'s "when mapping fails" case) |
| Framework Mapping | 20 | 100 if the mapped control resolves (via the existing `ControlService.findMappings`) to at least one framework requirement; 0 otherwise |
| Review Status | 15 | 0 if `review_status = 'unreviewed'`; 50 if `'in_review'`; 100 if `'approved'`; 0 if `'rejected'` (rejected responses cannot retain partial credit from a prior approved state) |

## Worked example (continuing the MFA question from `CONTROL_MAPPING_ENGINE.md`)

- Evidence: Tier 1 match (control-exact screenshot) → 100 × 0.40 = 40
- Controls: mapped → 100 × 0.25 = 25
- Framework Mapping: resolves to ISO 27001 A.5 and SOC 2 CC6 → 100 × 0.20 = 20
- Review Status: drafted by AI, not yet reviewed → 0 × 0.15 = 0
- **Total: 85** while unreviewed; reaches 100 once a human reviewer approves it.

## Explicit non-collision statement

This score is **not** the Trust Score (`TRUST_SCORE_MODEL.md`, Batch 9, weights: Governance
15 / Risk 15 / Controls 20 / Evidence 20 / Audit 10 / Vendor 10 / AI Governance 10) and is
**not** the Governance Score (`governance_scores` table, read via `GovernanceService`,
columns `score`/`controls_implemented`/`evidence_coverage`/`risk_treatment`/
`assessment_completion`). All three are legitimately different scopes:

| Score | Scope | Storage |
|---|---|---|
| Governance Score | one project | existing `governance_scores` table |
| Trust Score | one project/tenant, extends Governance Score with Vendor + AI Governance dimensions | proposed extension of `governance_scores` (per `TRUST_SCORE_MODEL.md`) |
| Confidence Score | one questionnaire response | new `responses.confidence_score` column (`QUESTIONNAIRE_DATA_MODEL.md`) |

A questionnaire's aggregate confidence (e.g. average across all responses) **may** be
surfaced as one read-only input to a future Trust Score computation, the same way
`evidence_coverage` is today, but Questionnaire OS does not write into `governance_scores`
directly — any such aggregation is an explicit future integration point, not built here.

See `RESPONSE_QUALITY_MODEL.md` for how Confidence Score feeds a coarser quality label.
