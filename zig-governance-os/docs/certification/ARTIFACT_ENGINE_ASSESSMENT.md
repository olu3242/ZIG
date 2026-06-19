# Artifact Engine Assessment

**Date:** 2026-06-19
**Scope:** Phase 4 of the MVP-convergence execution plan — assess whether a separate
"Artifact Engine" closure is required, per
`docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#7 Artifact Creation: OPEN — "schema
gap, not just service gap") and `docs/certification/E2E_GAP_REPORT.md` ("3 ... are blocked
at the schema level — there is no table to even attempt a write to").

This is an assessment doc, not a new build. Per the standing rule "DO NOT BUILD NEW
PRODUCTS/MODULES" and "no duplicate tables/services," the question answered here is: **does
Artifact Creation still need its own schema/service, or was it already closed as a
side-effect of Phase 3 (Labs)?**

## Finding: already closed by Phase 3, no new work required

`docs/certification/LAB_WORKFLOW_CERTIFICATION.md` created `lab_artifacts`
(`supabase/migrations/202606180013_lab_workflow_e2e.sql`) — `id`, `tenant_id`,
`scenario_run_id`, `artifact_type` (constrained to `'risk_register' | 'audit_finding' |
'gap_assessment' | 'evidence_record' | 'vendor_review'`), `content` (jsonb), `score`, audit
columns — and wired `ScenarioService.scoreAndComplete` to write a real row to it every time
a lab run is scored. This is confirmed by direct inspection (not assumed): the table exists
in the migration, the insert call exists in `ScenarioService.ts`
(`this.artifactRepository.create(...)`, called from `scoreAndComplete`), and the runtime
test `packages/services/src/tests/lab-workflow.test.ts` asserts a `lab_artifacts` row is
actually persisted with the computed score and a `content` payload — verified exited 0.

A grep across `apps/web`, `packages/services`, `packages/types`, `packages/data-access`
for "artifact" (excluding `.next/` build output) confirms the only artifact-producing code
path in the entire codebase is this Labs path. There is no second, competing
artifact-generation mechanism that Phase 4 would need to reconcile or merge.

**Conclusion: the schema gap the audit flagged for Artifact Creation is the same gap the
Lab Completion row described ("scenario_runs (no submission/score columns used)") — they
were never two separate problems.** `lab_artifacts.artifact_type`'s five values
(`risk_register`, `audit_finding`, `gap_assessment`, `evidence_record`, `vendor_review`)
were deliberately chosen in Phase 3 to span governance-document types beyond just "lab
score," anticipating exactly this question. No new `artifacts` table, no new
`ArtifactService`, and no new route are created here — doing so would duplicate
`lab_artifacts` and `ScenarioService`, which the standing rules explicitly forbid.

## What is honestly still open (correctly out of scope for this phase)

1. **No cross-workflow artifact registry/view.** `lab_artifacts` rows are reachable only
   through their owning `scenario_run` (`apps/web/app/learning/practice-lab/[runId]/page.tsx`).
   There is no single "My Artifacts" or "Portfolio" screen aggregating artifacts across
   runs/learners. This is exactly the gap `docs/academy/PORTFOLIO_ENGINE_ARCHITECTURE.md`
   (Learning OS harmonization docs, written this session) already identifies and scopes to
   a future `PortfolioService` built on the existing-but-unwritten `capstone_projects` /
   `learner_portfolios` tables — not duplicated here.
2. **`artifact_type` is not learner- or scenario-driven** — `scoreAndComplete` defaults to
   `'gap_assessment'` when no type is passed, and no UI lets a learner or scenario
   definition choose among the five types. Already logged as an open item in
   `LAB_WORKFLOW_CERTIFICATION.md` ("What is honestly NOT fully closed," item 2); not
   duplicated as new work here.
3. **No artifact export (PDF/CSV) exists yet.** Turning a `lab_artifacts.content` jsonb
   payload into a downloadable governance document is explicitly Phase 9's responsibility
   (Dashboard + Reporting Convergence, `ExportPipeline.createManifest()` is currently
   dead code per the gap report) — not pulled forward here to avoid building Phase 9 early.

## Traceability matrix update

Row #7 (Artifact Creation) in `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` should
be read as **CLOSED** as of `LAB_WORKFLOW_CERTIFICATION.md` / commit `514638e`, with the
three items above tracked as separate, already-scoped future work (Portfolio Engine,
artifact-type selection UI, export/reporting) rather than as a reason to reopen it.
