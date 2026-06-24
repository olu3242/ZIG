# Compliance Center Model (Batch 34)

## Purpose

Compliance Center shows which frameworks and certifications a tenant holds, and at
what level of assurance, without exposing internal coverage gaps that a competitor or
adversary could exploit.

## Data source

Compliance Center is the public projection of:

- `frameworks`, `framework_requirements`, `framework_mappings` (existing tables,
  read-only)
- `FrameworkRegistry` (`packages/framework-engine/src/FrameworkRegistry.ts`) — the
  canonical list of supported frameworks (ISO 27001, SOC 2, NIST CSF, CIS Controls,
  HIPAA, PCI DSS, per CLAUDE.md's framework list)
- `FrameworkService`'s coverage/readiness calculation (existing, internal) — consumed
  but never re-derived
- `PublishedCertification` (new, Batch 32)

## What it shows externally

1. **Certification badges** — one per `PublishedCertification` row: framework name,
   issuer, issued date, valid-through date. A badge with an expired `valid_through`
   date is automatically hidden (not shown as "expired" — absence is safer than a
   visible lapse indicator, consistent with Security Overview's principle of not
   showing weaknesses).

2. **Framework coverage, banded** — reusing the same band logic as Security Overview
   (Batch 33) but applied to `FrameworkService`'s per-framework readiness percentage
   instead of the composite Trust Score:

   | Internal readiness % | External label |
   |---|---|
   | ≥ 95% | "Certified" / "Fully aligned" |
   | 80-94% | "In progress" |
   | below 80% | framework not listed publicly at all |

3. **Audit status** — a coarse indicator only: "Last audited [quarter/year shown, not
   exact date]" sourced from the most recent `audits` row with `status = completed`
   for that framework. Audit findings, exceptions, and management responses are never
   shown here — they live in `PublishedDocument` (the audit report itself, almost
   always `exposure_tier = nda_required`) and are reachable only via the Customer
   Assurance Portal (Batch 38).

## What it never shows

- Per-requirement mapping detail (`framework_mappings` rows) — which internal control
  satisfies which specific clause. This is exactly the kind of control-to-requirement
  detail an attacker could use to find the weakest-mapped requirement; it stays
  internal to `FrameworkService`.
- Frameworks below the publish threshold (80% readiness) are omitted entirely rather
  than shown as "not yet compliant" — silence, not a visible gap, consistent with
  Security Overview.
- Raw audit reports — gated behind `PublishedDocument.exposure_tier = nda_required`.

## Relationship to Documentation Center and Customer Assurance Portal

A `PublishedCertification` row may optionally link to a `PublishedDocument`
(`report_published_document_id`) representing the full audit report (e.g. the SOC 2
Type II report PDF). That document almost always carries `exposure_tier = nda_required`
— Compliance Center shows the badge to everyone, but clicking "request full report"
routes into the Customer Assurance Portal's `AccessRequest` flow (Batch 38), not a
direct download. This is the explicit hand-off point between Compliance Center
(always-public summary) and Documentation Center/Customer Assurance Portal
(gated detail).

## Derivation pipeline

```
frameworks / framework_mappings (existing, read-only)
        │
        ▼
FrameworkService.getReadiness(tenantId, frameworkId)   (existing, reused)
        │  — banding applied at TrustCenterService layer, same pattern as Batch 33
        ▼
PublishedCertification rows (admin-curated; a tenant must explicitly publish a
        certification — readiness alone does not auto-publish a badge, since only the
        tenant knows whether a certification audit has actually concluded)
        ▼
GET /trust/{slug}/compliance (public route)
```

Note the deliberate asymmetry with Security Overview: Security Overview's banded score
is fully automatic (derived, no admin action required, since `governance_scores` is
always live). Compliance Center's badges require an explicit admin publish action on
`PublishedCertification`, because a certification is a discrete real-world event (an
auditor issued a report) that the system cannot infer purely from internal readiness
percentages — readiness ≥ 95% means "ready for audit," not "has been audited."
