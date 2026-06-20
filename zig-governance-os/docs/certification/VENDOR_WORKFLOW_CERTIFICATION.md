# Vendor Risk Workflow Certification

**Date:** 2026-06-19
**Scope:** Close the Vendor Assessment workflow end-to-end (add vendor → start assessment →
score risk → record findings → dashboard update), per
`docs/certification/E2E_GAP_REPORT.md` (Vendor: FAIL — "no schema, no service, no route")
and `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md` (#10 Vendor Assessment: OPEN).

## Module-surface justification (read this first)

`CLAUDE.md` restricts the product to 11 canonical modules and forbids adding a 12th
without a documented, justified gap in `docs/product/prd.md`. That justification was
written first, **before** any schema/service/route work below: see
`docs/product/prd.md` Section 11 ("Documented module-surface gap: Third-Party / Vendor
Risk"). Decision: Vendor Risk is **not** a new top-level module — it is scoped as an
extension of the existing **Risk Workspace** (module #5), the same way `risk_assessments`,
`risk_acceptances`, `risk_reviews`, and `risk_treatments` already hang off `risks` without
being separate modules.

## Schema

**New migration:** `supabase/migrations/202606180014_vendor_risk_e2e.sql`

A grep across every migration for "vendor" before this change returned no table
definitions (confirmed, not assumed) — only narrative string mentions in marketing/spec
docs and the `'vendor_review'` value on `lab_artifacts.artifact_type`. Three new tables
were required:

- **`vendors`** — the third-party entity: `id`, `tenant_id`, `project_id` (FK to
  `projects`), `name`, `category`, `criticality` (`check`: `low|medium|high|critical`),
  `status` (`check`: `active|offboarding|offboarded`), `contact_email`, audit columns.
- **`vendor_assessments`** — a point-in-time risk assessment of a vendor, mirroring
  `risk_assessments`' shape: `id`, `tenant_id`, `vendor_id`, `assessed_by_user_id`,
  `likelihood`/`impact` (1–5), `risk_score`, `status` (`in_progress|completed`),
  `assessed_at`, audit columns.
- **`vendor_findings`** — issues raised by an assessment, mirroring how `risk_treatments`
  tracks remediation: `id`, `tenant_id`, `vendor_assessment_id`, `vendor_id`, `title`,
  `severity`, `status` (`open|remediating|resolved|accepted`), `remediation_due_at`, audit
  columns.

RLS + `updated_at` trigger wired via the same `do $$ ... $$` loop pattern used in
`202606180012`/`202606180013`. No existing migration or table was modified.

## Types / data-access layer

- `packages/types/src/index.ts`: added `Vendor`, `VendorAssessment`, `VendorFinding` plus
  their status/criticality/severity union types, placed next to `GovernanceScore`.
- `packages/data-access/src/records.ts`: added `VendorRecord`, `VendorAssessmentRecord`,
  `VendorFindingRecord` (same `& { createdAt; updatedAt }` pattern as every other record).
- `packages/data-access/src/repositories.ts`: added `vendors`, `vendorAssessments`,
  `vendorFindings` to `ZigRepositories`, registered for both the Supabase-backed and
  in-memory adapters (table names `vendors`, `vendor_assessments`, `vendor_findings`).

## Service layer — `packages/services/src/RiskService.ts` (EXTENDED, not new)

**KEEP/EXTEND/MERGE/REMOVE decision: EXTEND `RiskService`, do not create a new
`VendorService`.** A vendor is assessed and reviewed using the exact shape `risks`
already uses for its own assessment/review sub-entities; a separate service would either
duplicate that pattern on a parallel class or just be `RiskService` under a different
name. `RiskService` now takes three additional repositories (`vendors`,
`vendorAssessments`, `vendorFindings`) and exposes:

- **`createVendor(context, input)`** — real insert into `vendors`.
- **`findVendors(context)`** — real read.
- **`startVendorAssessment(context, vendorId)`** — real insert into `vendor_assessments`
  with `status: 'in_progress'`.
- **`completeVendorAssessment(context, vendorAssessmentId, likelihood, impact, findings)`**
  — real scoring: `riskScore = round((likelihood * impact / 25) * 100)` (a 1–5 × 1–5 grid
  normalized to 0–100, not a hardcoded number), updates the `vendor_assessments` row to
  `status: 'completed'` with `assessed_at`, and persists each finding as a real
  `vendor_findings` row with `status: 'open'`. Throws if the assessment doesn't exist
  rather than silently creating an orphaned finding set.
- **`findVendorAssessments`, `findVendorFindings`** — real, filtered reads.
- **`getVendorRiskSummary(context)`** — real aggregation: `vendorCount` (all vendors),
  `openFindingCount` (findings with status `open` or `remediating`), `averageRiskScore`
  (mean `riskScore` across `completed` assessments only, `0` if none exist).

`packages/services/src/factory.ts` updated to construct `RiskService` with the three new
repositories; still exposed as `services.risks` (no new top-level service key was added).

## Routes — `apps/web/app/vendors/page.tsx` (new)

No prior vendor route existed anywhere — "Vendor" previously appeared only as narrative
copy in `apps/web/app/exports/page.tsx`/`services/page.tsx`, confirmed by grep before this
change. The new page:

- Lists real projects (a vendor must belong to one) and an "Add Vendor" form posting to
  `createVendorAction`.
- Renders the vendor register from `services.risks.findVendors`, with a "Start Assessment"
  action per vendor with no open assessment, and a "Complete Assessment" form (likelihood,
  impact, optional finding) per vendor with an `in_progress` assessment.
- Shows the latest assessment's status, computed risk score, and finding count once
  completed — real persisted data, not a placeholder.

## Server actions — `apps/web/app/lib/actions.ts`

Added, following the exact pattern of `uploadEvidenceAction`/`reviewEvidenceAction`:
`createVendorAction`, `startVendorAssessmentAction`, `completeVendorAssessmentAction` —
each requires tenant context, calls a real `RiskService` method, records an audit event
with a result-bearing reason string, redirects to `/vendors`.

## Dashboard

`apps/web/app/lib/data.ts` `loadDashboard()` — added a real
`services.risks.getVendorRiskSummary(context)` call, surfaced as `stats.vendorCount`,
`stats.vendorOpenFindingCount`, `stats.vendorAverageRiskScore`. `loadVendors()` added for
the new page. `apps/web/app/dashboard/page.tsx` — added a vendor stat row and a "Vendor
Risk" quick-action link.

## What is honestly NOT fully closed

1. **No vendor offboarding flow.** `vendors.status` supports `offboarding`/`offboarded`
   but no action transitions a vendor into either state — `status` is always `active` at
   creation and never changed. Not requested; scoped out.
2. **Single assessment-cycle UI.** The page shows only the *latest* assessment per vendor;
   there's no history view across multiple assessment cycles for the same vendor, even
   though `vendor_assessments` supports many-per-vendor (verified: `startVendorAssessment`
   has no guard against starting a second assessment while one is in progress).
3. **No finding remediation workflow.** `vendor_findings.status` supports
   `remediating|resolved|accepted` but only `open` is ever written — no action updates a
   finding's status after creation. Mirrors the same honestly-scoped-out pattern as Labs'
   `is_complete` always being `true`.
4. **No governance-score integration.** Vendor risk does not yet feed the dashboard's
   `governanceScore` (still hardcoded `25` per the gap report) — that's Phase 9's scope
   (Dashboard + Reporting Convergence), not pulled forward here.
5. **No live Supabase verification.** Verified against `createInMemoryRepositories()` via
   the runtime test below; the Supabase-backed path was typechecked/built successfully but
   not exercised against a real database in this sandbox.

## Verification performed

- **`npm run typecheck` (root)** — PASS, zero errors.
- **`npm run build` (root)** — PASS. `/vendors` appears in the `web` route manifest.
- **Unit test added and executed:**
  `packages/services/src/tests/vendor-risk-workflow.test.ts`, following the established
  self-executing-assertion pattern. Exercises: create vendor → `findVendors` returns it →
  `startVendorAssessment` (asserts `in_progress`) → `completeVendorAssessment` with
  likelihood=5/impact=5 (asserts `riskScore: 100`, `status: 'completed'`, one finding
  persisted with `status: 'open'`) → second vendor scored with likelihood=1/impact=1
  (asserts `riskScore: 4`, confirming the score is a real function of inputs, not a
  constant) → `getVendorRiskSummary` (asserts `vendorCount: 2`, `openFindingCount: 1`,
  `averageRiskScore: 52`). Run with `npx tsx src/tests/vendor-risk-workflow.test.ts` from
  `packages/services/` — **exited 0**.
- **Regression check:** `learning-workflow`, `assessment-workflow`, `lab-workflow`,
  `evidence-workflow`, `service-layer`, `vertical-slice` tests were all re-run the same way
  and all **exited 0**, confirming this change did not break any prior workflow.
