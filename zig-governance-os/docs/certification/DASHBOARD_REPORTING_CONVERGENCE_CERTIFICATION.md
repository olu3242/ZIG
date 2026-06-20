# Dashboard + Reporting Convergence Certification (Phase 9, partial)

**Date:** 2026-06-20
**Scope:** Replace the hardcoded `governanceScore: latestProject ? 25 : 0` in
`apps/web/app/lib/data.ts`'s `loadDashboard()` with a real, explainable, 7-input score
computed from live data, and close the gap explicitly flagged in
`docs/certification/VENDOR_WORKFLOW_CERTIFICATION.md` ("No governance-score
integration — vendor risk does not yet feed the dashboard's governanceScore... that's
Phase 9's scope").

## What this closes

Per `docs/certification/E2E_GAP_REPORT.md`, the Mission Control / Dashboard governance
score was a fixed literal (`25` once a project exists, `0` otherwise) — never recomputed,
never explainable, and unaffected by every other workflow this build has shipped
(Controls, Risks, Evidence, Vendor). This phase makes the score a real function of that
data, per `docs/architecture/governance-scoring-engine.md` (rewritten from stub to a full
spec as part of this change — documentation before implementation, per CLAUDE.md).

## Formula (see `docs/architecture/governance-scoring-engine.md` for full detail)

Seven weighted 0–100 inputs, each a real coverage/completion percentage computed
per-`(tenantId, projectId)`:

| Input | Weight |
|---|---|
| `controlCoverage` | 0.20 |
| `riskAssessmentCoverage` | 0.15 |
| `evidenceCompleteness` | 0.20 |
| `frameworkCoverage` | 0.15 |
| `ownershipCompleteness` | 0.10 |
| `reviewCompletion` | 0.10 |
| `vendorAssessmentCoverage` | 0.10 |

A zero-denominator input contributes `0`, never `null`/`100` — an empty governance program
scores low, never "compliant by default," consistent with CLAUDE.md's "never ship a
blank/empty state" rule applied to scoring.

## Why `vendorAssessmentCoverage` was added (not just left at 6 inputs)

The Vendor workflow certification doc explicitly named this as unfinished: vendor risk was
real and persisted (Phase 6) but never fed into the score the rest of the product reads.
Adding it as a 7th weighted input, funded by reducing `riskAssessmentCoverage` (0.20 → 0.15)
and `ownershipCompleteness` (0.15 → 0.10) rather than diluting every weight equally, closes
that gap without inventing a new module — vendor risk is itself a specialization of risk
assessment (`docs/product/prd.md` Section 11).

## Code changes

- **`packages/services/src/GovernanceService.ts`** — `calculateScore(context, projectId)`
  rewritten to compute all seven inputs from live repository reads (`controls`, `risks`,
  `riskAssessments`, `evidence`, `evidenceReviews`, `projectFrameworks`, `vendors`,
  `vendorAssessments`), apply the weighted formula above, derive a health state
  (Foundation/Visibility/Control/Managed/Optimized), and return a single-sentence
  `explanation` naming the lowest-scoring input. Two new constructor dependencies
  (`vendorRepository`, `vendorAssessmentRepository`) added.
- **`packages/services/src/factory.ts`** — `governance: new GovernanceService(...)` now
  passes `repositories.vendors` and `repositories.vendorAssessments`.
- **`apps/web/app/lib/data.ts`** — `loadDashboard()` now calls
  `services.governance.calculateScore(context, latestProject.id)` when a project exists
  (no project → `governanceScore: 0`, matching the zero-empty-state rule), and returns the
  full breakdown as `governance`.
- **`apps/web/app/dashboard/page.tsx`** — `GovernanceScoreWidget`'s `detail` now shows the
  real health state + explanation sentence instead of a static caption; a new stat-card row
  renders all seven raw input percentages when a governance breakdown exists, satisfying
  CLAUDE.md's "every score states why it exists, what affects it, and how to improve it."

## What is honestly NOT closed in this pass

1. **Mission Control's recent-activity stat is still a static `"0"`** despite
   `audit_events` being populated by `AuditService` (`E2E_GAP_REPORT.md` line 89) — not
   touched in this pass.
2. **Executive Reporting / `/exports` is still FAIL** — `ExportPipeline.createManifest()`
   remains defined but never invoked from any route; no PDF/CSV generation exists. Not
   addressed in this pass; tracked as the remainder of Phase 9.
3. **`governanceScore` is not persisted to the `governance_scores` table** — it is
   recomputed from live data on every read (by design, per the scoring-engine doc's
   "why it exists" explainability requirement: a stored score can go stale, a live
   computation cannot). The `governance_scores` table and its repository remain available
   for historical snapshots if a future phase needs trend lines, but nothing writes to it
   yet.

## Verification performed

- **`npm run typecheck` (root)** — PASS, zero errors, including `apps/web`'s own
  TypeScript pass during `npm run build`.
- **`npm run build` (root)** — PASS for both `web` and `admin` workspaces.
- **Unit test added and executed:**
  `packages/services/src/tests/governance-scoring-workflow.test.ts`. Exercises: an empty
  project (asserts every one of the 7 inputs is exactly `0`, score `0`, health state
  `Foundation` — not null/100); a fully-covered project (one implemented+owned+
  framework-mapped control, one assessed risk, one approved evidence record, one vendor
  with a completed assessment — asserts every input is `100`, score `100`, health state
  `Optimized`); then adding a second unimplemented, unowned control (asserts the score
  drops below the prior value — a real, non-constant function of the data — and that the
  `explanation` names the lowest input with its percentage). Run via
  `npx tsx src/tests/governance-scoring-workflow.test.ts` from `packages/services/` —
  **exited 0**.
- **Regression check:** all 9 prior workflow tests (`learning-workflow`,
  `assessment-workflow`, `lab-workflow`, `evidence-workflow`, `vendor-risk-workflow`,
  `career-readiness-workflow`, `ai-coach-workflow`, `service-layer`, `vertical-slice`) were
  re-run the same way — all **exited 0**, confirming this change did not break any prior
  workflow.
