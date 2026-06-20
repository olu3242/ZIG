# Trust Center Certification

**Date:** 2026-06-20
**Scope:** Phase 11.5 — transform Zig from an internal GRC OS into an external trust and
assurance platform: public Trust Portal, Compliance Center, Document Center, and Evidence
Request Center, built entirely on existing Controls/Evidence/Audit/Governance/Vendor/
Framework Intelligence data — no duplicate calculations, no new module outside the 11
canonical modules.

## Audit-before-build (per the Phase 11.5 spec's 13-step rule)

Before any schema/route/service was written, the existing implementation was audited via
an Explore agent: `controls`, `control_tests`, `evidence`, `audit_events`, `audit_findings`,
`vendors`, `vendor_assessments`, `governance_scores`, `recommendations`, `frameworks`,
`framework_controls`, `framework_mappings` all already exist with RLS (migrations
`202606180001`–`202606180015`). `FrameworkCoverageService`, `FrameworkGapService`,
`FrameworkRoadmapService`, `EvidenceReuseService`, `GovernanceService`, and the Health
Advisor all already exist and were reused, not re-implemented. The 7 tables named in the
spec (`trust_center_profiles`, `trust_documents`, `trust_requests`,
`questionnaire_templates`, `questionnaire_submissions`, `questionnaire_answers`,
`trust_access_logs`) were confirmed absent and represent genuinely new point-in-time facts
(a published profile, a document, a request, an answer) rather than derivable views — this
is the same "schema-exists-but-unwired vs. genuinely-new" test Phase 11B established.

## Schema — `supabase/migrations/202606200003_trust_center.sql`

Seven new tables, each with the standard `tenant_id`/`created_by`/`updated_by`/
`created_at`/`updated_at` columns, RLS enabled via the same `do $$ ... $$` loop pattern as
`202606200002_certification_engine.sql`, plus three `anon`-role policies added as
defense-in-depth for the public Trust Portal:

- `trust_center_profiles_public_read` — `select` where `is_published = true`.
- `trust_documents_public_read` — `select` where `visibility = 'public'`.
- `trust_requests_public_insert` — `insert` where `status = 'pending'`.

No existing table or migration was modified.

## Service layer (all built on raw `TenantRepository` injection — no service-to-service composition)

- **`TrustCenterService`** (`extends BaseService`) — `findByProject`, `upsertProfile`
  (create-or-update by `projectId`), `setPublished`.
- **`ComplianceStatusService`** — spans every framework by calling
  `computeFrameworkCoverage`/`computeFrameworkGaps`, the exact pure functions
  `FrameworkCoverageService`/`FrameworkGapService` already call. Per the spec's
  "Display results directly. Do not duplicate calculations," this is reuse of a function,
  not duplication of a service.
- **`TrustDocumentService`** (`extends BaseService`) — `findByProject`, `findPublic`
  (visibility `public` and not expired), `publish`.
- **`TrustRequestService`** (`extends BaseService`) — implements the spec's exact workflow
  Request Submitted → Approval Workflow → Access Granted → Document Released:
  `submitRequest` (status `pending`), `decide` (→ `approved`/`denied`, requires an actor),
  `fulfill` (throws unless already `approved`, → `fulfilled`).
- **`QuestionnaireService`** — templates carry a `templateType` enum
  (`sig | sig_lite | caiq | hipaa_vendor | soc | custom`) rather than one code path per
  template, mirroring "frameworks are metadata, not modules." `autoAnswer` reads live
  framework coverage, evidence, vendor, and governance data and calls
  `generateQuestionnaireAnswer` (in `trustIntelligence.ts`) once per template question,
  persisting each as an `ai_generated` answer with `confidence`/`reasoning`.
- **`TrustAnalyticsService`** — `logEvent`, `getAnalytics` (real counts by event type plus
  top-5 `mostRequestedResourceIds`, not hardcoded).

`packages/services/src/factory.ts` wires all six as new top-level `ZigServices` keys:
`trustCenter`, `complianceStatus`, `trustDocuments`, `trustRequests`, `questionnaires`,
`trustAnalytics`.

## AI Trust Advisor — extends `CoachService`, no new agent

Per the spec's explicit instruction ("Extend existing AI Coach. Do NOT create new Coach
framework"), `CoachService.generateReply()` gained a 5th branch,
`tryGenerateTrustAdvisorReply`, triggered by trust-related keywords in the learner's
message (questionnaire, SIG, CAIQ, trust portal/readiness, compliance status, sales
security, security review). It reuses `computeFrameworkCoverage` (already imported) and
the new `computeDocumentReadiness` to report average framework coverage and document
readiness, with the same `reasoning`/`supportingData`/`confidence`/`frameworkReference`
explainability fields every other Coach reply carries.

## Public Trust Portal routes

- `apps/web/app/trust/[slug]/page.tsx` — Trust Dashboard: governance score, framework
  coverage table, vendor risk, public document list. Composed at the page layer (not
  inside a service) by calling already-instantiated `services.governance`,
  `services.complianceStatus`, `services.risks`, `services.trustDocuments` in parallel —
  the same pattern `loadCertifications()`/`loadDashboard()` use, since `calculateScore()`
  and `getComplianceCenter()` are service methods, not pure functions.
- `apps/web/app/trust/[slug]/request-access/page.tsx` — Evidence Request Center form,
  posts to `submitTrustRequestAction`.
- `apps/web/app/lib/supabase.ts` — `findPublishedTrustProfileBySlug`, the only entry point
  these routes use to resolve a tenant; requires `is_published = true`, mirroring
  `findTenantProfileByAuthUserId`'s raw-fetch pattern. `apps/web/app/ShellGate.tsx` was
  extended to skip the authenticated app shell for `/trust/*`.

## Internal management UI — `apps/web/app/trust-center/page.tsx`

Authenticated page (added to `OSShell.tsx` nav) to publish/update the Trust Center
profile, publish documents, approve/deny/fulfill access requests, and manage questionnaire
templates/submissions. Backed by `loadTrustCenter()` in `apps/web/app/lib/data.ts`.

## Server actions — `apps/web/app/lib/actions.ts`

`publishTrustProfileAction`, `publishTrustDocumentAction`, `submitTrustRequestAction`
(the only action callable without `requireTenantContext()` — it resolves tenant scope via
a hidden `tenantId` field sourced from the public profile lookup), `decideTrustRequestAction`,
`fulfillTrustRequestAction`. Each authenticated action calls `services.audit.recordAction`
after the mutation, matching the existing convention that audit logging happens at the
action layer, never inside services.

## What is honestly NOT fully closed

1. **No NDA e-signature flow.** `nda_required` is a recognized `visibility` value but no
   action captures or verifies an NDA acceptance before release — `fulfill` only checks
   request `status`.
2. **No document expiration enforcement UI.** `expiresAt` is modeled on `TrustDocument` and
   honored by `findPublic`/`computeDocumentReadiness`, but no action sets or renews it.
3. **No live Supabase verification.** Verified against `createInMemoryRepositories()`; the
   Supabase-backed path typechecked/built but was not exercised against a real database in
   this sandbox.

## Verification performed

- **`npm run typecheck`** across `@zig/types`, `@zig/data-access`, `@zig/exports`,
  `@zig/services`, and `apps/web` — PASS, zero errors.
- **`npm run build --workspace apps/web`** — PASS. `/trust-center`, `/trust/[slug]`,
  `/trust/[slug]/request-access` all appear in the route manifest.
- **Unit test added and executed:**
  `packages/services/src/tests/trust-center-workflow.test.ts` — exercises profile
  create/update/publish, public vs. protected document visibility via `findPublic`, the
  full request workflow (submit → fulfill-before-approval rejected → approve → fulfill),
  questionnaire create/start/auto-answer/complete, real analytics aggregation, and tenant
  isolation (a second tenant sees zero rows). Run via
  `npx tsx src/tests/trust-center-workflow.test.ts` from `packages/services/` —
  **exited 0**.
- **Regression check:** every existing test in `packages/services/src/tests/` (16 files)
  was re-run the same way — all **exited 0**.
