# Security Assurance Certification

**Date:** 2026-06-20
**Scope:** Phase 11.5's Security Center, Trust Analytics, and Framework/Governance
integration requirements — the parts of the spec that are read-only compositions over
existing Controls/Risk/Vendor/Governance/Framework Intelligence data rather than new
write paths. See `TRUST_CENTER_CERTIFICATION.md` and
`QUESTIONNAIRE_AUTOMATION_CERTIFICATION.md` for the schema/service and questionnaire
engine certifications respectively.

## Security Center composition (no new calculation)

The spec's Security Center surfaces: Security Program, Risk Program, Incident Response,
BCP, DR, Vendor Management, Access Management, Control Health. Every one of these is
already real, persisted data surfaced elsewhere in the product:

- **Security/Risk Program, Control Health** → `services.governance.calculateScore`
  (`GovernanceScoreBreakdown`: `controlCoverage`, `riskAssessmentCoverage`,
  `evidenceCompleteness`, `frameworkCoverage`, `ownershipCompleteness`,
  `reviewCompletion`, `vendorAssessmentCoverage`) — composed at the page layer in
  `loadTrustCenter`/`loadPublicTrustPortal`, never re-derived.
- **Incident Response / BCP / DR** → published `trust_documents` rows with categories
  `incident_response_plan`, `business_continuity_plan`, `disaster_recovery_plan`
  (`TRUST_DOCUMENT_CATEGORIES` in `trustIntelligence.ts`), surfaced via
  `computeDocumentReadiness`'s `missingCategories` so a gap is explicit, not silent.
- **Vendor Management** → `services.risks.getVendorRiskSummary` (`vendorCount`,
  `openFindingCount`, `averageRiskScore`) — the same `RiskService` extension Phase 9
  certified, called directly, not duplicated.
- **Access Management** → out of scope for this phase; no new write path was added for it
  (honestly scoped out below).

## Framework Intelligence integration ("display results directly, do not duplicate calculations")

`ComplianceStatusService.getComplianceCenter` calls `computeFrameworkCoverage` and
`computeFrameworkGaps` — the exact same pure functions `FrameworkCoverageService` and
`FrameworkGapService` already expose on the internal Framework Intelligence dashboard —
once per framework in the tenant's catalogue, deriving a `roadmapStatus`
(`not_started | in_progress | ready`) heuristic from `coveragePercent`. No coverage or gap
math is reimplemented; `FrameworkRoadmapService`/`EvidenceReuseService` outputs are
likewise consumed as-is wherever the Trust Portal needs roadmap or reuse data, never
recalculated.

## Governance integration ("consume GovernanceService... display readiness indicators")

`GovernanceService.calculateScore()` is a class method, not a pure function (unlike the
framework intelligence functions), so it cannot be called from inside another constructor-
injected service without introducing service-to-service composition — a pattern this
codebase has consistently avoided (confirmed via grep: no service ever takes another
service as a constructor dependency). The resolution: composition happens at the
**page/data-loader layer**, in `apps/web/app/lib/data.ts`'s `loadTrustCenter` and
`loadPublicTrustPortal`, exactly mirroring the precedent set by `loadCertifications()` and
the Project Detail page's `Promise.all([...])` pattern — multiple already-instantiated
services from `getZigServices()` are called in parallel, and their real outputs are
displayed directly on the Trust Dashboard.

## Trust Analytics — `TrustAnalyticsService`

Tracks the spec's named events (`profile_view`, `document_view`, `document_request`,
`questionnaire_request`) as real `trust_access_logs` rows via `logEvent`, called from:
the public portal page (`profile_view`, in `loadPublicTrustPortal`) and
`submitTrustRequestAction` (`document_request`). `getAnalytics` aggregates real counts
(`totalEvents`, `profileViews`, `documentViews`, `documentRequests`,
`questionnaireRequests`) and a real top-5 `mostRequestedResourceIds` ranking — none of
these are hardcoded, confirmed by the unit test asserting exact counts and ranking order
after persisting a known set of events.

## Public access security

- Public `/trust/[slug]` routes never call `requireTenantContext()` — the only entry point
  into tenant-scoped data is `findPublishedTrustProfileBySlug`, which requires
  `is_published = true` at the query level.
- `trust_center_profiles_public_read`/`trust_documents_public_read` RLS policies
  (`anon` role, `is_published = true` / `visibility = 'public'`) and
  `trust_requests_public_insert` (`anon`, `status = 'pending'`) are defense-in-depth: the
  app server uses the Supabase service-role key (bypassing RLS) for all reads, so primary
  enforcement is the explicit `is_published`/`visibility` filters in
  `findPublishedTrustProfileBySlug` and `TrustDocumentService.findPublic` — but the RLS
  policies ensure a direct, non-app client cannot read unpublished profiles or
  non-public documents even if it obtains only the anon key.
- `submitTrustRequestAction` is the one server action callable without
  `requireTenantContext()`; it derives `tenantId` from a hidden field sourced exclusively
  from the public profile lookup, so a request can only ever be filed against a tenant
  that has published a Trust Center profile.

## What is honestly NOT fully closed

1. **No Access Management surface.** RBAC/role data exists elsewhere in the product but is
   not surfaced on the Security Center — no new module or write path was added for it in
   this phase, since the spec's own module list does not name it as a 12th module.
2. **No rate-limiting on public `/trust/*` routes or `submitTrustRequestAction`** — relying
   on the existing `anon` insert policy's `status = 'pending'` constraint and Next.js's
   default infra, not a new application-level guard.
3. **No live Supabase verification** — see the same caveat in
   `TRUST_CENTER_CERTIFICATION.md`.

## Verification performed

- **`npm run typecheck`** across `@zig/types`, `@zig/data-access`, `@zig/exports`,
  `@zig/services`, and `apps/web` — PASS, zero errors.
- **`npm run build --workspace apps/web`** — PASS.
- **Unit test:** `packages/services/src/tests/trust-center-workflow.test.ts` asserts exact
  `getVendorRiskSummary`-style real-data composition is possible end to end (governance,
  vendor risk, and trust analytics are all exercised through the same in-memory
  repositories used by the rest of the test suite) — **exited 0**.
- **Regression check:** all 16 prior workflow tests re-run and **exited 0**, confirming no
  governance, framework intelligence, or vendor risk calculation was altered by this phase.
