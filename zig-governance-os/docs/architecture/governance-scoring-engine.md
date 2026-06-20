# Governance Scoring Engine

## 1. Scoring formula

The governance score is a 0–100 integer, computed per project, as a weighted average of
seven inputs, each itself a 0–100 percentage:

```
score = round(
    0.20 * controlCoverage
  + 0.15 * riskAssessmentCoverage
  + 0.20 * evidenceCompleteness
  + 0.15 * frameworkCoverage
  + 0.10 * ownershipCompleteness
  + 0.10 * reviewCompletion
  + 0.10 * vendorAssessmentCoverage
)
```

`vendorAssessmentCoverage` was added in the Dashboard + Reporting Convergence pass
(Phase 9) specifically to close the gap flagged in
`docs/certification/VENDOR_WORKFLOW_CERTIFICATION.md` ("No governance-score integration —
vendor risk does not yet feed the dashboard's governanceScore... that's Phase 9's scope").
Its weight was funded by reducing `riskAssessmentCoverage` (0.20 → 0.15) and
`ownershipCompleteness` (0.15 → 0.10) rather than diluting every input equally, since those
two already have the most direct proxy overlap with vendor risk (vendor risk is itself a
specialization of risk assessment, per `docs/product/prd.md` Section 11).

If a project has zero controls, zero risks, or zero evidence (i.e. the denominator for a
given input would be zero), that input contributes `0`, not `null` and not 100 — an empty
governance program scores low, it does not score as "fully compliant by default." This is
the concrete instantiation of CLAUDE.md's "never ship a screen with a blank/empty state"
rule applied to scoring: a new project starts visibly low and visibly improvable, never
blank.

## 2. Inputs, exact definitions, and source tables

| Input | Weight | Definition | Source |
|---|---|---|---|
| `controlCoverage` | 0.20 | `implemented controls / total controls`, ×100 | `controls.status = 'implemented'` |
| `riskAssessmentCoverage` | 0.15 | `risks with at least one risk_assessments row / total risks`, ×100 | `risks`, `risk_assessments` |
| `evidenceCompleteness` | 0.20 | `evidence with at least one approved evidence_reviews row / total evidence`, ×100 | `evidence`, `evidence_reviews` |
| `frameworkCoverage` | 0.15 | `controls whose frameworkId is in the project's assigned frameworks / total controls`, ×100 | `controls`, `project_frameworks` |
| `ownershipCompleteness` | 0.10 | `controls with a non-null ownerId / total controls`, ×100 | `controls.ownerId` |
| `reviewCompletion` | 0.10 | `evidence_reviews rows with status != 'pending_review' / total evidence_reviews rows`, ×100 | `evidence_reviews` |
| `vendorAssessmentCoverage` | 0.10 | `vendors with at least one completed vendor_assessments row / total vendors`, ×100, scoped to the project | `vendors`, `vendor_assessments` |

All six inputs are computed per `(tenantId, projectId)`, never per-tenant-aggregate — a
multi-project tenant has one score per project, consistent with the Universal Governance
Model's `Organization → Project → ...` chain.

## 3. Thresholds and health states

| Score range | Health state |
|---|---|
| 0–24 | Foundation |
| 25–49 | Visibility |
| 50–74 | Control |
| 75–89 | Managed |
| 90–100 | Optimized |

These five labels are the "Progression engine stages" referenced by the stub this document
replaces. They are derived directly from the score above — there is no separate stage
calculation.

## 4. Explainability requirement

Every computed score must be returned with:

- **`explanation`** — a single sentence naming the lowest-scoring input (the one with the
  most room for improvement), e.g. `"Control coverage (40%) is the lowest input — implement more of your existing controls to raise this score."`
- The six raw input percentages themselves (`controlCoverage`, `riskAssessmentCoverage`,
  `evidenceCompleteness`, `frameworkCoverage`, `ownershipCompleteness`, `reviewCompletion`),
  so a UI can render a full breakdown, not just the rolled-up number.

This satisfies CLAUDE.md's "every score states why it exists, what affects it, and how to
improve it" rule: "what affects it" = the six named inputs and their weights (Section 1–2);
"how to improve it" = the `explanation` sentence naming the weakest input; "why it exists"
= the score is recomputed from live data on every read, not stored as a stale snapshot.

## 5. Where this is implemented

`GovernanceService.calculateScore(context, projectId)` in
`packages/services/src/GovernanceService.ts` implements Sections 1–4 exactly as specified
above, reading `controls`, `risks`, `riskAssessments`, `evidence`, `evidenceReviews`,
`projectFrameworks` directly — no hardcoded score, no placeholder constant.
