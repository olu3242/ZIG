# Predictive Trust Risk (Batch 55)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Honest framing: rules-based leading-indicator scoring, not machine learning

The Batch 51 audit searched `packages/` for any sklearn, tensorflow, torch, trained
model artifacts, `.fit(` calls, or training pipelines, and found **none**. Every
"predict"/"forecast" reference found in the codebase today (e.g. `digital-twin`'s
`forecast()` method, used by `executive-assurance/page.tsx`) is a deterministic
arithmetic stub — current score plus a fixed constant per time horizon — not a trained
model.

This document therefore deliberately does **not** claim machine learning, statistical
forecasting, or a trained predictive model. Predictive Trust Risk is a **rules-based
leading-indicator scoring model**: each risk type is computed from a weighted combination
of currently-observable signals (trend slopes from Batch 52, findings from Batch 54)
using fixed, explainable rules — the same explainability standard CLAUDE.md requires of
the Governance Score and every AI recommendation. If real ML/statistical modeling is
built in a future phase, it should be documented as a distinct, versioned upgrade to this
model, not silently substituted for it.

## What it predicts

1. **Audit Failure Risk** — likelihood that an upcoming audit/assessment surfaces a
   material finding. Rules-based inputs: Framework Readiness trend (Batch 52), open
   Coverage Gap findings (Batch 54), Evidence Health Score trend.
2. **Evidence Expiration Risk** — likelihood that evidence supporting active controls
   will lapse before review/renewal. Rules-based inputs: count of evidence items in
   "expiring" state per `autonomous-evidence`'s existing classification (PR #9), weighted
   by how many active controls/requirements each piece of evidence supports.
3. **Vendor Risk Escalation** — likelihood a vendor's risk tier worsens. Rules-based
   inputs: vendor assessment expiration proximity (Batch 54), vendor assurance trend
   (Batch 52).
4. **AI Governance Risk** — likelihood an AI asset falls out of governance compliance.
   Rules-based inputs: AI Trust Score trend (batches 41-50, read-only reference), AI
   Asset coverage-gap findings (Batch 54).
5. **Control Failure Risk** — likelihood a control fails its next test. Rules-based
   inputs: control drift findings (Batch 54), control's existing risk-treatment score
   (from `autonomous-risk`, reused per the Batch 51 matrix), time since last successful
   test.

## Model shape (rules-based, explicitly)

For each risk type: a fixed set of weighted signals → a 0-100 risk score → a risk band
(Low/Medium/High/Critical) → a plain-language explanation naming which signal(s) drove
the score, e.g.: "Evidence Expiration Risk: 68 (High) — driven by 4 evidence items
supporting SOC 2 CC6.1 entering 'expiring' state within 14 days." This mirrors the
explanation pattern already used by the real `GovernanceScoreEngine.explain()` method —
same shape, same standard, applied to a forward-looking instead of a current-state
question.

No risk score in this model is presented without its driving signals named — consistent
with CLAUDE.md's rule that every AI recommendation/score carry a reason, supporting data,
and (here, in place of an ML confidence interval) the band thresholds used.

## What this explicitly is not

- Not a trained classifier or regression model.
- Not based on historical incident/failure data (no such dataset exists in this repo to
  train against even if modeling were in scope).
- Not a black box — every score is fully decomposable into its named input signals to
  preserve the audit-defensibility that the rest of Zig's scoring already provides.

## Relationship to other batches

- Consumes Continuous Assurance (Batch 54) findings and Trust Analytics (Batch 52) trend
  slopes as its only inputs — no new data collection is introduced.
- Drives priority order in the Recommendation Engine (Batch 56) — higher predicted risk
  should surface a higher-priority recommendation.
- Surfaces in Executive Intelligence (Batch 57) as "Top Risks."
