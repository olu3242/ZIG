# Documentation Center Model (Batch 35)

## Purpose

Documentation Center is where a tenant publishes policies, procedures, and other
governance documents for prospects/customers to browse, with explicit per-document
gating. The audit (Batch 31) classified this as **BUILD on existing data** — the
publishing/gating/versioning layer is genuinely new, but the document content itself
already exists in `policy_attestations` and `evidence`.

## Source content

Two existing sources feed `PublishedDocument` (Batch 32):

| Source | Existing table/engine | What it provides |
|---|---|---|
| Policies/procedures | `policy_attestations`, `PolicyManagementEngine.coverage()` | Internal policy text, attestation status, coverage percentage |
| Evidence-classified documents | `evidence` (Policy, Procedure, Report, Certificate, Assessment types per `EVIDENCE_TAXONOMY.md`, PR #9) | Anything uploaded/collected as evidence that is document-shaped |

Documentation Center does not introduce a third document store. An admin publishing a
document selects an existing `policy_attestations` row or `evidence` row and creates a
`PublishedDocument` pointing at it (`source_type` discriminator, Batch 32).

## Gating model — three tiers

| `exposure_tier` | Who can view | Use case |
|---|---|---|
| `public` | Anyone, no identity required | Security policy summaries, subprocessor list, marketing-safe overviews |
| `nda_required` | `Visitor` with an `approved` `AccessRequest` covering this document, within `grant_expires_at` | Full audit reports, detailed pen-test summaries, incident response runbooks |
| `private` | Never shown on `/trust` at all | Anything the tenant has chosen not to publish — this tier exists so an admin can stage documents before deciding visibility, not as a real "gated" state |

This three-tier model is intentionally simpler than `RbacEngine`'s 13-role internal
model — external visibility only ever needs to ask "public, gated-with-NDA, or not
published," never which of 13 internal roles is asking.

## Versioning

`PublishedDocument.version_label` is a **pinned, admin-set label** (e.g. "v3, reviewed
Q2 2026"), decoupled from whatever versioning (if any) exists internally on
`policy_attestations` or `evidence`. When the underlying source document is updated
internally, the published version does not change automatically — an admin must
explicitly re-publish, creating a new `PublishedDocument` row (or updating
`version_label` and `published_at` on the existing one). This prevents an internal
work-in-progress edit from silently appearing on the public Trust Center before review,
which would violate the same "explainable, intentional" principle CLAUDE.md requires of
AI-generated content.

## What is never published automatically

Nothing is published by default. Every `PublishedDocument` row requires an explicit
admin action (this is also why Documentation Center is classified BUILD, not EXTEND —
the existing `policy_attestations`/`evidence` tables have no publish flag at all, so the
gating decision is 100% new logic, even though the document content is 100% reused).

## Redaction

For `nda_required` documents, `PublishedDocument.summary` may hold a redacted/teaser
version shown to unauthenticated visitors (e.g. a table of contents or an executive
summary) while the full content remains accessible only after `AccessRequest` approval.
Redaction is manual (admin-authored `summary` text), not automated text-scrubbing —
automated redaction of arbitrary document content is out of scope for this MVP and would
require a dedicated redaction engine not justified by current scope.

## Derivation pipeline

```
policy_attestations | evidence (existing, read-only)
        │
        ▼
Admin selects a document in the Trust Center admin UI
        │
        ▼
PublishedDocument row created (exposure_tier, summary, version_label set explicitly)
        │
        ▼
GET /trust/{slug}/documentation (public route)
        │  — public tier: full content link
        │  — nda_required tier: summary only + "Request access" → Customer Assurance Portal
        │  — private tier: not rendered
```
