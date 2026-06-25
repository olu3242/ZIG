# Trust Intelligence OS — Reuse Matrix (Batch 51)

STATUS: Design document. Companion to `TRUST_INTELLIGENCE_AUDIT.md`. Documentation only.

Full matrix, with concrete file paths checked this session, used to classify each
upstream system Trust Intelligence OS touches.

| # | System | File(s) checked | Reality | Classification | Trust Intelligence relationship |
|---|---|---|---|---|---|
| 1 | Governance Scoring / Trust Score (PR #7) | `packages/governance-engine/src/GovernanceScoreEngine.ts` | Real: weighted avg of controlsImplemented (0.35), evidenceCoverage (0.25), riskTreatment (0.25), assessmentCompletion (0.15); returns explanation string | **Reuse** | Batch 52 (Trust Analytics) trends its output over time. Batch 53 (Benchmarking) compares it across peer cohorts. Never recomputed. |
| 2 | Risk Scoring | `packages/autonomous-risk/src/index.ts` | Real: weighted prioritization, canned 3-string `recommendation()` lookup | **Reuse** | Batch 55 (Predictive Trust Risk) consumes risk-priority output as one signal among several for Control Failure Risk / Audit Failure Risk. |
| 3 | Health Advisor | `docs/architecture/health-advisor-engine.md` | STUB — no algorithm content; no dedicated package | **Extend** | Batch 54 (Continuous Assurance) and Batch 56 (Recommendation Engine) implement the concrete drift/gap-detection and remediation-suggestion behavior the Health Advisor doc currently only describes in the abstract. When/if a dedicated Health Advisor package is built, these batches should be reconciled into it rather than duplicated. |
| 4 | Framework Readiness | `packages/framework-engine/` (2 files, 73 lines) | Real mapping logic — most substantial "OS" package in repo | **Extend** | Batch 52 adds a Framework Readiness *trend* metric over the engine's point-in-time output. Batch 55 adds an Audit Failure Risk signal derived from readiness trend + evidence expiration, not a new mapping algorithm. |
| 5 | Executive Reporting | `apps/web/app/executive-assurance/page.tsx`, `apps/web/app/compliance-command-center/page.tsx` | Real React/auth (`requireTenantContext()`); all data hardcoded literals; underlying "engines" (`ContinuousComplianceEngine`, `BoardReportingEngine`, `RegulatoryIntelligenceNetwork`, etc.) are 6-20 line averaging/banding/string-concat stubs | **Extend** | Batch 57 (Executive Intelligence) defines the real aggregation Trust Intelligence supplies to these surfaces (Board Reports, Briefings, Top Risks/Opportunities) so the existing pages can eventually be wired to live program data instead of hardcoded numbers. This batch does not modify those pages. |
| 6 | Recommendations Engine | grep for `recommend` across `packages/` — ~25 unrelated hits (`control-advisor.ts`, `remediation.ts`, `readiness-scoring.ts`, `GovernanceService.ts`, `autonomous-risk`) | No unified system; scattered method names only | **Build** | Batch 56 is new, named `TRUST_RECOMMENDATION_ENGINE` precisely to avoid colliding with any of these existing method names. It is a Build, not a Reuse. |
| 7 | Learning Recommendations (Learning OS) | `packages/learning-os/` (6 lines) | Stub, no recommendation logic | **N/A — boundary statement** | Trust Recommendation Engine (Batch 56) recommends governance actions, never learning content. No code exists in Learning OS to reuse or collide with today. |
| 8 | AI Governance Scores (AI Trust Score, batches 41-50) | Program context only; `docs/trust-os/ai-governance-os/` not populated in this branch at time of writing | Design referenced, not independently re-verified in this session (parallel PR may be in flight) | **Reuse (read-only reference)** | Used as an upstream input signal in Batch 52 (AI Governance Trends), Batch 55 (AI Governance Risk), Batch 57 (AI Governance Status). Weights (Inventory 10/Governance 20/Controls 20/Monitoring 15/Evidence 15/Oversight 10/Assessments 10 = 100) are never redefined here. |
| 9 | Confidence Score (PR #8) | Program context only | Referenced by sibling Trust Center docs, source file not present in this branch | **Reuse (read-only reference)** | Used as an evidence-quality signal in Continuous Assurance (Batch 54) and Predictive Trust Risk (Batch 55, Evidence Expiration Risk). Not redefined. |
| 10 | Evidence Health Score (PR #9) | `packages/autonomous-evidence/` has real date-threshold health-state logic (fresh/current/expiring/expired/missing) | Real, functioning, the most concrete evidence logic in the repo | **Reuse** | Continuous Assurance (Batch 54) is explicitly the *monitoring orchestration* layer across Evidence, Controls, Vendors, Policies, AI Assets, and Assessments — for the evidence dimension specifically, it calls into the existing Evidence Health Score / `autonomous-evidence` logic rather than reimplementing freshness detection. |
| 11 | Certification (learner-level) | `packages/certification-journeys/src/index.ts` (6 lines, journey-name union), `packages/certification-readiness/src/index.ts` (6 lines, unweighted avg of 6 inputs) | Real but trivial; individual/learner-oriented (`iso_lead_implementer`, `soc2_practitioner`, etc.) | **No collision avoided by Reuse — disambiguated instead** | Batch 58 (Trust Certification Engine) is an **org-level** program certification (Bronze/Silver/Gold/Platinum/Continuous Trust tied to Trust Maturity Model levels 0-5), explicitly not the same concept as learner certification journeys. See `TRUST_CERTIFICATION_MODEL.md` for the full disambiguation. |

## Tally

- **Reuse:** 3 (Governance/Trust Score, Risk Scoring, Evidence Health Score)
- **Reuse (read-only reference, upstream inputs not independently re-verified or owned by this batch):** 2 (AI Trust Score, Confidence Score)
- **Extend:** 3 (Health Advisor, Framework Readiness, Executive Reporting)
- **Build:** 1 (Recommendation Engine) — plus one new metric introduced in Batch 53 (see `TRUST_BENCHMARK_MODEL.md`'s Peer Trust Index) and one new model in Batch 58 (Trust Certification Engine, disambiguated rather than reused)
- **Boundary statement, not a classification:** 1 (Learning Recommendations)

Net: **3 Reuse / 3 Extend / 2 Build** at the system level (counting the new benchmarking
metric and Trust Certification Engine as the two Build items, with AI Trust Score and
Confidence Score treated as fixed read-only upstream references rather than systems this
batch classifies for reuse-effort purposes).
