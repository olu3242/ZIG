# Workflow Traceability Matrix — ZIG Governance OS

**Date:** 2026-06-19
**Source:** Derived directly from `docs/certification/E2E_GAP_REPORT.md`. Same evidence rules apply — no claim here that isn't backed by a real file.

| # | Workflow | Route(s) | DB Tables | Service(s) | Status |
|---|---|---|---|---|---|
| 1 | Signup | `apps/web/app/(auth)/signup/page.tsx` | `users`, `tenants` (via auth) | `UserService.createProfile()`, Supabase Auth (`lib/supabase.ts`) | **CLOSED** |
| 2 | Organization Creation | `apps/web/app/lib/actions.ts` `onboardingAction()` | `tenants`, `roles` | `TenantService.createOrganization()` | **CLOSED** |
| 3 | Learning Enrollment | none — `apps/web/app/learning/page.tsx` only lists paths | `learning_paths`, `learning_modules` | `LearningService.findModules()` (read-only) | **OPEN** — no enroll action exists |
| 4 | Lesson Completion | none | `learning_assessment_results` (unused) | none | **OPEN** — no service/route writes completion, no downstream update to career/dashboard |
| 5 | Assessment Completion | none | `learning_assessments`, `learning_assessment_results` | none (`AssessmentService` doesn't exist) | **OPEN** |
| 6 | Lab Completion | `apps/web/app/learning/practice-lab` (shell) | `scenarios`, `scenario_runs` (no submission/score columns used) | `ScenarioService` (inherits generic `findMany` only) | **OPEN** |
| 7 | Artifact Creation | none | no artifact table exists | none | **OPEN** — schema gap, not just service gap |
| 8 | Risk Creation | generic CRUD via `RiskService` | `risks`, `risk_assessments` | `RiskService` | **CLOSED** |
| 9 | Evidence Creation | none (no upload route) | `evidence`, `control_evidence` | `EvidenceService.findByControl()` (read-only) | **OPEN** — write path unexercised, no UI |
| 10 | Vendor Assessment | none | none — no vendor tables in any migration | none | **OPEN** — no schema, no service, no route |
| 11 | AI Coach Session | `apps/web/app/ai-command/page.tsx` (static shell) | none — no conversation table | none | **OPEN** |
| 12 | Career Progression | `apps/web/app/career/page.tsx` (hardcoded engine inputs) | `student_twins`, `certification_journeys`, `employment_outcomes` (defined, unused) | none (`career-readiness` package averages fixed numbers, no DB I/O) | **OPEN** |
| 13 | Report Generation | `apps/web/app/exports/page.tsx` (hardcoded strings) | none | `ExportPipeline.createManifest()` (built, never invoked) | **OPEN** |

## Status Definitions
- **CLOSED** — route → service → table chain exists, a write persists, and the workflow can run end-to-end today.
- **OPEN** — chain is broken at one or more links (missing route, missing service write, missing table, or read-only stub).

## Result
**2 of 13** required workflows are closed end-to-end (Signup, Organization Creation). Risk Creation (workflow not in the original 13 list but adjacent) is also closed and worth noting as a model for what "done" looks like.

**11 of 13** are open. Of those, 3 (Artifact Creation, Vendor Assessment, AI Coach Session) are blocked at the **schema** level — there is no table to even attempt a write to — meaning these can't be closed by wiring existing code; new migrations are required first. The remaining 8 have schema but are missing the service write-path, the route, or both.

## Conflict to resolve before Phase 3+
This repo carries a standing build methodology (`.claude/skills/zig-fable5-methodology`, referenced from `CLAUDE.md`) that defines **exactly 11 canonical modules**: Mission Control, Project Builder, Scenario Workspace, Asset Workspace, Risk Workspace, Control Workspace, Evidence Workspace, Task Workspace, AI Command Center, Health Advisor, Executive Reporting. **Learning, Labs, Career, and Vendor are not on that list.** The MVP-convergence brief that produced this matrix treats Learning/Labs/Career/Vendor as required core workflows.

Before any implementation phase (3 onward) proceeds, this needs a decision: either (a) the 11-module list is out of date and should be amended to include Learning/Labs/Career/Vendor as documented modules per the project's own "never implement before documenting" rule, or (b) those workflows are out of scope for this convergence pass and the brief's required-workflow list should be cut down to what's actually canonical (Signup, Org Creation, Risk Creation/Treatment, Control management, Evidence, AI Command Center, Health Advisor, Executive Reporting).
