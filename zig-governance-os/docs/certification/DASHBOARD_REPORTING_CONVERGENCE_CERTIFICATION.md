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

## Mission Control recent activity (also closed in this pass)

`E2E_GAP_REPORT.md` line 89 flagged Mission Control's recent-activity stat as a static
`"0"` despite `audit_events` being populated by `AuditService` on every tenant repository
write. Closed by:

- **`packages/data-access/src/types.ts`** — `AuditSink` interface gained `findByTenant`.
- **`packages/data-access/src/AuditRepository.ts`** (in-memory) already had `findByTenant`;
  **`packages/data-access/src/SupabaseRestAdapter.ts`**'s `SupabaseAuditSink` gained a real
  implementation backed by the same `SupabaseRestAdapter.findMany` every other repository
  uses.
- **`packages/services/src/AuditService.ts`** — new `findRecentActivity(context, limit=10)`
  reads real, tenant-scoped `audit_events` rows sorted by `createdAt` descending.
- **`apps/web/app/lib/data.ts`** — `loadDashboard()` now fetches
  `services.audit.findRecentActivity(context)`, returned as `recentActivity` and
  `stats.recentActivityCount`.
- **`apps/web/app/mission-control/page.tsx`** — the stat card now shows the real count, and
  a new "Recent Activity" table renders each event's action, entity, and timestamp.
- **Test added:** `packages/services/src/tests/mission-control-activity.test.ts` — asserts
  zero activity before any action, then asserts `findRecentActivity` returns only the
  current tenant's events after a cross-tenant write (tenant isolation), confirming the
  count is real and not a constant. **Exited 0.**

## Executive Reporting / Exports (also closed, partially, in this pass)

`ExportPipeline.createManifest()` existed but was never invoked from any route, and
`/exports` rendered a static, hardcoded catalog. Closed for the five entity types most
central to the Universal Governance Model — `controls`, `risks`, `evidence`, `vendors`,
`audits` — with the remaining nine types left honestly cataloged-only rather than faked:

- **`packages/exports/src/index.ts`** — added `LIVE_EXPORT_TYPES` (the five real types) and
  a real `toCsv()` serializer (RFC-4180-style quoting/escaping, header row from the first
  record's keys).
- **`packages/services/src/exports/index.ts`** (`ExportsService`, rewritten) —
  `generateExport(context, type)` creates a real manifest via the existing
  `ExportPipeline`, reads the live tenant-scoped repository rows for the requested type,
  and serializes them to CSV. Calling it for a non-live type throws explicitly rather than
  returning empty/fabricated content — an honest failure, not a silent stub.
- **`packages/services/src/factory.ts`** — `exports: new ExportsService(...)` added as a
  new top-level service key, reading `controls`, `risks`, `evidence`, `vendors`, `audits`.
- **`apps/web/app/exports/download/[type]/route.ts`** (new route handler) — `GET` calls
  `services.exports.generateExport`, records a real `audit_events` row via
  `services.audit.recordAction`, and streams the CSV back with a `Content-Disposition:
  attachment` header — a real, downloadable file, not a manifest object that's discarded.
- **`apps/web/app/exports/page.tsx`** — the catalog table now marks each type "live"
  (with a working "Download CSV" link) or "catalog only" (with "Not yet wired") instead of
  claiming all 14 types are uniformly "enabled."

### What is honestly NOT closed in Exports

- **9 of 14 `ExportType`s remain catalog-only**: `projects`, `frameworks`, `issues`,
  `tasks`, `users`, `assets`, `policies`, `compliance_status`, `executive_metrics`. Most of
  these map to entities that exist in the schema (`projects`, `tasks`, `users`, `assets`)
  but were not wired to `ExportsService` in this pass to keep this change reviewable; a
  couple (`issues`, `compliance_status`, `executive_metrics`) have no single backing table
  and would need a real definition before they could be wired honestly.
- **Only CSV is implemented.** `xlsx` and `pdf` formats remain unimplemented — no
  spreadsheet/PDF library exists in this repo, and adding one was out of scope for this
  pass. `json` would be trivial to add (the rows are already in memory) but was not added
  since the cert doc's job is to report what's real, not pad the type list.
- **No download-tracking/archive stage.** The manifest's `stages` field
  (`request/authorize/generate/audit/download/archive`) is returned but only `request` and
  `generate` are meaningfully exercised by `generateExport`; `authorize`/`download`/
  `archive` remain conceptual, matching the same "stages declared, not all individually
  enforced" honesty pattern used elsewhere in this build.

## What is honestly NOT closed in this pass

1. **`governanceScore` is not persisted to the `governance_scores` table** — it is
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
- **Another unit test added and executed:**
  `packages/services/src/tests/exports-workflow.test.ts` — asserts `generateExport`
  produces a CSV containing the real, just-created control row (not a fixture/constant),
  asserts the CSV has a header row, and asserts requesting a catalog-only type
  (`policies`) throws rather than returning fabricated content. **Exited 0.**
- **Regression check:** all 9 prior workflow tests (`learning-workflow`,
  `assessment-workflow`, `lab-workflow`, `evidence-workflow`, `vendor-risk-workflow`,
  `career-readiness-workflow`, `ai-coach-workflow`, `service-layer`, `vertical-slice`), plus
  `mission-control-activity` and `exports-workflow` (new, see above), were re-run the same
  way — all **exited 0**, confirming this change did not break any prior workflow.
  `packages/data-access`'s own test suite (`supabase-adapter`, `tenant-isolation`) was also
  re-run after the `AuditSink` interface change — both **exited 0**.
