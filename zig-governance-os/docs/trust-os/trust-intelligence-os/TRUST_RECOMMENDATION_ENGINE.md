# Trust Recommendation Engine (Batch 56)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Classification: Build, not Reuse or Extend

The Batch 51 audit grepped `packages/` for `recommend` and found no unified
recommendation system — only the string "recommend" appearing as a method or field name
scattered across roughly 25 unrelated files: `agent-domain-intelligence/control-advisor.ts`,
`agent-execution/remediation.ts`, `agent-execution/readiness-scoring.ts`,
`services/GovernanceService.ts`, and `autonomous-risk/src/index.ts` (whose
`recommendation(score)` method returns one of three canned strings). None of these
constitute a system that ranks, explains, or tracks recommendations across the program.
The Trust Recommendation Engine is therefore named and scoped explicitly to avoid
colliding with any of these existing method names, and is classified as a **Build**.

## What it recommends

1. **Missing Controls** — sourced from Continuous Assurance's (Batch 54) Coverage Gap
   findings for the Controls category.
2. **Missing Evidence** — sourced from Continuous Assurance's Coverage Gap and Expired
   Items findings for the Evidence category, reusing PR #9's Evidence Health Score
   lifecycle classification rather than redefining what "missing" evidence means.
3. **Training** — recommended when a Policy acknowledgment/training failure is detected
   (Batch 54) or when Questionnaire Performance trend (Batch 52) shows declining response
   quality for a given control/framework area. This recommends *that* training is needed
   and *who* needs it — it does not recommend specific learning content, which remains
   Learning OS's domain (per the boundary stated in `TRUST_INTELLIGENCE_REUSE_MATRIX.md`,
   item 7).
4. **Framework Improvements** — sourced from Framework Readiness trend (Batch 52)
   showing decline or stagnation in a specific framework's coverage.
5. **AI Governance Improvements** — sourced from AI Governance Risk (Batch 55) and AI
   Asset coverage gaps (Batch 54), referencing AI Trust Score components (batches 41-50)
   by name without recomputing them.

## Ranking and explainability

Every recommendation carries:

- **Severity** (derived from the Continuous Assurance finding or Predictive Risk score
  that triggered it).
- **Predicted impact** — which Trust Score component (or Evidence Health / AI Trust
  Score component) improves, and by roughly how much, if the recommendation is acted on.
  This is a rules-based estimate (e.g. "closing this Coverage Gap restores the full
  Controls sub-score weight for this requirement"), not a trained-model prediction —
  consistent with the non-ML framing in Batch 55.
- **Action** — the concrete next step (e.g. "Upload evidence for CC6.1," "Assign SOC 2
  training to 3 affected owners").
- **Reason and supporting data** — the specific finding(s) or trend(s) that generated it,
  satisfying CLAUDE.md's requirement that every recommendation be explainable.

This mirrors the Health Advisor's required recommendation schema (severity, explanation,
action, ideally one-click remediation) from `docs/architecture/health-advisor-engine.md` —
the Recommendation Engine is the concrete, program-wide implementation of that schema,
not a competing one.

## What it does not do

- Does not recommend learning/training *content* (Learning OS's domain, not built yet).
- Does not auto-remediate. "One-click remediation," where it exists, is described as an
  aspiration consistent with the Health Advisor stub, not implemented here.
- Does not introduce a new scoring formula — every recommendation's priority derives from
  existing scores (Trust Score, Evidence Health Score, AI Trust Score) and Batch 54/55
  outputs.

## Relationship to other batches

- Primary consumer of Continuous Assurance (Batch 54) findings and Predictive Trust Risk
  (Batch 55) scores.
- Feeds Executive Intelligence (Batch 57) as "Top Opportunities" (the inverse framing of
  "Top Risks").
- Feeds the Trust Intelligence Dashboard (Batch 59) as its own dedicated section.
