# Trust Center OS — Capability Audit (Batch 31)

## Purpose

Trust Center OS is the **market-facing surface** of Trust OS. Where Batches 1-10
(Trust OS harmonization), 11-20 (Questionnaire OS), and 21-30 (Evidence OS) built the
internal scoring, response, and evidence machinery, Trust Center OS is the first layer
that an **external party** (prospect, customer, auditor) sees directly. This audit
establishes, with file-level evidence from the current `main` branch, what already
exists toward the six target sections at `/trust`:

1. Security Overview
2. Compliance Center
3. Documentation Center
4. Evidence Center
5. AI Security Assistant
6. Customer Assurance Portal

Classification legend (same convention as `TRUST_OS_CAPABILITY_AUDIT.md` and
`EVIDENCE_OS_AUDIT.md`):

| Status | Meaning |
|---|---|
| EXISTS | Implemented and usable as-is |
| PARTIAL | Some building block exists but not for this purpose |
| MISSING | Nothing in the codebase addresses this |

## Method

This audit is grounded in direct reads of the current codebase (not assumption):

- `apps/web/app/*` route tree (Next.js App Router)
- `packages/governance-engine/src/*`, `packages/framework-engine/src/*`,
  `packages/evidence/src/*`, `packages/policies/src/*`, `packages/auth/src/*`
- `supabase/migrations/*.sql`
- Read-only review of `origin/docs/trust-os-batches-1-10`,
  `origin/docs/trust-os-batches-11-20`, `origin/docs/trust-os-batches-21-30`

## Finding 1 — No public/external-facing trust surface exists anywhere

A grep across `apps/web/app`, `packages/`, and `supabase/migrations` for
`trust`, `/trust`, `security-overview`, `public-page`, `share-link`,
`external-share`, `nda`, `subprocessor` (case-insensitive) returns only incidental
hits: prose mentions of "trust" in onboarding copy and `compliance-protocol`,
`FrameworkRegistry.ts` identifiers, and a lifecycle migration filename. There is
**no** `nda`, `subprocessor`, `share-link`, or `external-share` concept anywhere in
the repository. This confirms PR #7's `TRUST_OS_CAPABILITY_AUDIT.md` finding that a
Trust Center is missing — that finding still holds on current `main`.

| Capability | Status | Evidence |
|---|---|---|
| `/trust` route or any public route group | MISSING | No matching directory under `apps/web/app/` |
| Public/anonymous-viewer auth path | MISSING | `packages/auth/src/index.ts` only re-exports `env`, `google`, `session`, `supabase` — session-based, tenant-user only |
| Share-token / signed-link model | MISSING | No `share_token` or equivalent column in any migration |
| NDA gating concept | MISSING | No `nda` reference anywhere |

## Finding 2 — Two existing routes are adjacent but are internal dashboards, not public pages

`apps/web/app/executive-assurance/page.tsx` and
`apps/web/app/compliance-command-center/page.tsx` both exist and sound trust-center-adjacent
by name, but both gate on `requireTenantContext()` as their first statement
(`executive-assurance/page.tsx:7`, `compliance-command-center/page.tsx:14`) and render
internal board-reporting / digital-twin / autonomous-engine widgets for authenticated,
tenant-scoped users. Neither is reachable by an unauthenticated external visitor, and
neither shares state with a hypothetical anonymous viewer. They are **not** the basis
for Trust Center OS's `/trust` surface — they remain internal/executive views. Trust
Center OS is a new route family.

| Capability | Status | Evidence |
|---|---|---|
| `executive-assurance` page | EXISTS, but internal | `apps/web/app/executive-assurance/page.tsx:7` — `requireTenantContext()` |
| `compliance-command-center` page | EXISTS, but internal | `apps/web/app/compliance-command-center/page.tsx:14` — `requireTenantContext()` |
| Reusable layout/shell pattern for a *new* route group | PARTIAL | App Router conventions exist; no public-route-group precedent to copy |

## Finding 3 — Section-by-section verdict

### Security Overview

Depends on the Trust Score (PR #7) and Governance Score. Both already exist as
calculations, but only as internal, tenant-scoped numbers with no externally-safe
projection.

| Building block | Status | Evidence |
|---|---|---|
| Governance Score calculation | EXISTS | `packages/governance-engine/src/GovernanceScoreEngine.ts` — `GovernanceScoreEngine.calculateScore()` |
| `governance_scores` table | EXISTS | `supabase/migrations/202606180001_batch_21_core_data_platform.sql` |
| Trust Score formula | EXISTS (doc only, PR #7) | `TRUST_SCORE_MODEL.md` (batches 1-10) — composite of Governance/Risk/Controls/Evidence/Audit/Vendor/AIGovernance components |
| External-safe subset/redaction of the above | MISSING | No projection logic anywhere |

**Verdict: EXTEND.** The score math exists; the externally-safe view of it does not.

### Compliance Center

Framework and certification data already exists and is reasonably mature.

| Building block | Status | Evidence |
|---|---|---|
| `frameworks`, `framework_requirements`, `framework_mappings` tables | EXISTS | `supabase/migrations/202606180001_batch_21_core_data_platform.sql` (per PR #7's `TRUST_OS_EXISTING_TABLES_MAP.md`) |
| `FrameworkRegistry` | EXISTS | `packages/framework-engine/src/FrameworkRegistry.ts`, re-exported via `packages/framework-engine/src/index.ts` |
| Coverage/readiness calculation | EXISTS (internal) | `FrameworkService` (per `packages/services/src/factory.ts`) |
| Certification badge / public attestation record | MISSING | No `certifications` or equivalent public-facing table |
| Audit status visible externally | MISSING | `audits` table is tenant-internal and RLS-scoped, no public projection |

**Verdict: EXTEND.** Internal framework intelligence is solid; nothing projects it externally as a badge/status.

### Documentation Center

| Building block | Status | Evidence |
|---|---|---|
| Policy data / coverage calculator | EXISTS (internal) | `packages/policies/src/index.ts` — `PolicyManagementEngine.coverage()` |
| `policy_attestations` table | EXISTS | Referenced in PR #9's evidence-os reuse table |
| Document visibility/publishing concept (public / NDA / private) | MISSING | No `visibility`, `is_public`, or similar field anywhere in `packages/policies/src` or `packages/evidence/src` |
| Document versioning for external consumption | MISSING | No version-pinning concept for a published artifact |

**Verdict: BUILD**, on top of existing policy data — the publishing/gating layer is genuinely new.

### Evidence Center

| Building block | Status | Evidence |
|---|---|---|
| `evidence`, `evidence_collections`, `control_evidence`, `evidence_reviews` tables | EXISTS | PR #9 reuse table; confirmed present in `supabase/migrations` |
| `EvidenceManagementEngine` / `AutonomousEvidenceEngine` health states | EXISTS | `packages/evidence/src/index.ts` |
| Evidence Taxonomy (10 types) | EXISTS (doc, PR #9) | `EVIDENCE_TAXONOMY.md` |
| "Safe to expose externally" classification per evidence type | MISSING | Taxonomy doc does not pre-mark types; no field for it |
| Redaction/summarization mechanism | MISSING | No such concept in `packages/evidence/src` |

**Verdict: EXTEND.** Evidence OS (PR #9) is the substrate; Trust Center OS adds an external-exposure policy layer on top, it does not duplicate storage.

### AI Security Assistant

| Building block | Status | Evidence |
|---|---|---|
| Questionnaire Response Engine, "cite evidence, no hallucination" rule | EXISTS (doc, PR #8) | `QUESTIONNAIRE_RESPONSE_ENGINE.md` |
| Confidence Scoring Model | EXISTS (doc, PR #8) | `CONFIDENCE_SCORING_MODEL.md` |
| Customer-facing (unauthenticated/external) chat surface | MISSING | No chat UI or endpoint anywhere in `apps/web/app` |
| External-safe evidence/control citation set | MISSING | Depends on Evidence Center's exposure classification (above), which doesn't exist yet |

**Verdict: EXTEND.** This is explicitly a re-application of the Questionnaire Response Engine's citation rule to a new, externally-facing channel — not a new AI pattern.

### Customer Assurance Portal

| Building block | Status | Evidence |
|---|---|---|
| Internal Evidence Request Workflow (Request → Assign → Collect → Review → Approve → Map) | EXISTS (doc, PR #9) | `EVIDENCE_REQUEST_WORKFLOW.md`, `evidence_requests` table |
| External party identity concept (prospect/customer/auditor, not a tenant user) | MISSING | `RbacEngine.can()` requires `subject.user.tenantId === tenantId` — no external-subject concept |
| NDA-gated access-request → approval → time-limited-grant lifecycle | MISSING | Nothing approximates this anywhere |
| Anonymous/external RLS or token-based access pattern | MISSING | Every RLS policy in `supabase/migrations` follows `tenant_id = current_tenant_id()`, which assumes an authenticated tenant session |

**Verdict: BUILD.** The internal Evidence Request Workflow is a useful structural template (same stage shape) but is explicitly internal-to-tenant; nothing in it serves an external requester.

## Finding 4 — RBAC and RLS have no external-party concept yet

`packages/governance-engine/src/rbac/RbacEngine.ts` defines 13 internal roles (Platform
Owner, Platform Admin, Governance Manager, Risk Manager, Compliance Manager, Tenant Admin,
Organization Admin, GRC Manager, Auditor, Analyst, Risk Analyst, Compliance Analyst,
Consultant, Learner, Viewer) and an `RbacResource` union of
`tenant | users | settings | projects | frameworks | assets | risks | controls | evidence | tasks | learning | reports`.
None of this models an external visitor. Every RLS policy in `supabase/migrations`
follows the pattern `using (tenant_id = current_tenant_id())` /
`with check (tenant_id = current_tenant_id())`, which assumes a server-side session that
has already resolved a `tenant_id` — there is no anonymous-viewer or signed-token RLS
pattern anywhere in the codebase today (see `TRUST_CENTER_ACCESS_CONTROL_MODEL.md`,
Batch 39, for the design that closes this gap without inventing a parallel auth system).

## Summary verdict

| Section | Verdict | Genuinely new work |
|---|---|---|
| Security Overview | EXTEND | Externally-safe scoring projection only |
| Compliance Center | EXTEND | Certification/badge + audit-status projection |
| Documentation Center | BUILD (on existing data) | Publishing/gating/versioning layer |
| Evidence Center | EXTEND | Exposure classification + redaction layer |
| AI Security Assistant | EXTEND | External channel + exposure-aware retrieval, reusing the existing citation rule |
| Customer Assurance Portal | BUILD | Access-request lifecycle + external identity concept |

Across all six sections, **no section requires new governance/risk/control/evidence
storage** — every section is either a read-projection over existing tables (PR #7
Trust Score, PR #9 Evidence) or a thin new layer (publishing, access-request, exposure
classification) that should sit beside, not duplicate, the existing data model. See
`TRUST_CENTER_REUSE_MATRIX.md` for the per-entity Reuse/Extend/Build classification and
`TRUST_CENTER_DATA_MODEL.md` for the new entities this implies.
