# Trust Center Data Model (Batch 32)

## Principle

Every entity here either reads from an existing table (PR #7 governance/trust scoring,
PR #8 questionnaire/response, PR #9 evidence) or is new because nothing in the codebase
addresses external publication/access. New tables are kept to the minimum required to
gate and audit external visibility — Trust Center OS does not re-store governance, risk,
control, or evidence data.

All new tables are tenant-scoped (`tenant_id`) and follow the existing RLS convention
(`docs/data/RLS_STRATEGY.md`) for **internal/admin** reads and writes. External/anonymous
reads are served through a separate, narrower access path (see
`TRUST_CENTER_ACCESS_CONTROL_MODEL.md`, Batch 39) — never by relaxing the standard
`tenant_id = current_tenant_id()` policy.

## New entities

### `TrustCenterProfile`

One per tenant. The root configuration object for the public `/trust` surface.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK → `tenants.id`; unique (one profile per tenant) |
| `slug` | text | Public URL segment, e.g. `/trust/acme-corp`; unique |
| `display_name` | text | Public-facing company name |
| `is_published` | boolean | Master on/off switch; if false, `/trust/{slug}` 404s |
| `sections_enabled` | jsonb | Per-section booleans for the 6 sections (a tenant may publish Security Overview without Documentation Center, etc.) |
| `contact_email` | text | For access requests routed through the Customer Assurance Portal |
| `created_at`, `updated_at`, `published_at` | timestamptz | |

### `PublishedDocument`

A pointer from an internal document (policy, procedure, or other evidence-classified
artifact) to its externally-visible representation. Does **not** duplicate document
content — it references the existing source and carries publication metadata only.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK → `tenants.id` |
| `trust_center_profile_id` | uuid | FK → `TrustCenterProfile.id` |
| `source_type` | text | `policy_attestation` \| `evidence` — which existing table this points to |
| `source_id` | uuid | FK into `policy_attestations.id` or `evidence.id`, polymorphic by `source_type` |
| `exposure_tier` | text | `public` \| `nda_required` \| `private` (see Batch 35/39) |
| `title` | text | Public-facing title (may differ from internal document name) |
| `summary` | text | Optional redacted/summarized version for `nda_required` items shown as a teaser |
| `version_label` | text | Pinned version shown publicly, decoupled from internal document churn |
| `published_at`, `unpublished_at` | timestamptz | |

### `PublishedControl`

The externally-visible representation of a control family or individual control,
feeding the Security Overview and Compliance Center.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK → `tenants.id` |
| `trust_center_profile_id` | uuid | FK |
| `control_family` | text | e.g. "Access Control", "Encryption", "Incident Response" — a grouping label, not a 1:1 mirror of internal `controls` rows |
| `source_control_ids` | uuid[] | FK references into `controls.id`; the family is a rollup of one or more internal controls |
| `public_summary` | text | Plain-language description; never internal control implementation detail |
| `status` | text | `implemented` \| `in_progress` \| `not_applicable` — derived, never finer-grained than this externally |

### `PublishedCertification`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK |
| `trust_center_profile_id` | uuid | FK |
| `framework_id` | uuid | FK → `frameworks.id` (reuse, not duplicate) |
| `certification_name` | text | e.g. "SOC 2 Type II", "ISO 27001:2022" |
| `issuer` | text | Certifying body / auditor name |
| `issued_at`, `valid_through` | date | |
| `badge_url` | text | Optional asset link |
| `report_published_document_id` | uuid | FK → `PublishedDocument.id`, nullable — links the badge to the gated audit report if one is published |

### `AccessRequest`

The Customer Assurance Portal's external access-request lifecycle. Explicitly distinct
from the internal `evidence_requests` table (PR #9) — that table tracks an internal
owner collecting evidence for a control; this table tracks an **external party**
requesting to view gated content.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK — the tenant whose Trust Center is being accessed |
| `trust_center_profile_id` | uuid | FK |
| `requester_id` | uuid | FK → `Visitor.id` (below) |
| `requested_document_ids` | uuid[] | FK references into `PublishedDocument.id` where `exposure_tier = 'nda_required'` |
| `status` | text | `pending` \| `nda_required` \| `nda_signed` \| `approved` \| `denied` \| `expired` |
| `nda_signed_at` | timestamptz | nullable |
| `approved_by` | uuid | FK → internal `users.id` (the tenant admin/GRC manager who approved) |
| `grant_expires_at` | timestamptz | Time-limited grant — null until approved |
| `created_at`, `updated_at` | timestamptz | |

### `Visitor`

The external-identity concept the audit (Batch 31, Finding 4) found missing. Not a
tenant user, not an `RbacEngine` subject — a lightweight record for anyone who requests
gated access or uses the AI Security Assistant.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `email` | text | Required for any access request; not required to view fully public sections |
| `company_name` | text | Self-reported |
| `verified_at` | timestamptz | Set once email verification completes (required before NDA flow starts) |
| `created_at` | timestamptz | |

### `SubprocessorDisclosure`

A common Trust Center convention (vendor/subprocessor list shown to customers).
Reuses the existing `vendors` table rather than re-modeling vendor data.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK |
| `trust_center_profile_id` | uuid | FK |
| `vendor_id` | uuid | FK → `vendors.id` (reuse — confirmed present per PR #7's existing-tables map) |
| `purpose` | text | Public-facing description of what the subprocessor does |
| `data_categories` | text[] | What data categories the subprocessor can access |
| `is_published` | boolean | |

### `AssistantInteraction`

Log of AI Security Assistant exchanges, for the same explainability/audit reasons
`QUESTIONNAIRE_RESPONSE_ENGINE.md` requires for internal drafting.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `tenant_id` | uuid | FK |
| `visitor_id` | uuid | FK → `Visitor.id`, nullable (anonymous Q&A allowed before identity capture, gated identity required to escalate to an `AccessRequest`) |
| `question_text` | text | |
| `answer_text` | text | |
| `cited_evidence_ids` | uuid[] | FK references into `evidence.id` — empty array is valid and means "no match found," never omitted |
| `cited_control_ids` | uuid[] | FK references into `controls.id` (via `PublishedControl.source_control_ids`) |
| `confidence_score` | numeric | Same 0-100 scale and computation approach as `responses.confidence_score` (PR #8) |
| `created_at` | timestamptz | |

## Tables explicitly reused, unchanged

`tenants`, `governance_scores`, `frameworks`, `framework_requirements`,
`framework_mappings`, `controls`, `control_evidence`, `evidence`, `evidence_collections`,
`evidence_reviews`, `policy_attestations`, `vendors`, `responses` (read-only, as a
retrieval source for the AI Security Assistant), `audits`.

## What this model deliberately does not introduce

- No parallel "trust score" table — `PublishedCertification`/`PublishedControl` read
  `governance_scores` and `TRUST_SCORE_MODEL.md`'s formula at render time.
- No duplicate evidence storage — `PublishedDocument.source_id` always points back to
  `evidence.id` or `policy_attestations.id`.
- No new internal RBAC role for "customer" — `Visitor` is explicitly outside the
  `RbacEngine` subject model (see `TRUST_CENTER_ACCESS_CONTROL_MODEL.md`).
