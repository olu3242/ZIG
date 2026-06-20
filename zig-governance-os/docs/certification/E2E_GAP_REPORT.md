# E2E Gap Report — ZIG Governance OS

**Date:** 2026-06-19
**Branch:** `claude/hopeful-bardeen-93edl1`
**Method:** Direct source inspection of `apps/`, `packages/`, `supabase/migrations/`. The repo root contains 100+ `*_SPEC.md` / `*_CERTIFICATION.md` documents; those were treated as aspirational and **not** used as evidence. Every verdict below is backed by a concrete file path.

> Scope note: this report (Phase 1 + Phase 2 of the MVP-convergence request) is audit-only. No code was changed to produce it.

## Verdict Legend
- **PASS** — schema + service + route all exist and a write actually persists to Supabase, with downstream effects where applicable.
- **PARTIAL** — at least one layer (schema/service/route) is real, but the chain is broken (no write path exercised, or no downstream effect, or UI shows hardcoded data alongside real data).
- **FAIL** — no working implementation; UI is a shell, schema/service is missing or returns hardcoded values only.

## Summary Table

| Area | Verdict | Route | Service | Table(s) | Persists? | Downstream effects? |
|---|---|---|---|---|---|---|
| Auth | **PASS** | `apps/web/app/(auth)/signup,login` | `TenantService`, `UserService` | `tenants`, `users`, `roles` | Yes | Yes (onboarding creates frameworks) |
| Learning | **PARTIAL** | `apps/web/app/learning/page.tsx` | `LearningService.findModules()` only | `learning_paths`, `learning_modules`, `learning_assessments`, `student_twins` | Read-only path exercised; no write path exercised | No (lesson completion doesn't touch career/dashboard) |
| Assessments | **PARTIAL** | none submit a question | none (`AssessmentService` absent) | `learning_assessments`, `learning_assessment_results` | No | No |
| Labs | **FAIL** | `apps/web/app/learning/practice-lab` (shell) | none (`LabService` absent) | `scenarios`, `scenario_runs` only — no task/submission/artifact tables | No | No |
| Risk | **PASS** | CRUD via `BaseService` | `RiskService` | `risks`, `risk_assessments`, `risk_acceptances`, `risk_reviews` | Yes | Partial (no auto-evidence on treatment) |
| Evidence | **PARTIAL** | no upload UI | `EvidenceService.findByControl()` only | `evidence`, `control_evidence`, `evidence_reviews` | Repo can write; no route exercises it | No |
| Vendor | **FAIL** | string mentions only (`exports`, `services` pages) | none | none — no vendor tables in any migration | No | No |
| AI Coach | **FAIL** | `apps/web/app/ai-command/page.tsx` (shell, `value="0"`) | none | none (no conversation/message table) | No | No |
| Career | **FAIL** | `apps/web/app/career/page.tsx` (hardcoded engine inputs) | none (`career-readiness` package averages fixed numbers) | `student_twins`, `certification_journeys`, `employment_outcomes` exist but unused; no XP/level tables | No | No |
| Reports | **FAIL** | `apps/web/app/exports/page.tsx` (hardcoded strings) | `ExportPipeline.createManifest()` only, never called downstream | none | No | No |
| Dashboard | **PARTIAL** | `apps/web/app/dashboard`, `mission-control` | `lib/data.ts loadDashboard()` | `tenants`, `projects`, `frameworks` real; `governanceScore` hardcoded to `25` | Yes for projects/frameworks; No for score/activity/recommendations | No |

## Per-Area Evidence

### 1. Auth — PASS
- `apps/web/app/lib/supabase.ts` `signUpWithEmail()`/`loginWithEmail()`
- `apps/web/app/lib/actions.ts` `onboardingAction()` (lines 48–85): creates tenant, user profile, assigns frameworks
- `packages/services/src/TenantService.ts` `createOrganization()`, `packages/services/src/UserService.ts` `createProfile()`
- `packages/data-access/src/SupabaseRestAdapter.ts` `insert()` — real POST to Supabase REST
- Schema: `supabase/migrations/202606180001_batch_21_core_data_platform.sql` (`tenants` L40, `users` L82, `roles` L64)

### 2. Learning — PARTIAL
- `apps/web/app/learning/page.tsx` L12 fetches `learningPaths` via `getZigServices().learning.findMany()` — real.
- Same file L13–20 also renders `SkillsGraph().iso27001Core()` and `LearningRuntime().e2eFlow()` — hardcoded, not DB-derived.
- `packages/services/src/LearningService.ts` implements only `findModules()` (read). No `enroll()`, `completeLesson()`, or progress-write method exists anywhere in `packages/services`.
- No code path writes to a `user_progress`-equivalent table on lesson completion; `student_twins` (migration `202606180008`) is never written to.

### 3. Assessments — PARTIAL
- Schema exists (`learning_assessments`, `learning_assessment_results`), and the generic `assessments` repository can write.
- No `AssessmentService` in `packages/services/src/factory.ts`.
- The only "scoring" code is `packages/assessment-os/src/index.ts` `composite()`, which averages 5 hardcoded numbers — not connected to any submitted answer.
- No route accepts question submissions.

### 4. Labs — FAIL
- Migrations define `scenarios`/`scenario_runs` and `simulated_companies`/`simulated_company_objects`, but no lab-task, submission, or artifact tables exist anywhere.
- `packages/services/src/ScenarioService.ts` adds no custom logic beyond inherited `findMany`.
- No "launch", "submit", or "score" action exists for labs.

### 5. Risk — PASS
- Full CRUD via `RiskService` + `BaseService` + `SupabaseRestAdapter`, confirmed by inspecting insert/update/delete calls.
- Schema: `risks`, `risk_assessments` (migration `202606180001` L208/214), `risk_acceptances`, `risk_reviews` (migration `202606180005`).
- Gap: no service auto-generates evidence or updates a governance score when a risk is treated/closed.

### 6. Evidence — PARTIAL
- Schema complete (`evidence`, `control_evidence`, `evidence_reviews`).
- `EvidenceService` implements only `findByControl()` — a read. No upload UI, no review/approve action in any route.

### 7. Vendor — FAIL
- `grep -ri vendor supabase/migrations` returns no table definitions.
- `packages/types/src/index.ts` has no `Vendor` interface.
- "Vendor" appears only as a string literal in `apps/web/app/exports/page.tsx` and `apps/web/app/services/page.tsx` narrative copy — not a feature.

### 8. AI Coach — FAIL
- `apps/web/app/ai-command/page.tsx` renders static cards (`value="0"`, `"N/A"`) with a comment that AI features require "a later AI platform batch."
- No conversation/message table in any migration.
- No LLM client/integration found in `packages/ai*`.

### 9. Career — FAIL
- `apps/web/app/career/page.tsx` instantiates `CareerReadinessEngine`/`EmploymentOS`/`EmployerMatchingEngine` with hardcoded inputs.
- `packages/career-readiness/src/index.ts` `score()` averages 7 fixed numbers — no DB query.
- Tables exist (`student_twins`, `certification_journeys`, `employment_outcomes`) but nothing writes to or reads from them in service code.
- No XP/level/badge tables or logic exist at all.

### 10. Reports — FAIL
- `packages/exports/src/index.ts` defines `ExportPipeline.createManifest()`, which builds a manifest object but is never invoked from any route, and there is no generate/render stage.
- No PDF/CSV library is imported anywhere in the codebase.
- `apps/web/app/exports/page.tsx` only renders hardcoded type/format strings.

### 11. Dashboard — PARTIAL
- `apps/web/app/lib/data.ts` `loadDashboard()` does real fetches for tenant, projects, frameworks.
- Same file, L21: `governanceScore: latestProject ? 25 : 0` — a hardcoded constant, not a calculation.
- `apps/web/app/mission-control/page.tsx` shows recent-activity as a static `"0"` despite `audit_events` being populated by `AuditService`; the dashboard simply never queries it.

## Test Coverage
- `packages/data-access/src/tests/tenant-isolation.test.ts`, `packages/services/src/tests/service-layer.test.ts`, `vertical-slice.test.ts` — narrow unit tests only.
- **No Playwright/Cypress E2E suite exists** (`tests/e2e` does not exist).

## Net Assessment
Auth, Risk, and the read side of Dashboard/Learning are real and persist to Supabase. Everything downstream of "create a lesson/assessment/lab/career/vendor/AI/report" record is either unimplemented or a hardcoded stub. ~95% of the 113 packages under `packages/*` are single-file stubs that return fixed numbers instead of querying the database. This is materially below an 80% MVP claim on a workflow-completion basis — closer to ~35-40% when measured by "does the write path exist and have a downstream effect," even though schema coverage (185 tables) is broad.
