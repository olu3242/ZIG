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

## Search, filter, version-tracking, and download-tracking

The user's spec requires Documentation Center to explicitly support four capabilities.
None of these were explicit in the original batch beyond versioning's `version_label`
field (above) — this section makes all four concrete:

| Capability | Mechanism | New or reused |
|---|---|---|
| Search | Free-text search over `PublishedDocument.title`/`summary` (and, for `public`-tier documents only, full content) — a read-only query over the existing `PublishedDocument` projection, no new search index/service required at MVP scale (a Postgres `ilike`/`tsvector` query against the existing table is sufficient; a dedicated search engine is not justified by current scope) | New query, existing table |
| Filter | Filter by `source_type` (policy vs. evidence-derived), framework (via the existing `framework_mappings` join, surfaced as a filter chip per framework — e.g. "show only SOC 2 documents"), and `exposure_tier` (public-only view vs. "show what requires NDA too," which is itself useful context for a visitor deciding whether to start an `AccessRequest`) | New query parameters over existing columns/joins |
| Version-tracking | `PublishedDocument.version_label` (already defined above) plus a visible **version history** list: every time an admin re-publishes (per the "Versioning" section above, which creates a new `PublishedDocument` row or updates `version_label`/`published_at`), prior versions remain queryable by `trust_center_profile_id` + document lineage, rendered as a simple "Version history" expandable list per document — not a diffing UI, just an ordered list of past `version_label`/`published_at` pairs | Extends the existing versioning model with a read view, no new table |
| Download-tracking | Every document view/download by a `Visitor` (or anonymous session) is logged as an `AssistantInteraction`-shaped event — reusing the same logging discipline `AI_SECURITY_ASSISTANT_MODEL.md` already applies to `AssistantInteraction`, applied here to document downloads (`document_id`, `visitor_id?`, `downloaded_at`). This feeds `TRUST_CENTER_PORTAL_ANALYTICS.md`'s "document downloads" metric directly — see that document for the analytics rollup | New logging table/event, same pattern as `AssistantInteraction` |

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

## Privacy content note (referenced from the IA tree)

`TRUST_CENTER_OS_MVP.md`'s 9-section IA tree lists "Privacy" as a top-level node. Privacy
content (privacy policy, data-handling disclosures, data subject rights process) is
rendered through this exact `PublishedDocument` pipeline — a `policy_attestations` row
(privacy policy) published with `exposure_tier = public` by convention. No separate
content model or table is introduced for Privacy; it is Documentation Center content
surfaced at a dedicated top-level nav position rather than nested under a generic document
list, per the user's explicit 9-section IA requirement.

## Visual Learning Standard compliance

Per the cross-cutting Visual Learning Standard (`TRUST_CENTER_OS_AUDIT.md`), Documentation
Center satisfies the requirement via its **document coverage/version-history view** above
(an ordered list functioning as a lightweight coverage map of what's published vs.
superseded) plus the **filter-by-framework** chips, which double as a minimal framework
crosswalk for documentation specifically.

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
