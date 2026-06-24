# Evidence Center Model (Batch 36)

## Purpose

Evidence Center is the customer-facing subset of Evidence OS (PR #9, batches 21-30).
This document is explicit about reconciliation with `EVIDENCE_HEALTH_MODEL.md` and
`EVIDENCE_TAXONOMY.md` — it does not redefine evidence types, health states, or scoring;
it adds an exposure-safety classification on top, which is the gap the audit (Batch 31)
found: *"the taxonomy doesn't pre-mark types 'safe to expose' — Trust Center OS must add
that judgment itself."*

## Reconciliation with EVIDENCE_TAXONOMY.md

PR #9 defines ten evidence types, orthogonal to domain: Policy, Procedure, Screenshot,
Report, Configuration, Certificate, Assessment, Log, Contract, Training Record. None of
these are marked safe/unsafe to expose in the source document. Evidence Center adds that
judgment here, consistent with (not contradicting) PR #9's domain mappings, where
Security/Compliance/Audit/Governance domains lean shareable and internal-Security
configuration domains do not:

| Evidence type (PR #9 taxonomy) | Typical exposure default | Rationale |
|---|---|---|
| Policy | `public` or `nda_required` | Policy text is usually marketing-safe in summary form |
| Certificate | `public` | Certificates are inherently meant to be shown to customers |
| Report | `nda_required` | Audit/assessment reports contain detail beyond a badge |
| Assessment | `nda_required` | Same reasoning as Report |
| Procedure | `nda_required` | Procedural detail can reveal operational weaknesses |
| Contract | `private` | Contracts are typically tenant/vendor-specific, not customer-facing |
| Training Record | `private` | Internal personnel data, no customer-facing value |
| Screenshot | `private` | Often contains internal system/config detail |
| Configuration | `private` | Direct operational security detail; never externally safe by default |
| Log | `private` | Raw log data is never externally safe |

These are **defaults**, not hard rules — an admin can override `exposure_tier` per
`PublishedDocument` row. The defaults exist so a tenant onboarding to Trust Center OS
gets a safe starting configuration (zero-empty-states principle: the Documentation
Center/Evidence Center admin screen pre-populates suggested exposure tiers rather than
showing a blank gating decision for every evidence item).

## Reconciliation with EVIDENCE_HEALTH_MODEL.md

PR #9 defines two health-state engines — `EvidenceManagementEngine` (6-state:
current/expired/missing/pending_review/rejected/approved) for manually-reviewed
evidence, and `AutonomousEvidenceEngine` (5-state:
fresh/current/expiring/expired/missing) for autonomously-collected evidence — plus a
separate 0-100 weighted Evidence Health Score (Freshness 30/Review 25/Usage 15/Coverage
15/Mapping 15).

Evidence Center's rule: **only evidence with a health state of `current`/`approved`
(manual) or `fresh`/`current` (autonomous) may be published.** `expired`, `missing`,
`pending_review`, `rejected`, or `expiring` evidence is automatically excluded from
external visibility, regardless of its `exposure_tier` setting on `PublishedDocument`.
This is enforced at read time by `TrustCenterService`, not by a duplicate health
calculation — it calls the existing health engines' output directly. The effect: if
evidence health degrades after publication (e.g. a certificate expires), the published
document automatically stops rendering without any manual unpublish action, closing the
exact staleness risk that a snapshot-based model would create.

## What Evidence Center shows externally

- A curated subset of `evidence` rows, surfaced as `PublishedDocument` entries with
  `source_type = evidence`.
- Evidence metadata only by default (type, title, date, associated control family via
  `PublishedControl`) — full evidence content is shown only for `public`-tier items;
  `nda_required` items show metadata plus the `summary` teaser.
- No raw evidence file/screenshot/log content is ever shown for `private`-tier or
  health-failing items, full stop.

## What Evidence Center never shows

- Evidence collection internals (`evidence_collections` membership, who collected it,
  internal review comments on `evidence_reviews`).
- Evidence Health Score numeric value (the 0-100 weighted score) — only the binary
  "currently published" / "not shown" outcome is externally visible, for the same
  reverse-engineering-risk reason Security Overview bands its score rather than showing
  it raw.
- `evidence_alerts` (PR #9) — these are internal operational signals about evidence
  going stale; never customer-facing.

## Derivation pipeline

```
evidence (existing) ──health state──> EvidenceManagementEngine | AutonomousEvidenceEngine (existing, read-only)
        │
        ▼
TrustCenterService filters to current/approved/fresh evidence only
        │
        ▼
PublishedDocument rows (source_type = evidence, admin-curated exposure_tier)
        │
        ▼
GET /trust/{slug}/evidence (public route)
```
