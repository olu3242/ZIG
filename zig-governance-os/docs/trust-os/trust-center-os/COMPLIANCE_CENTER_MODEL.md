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

## The 8 frameworks Compliance Center must name explicitly

The user's spec requires Compliance Center to explicitly name 8 frameworks. Confirmed
directly against `packages/framework-engine/src/FrameworkRegistry.ts` (read for this
reconciliation pass): the `FrameworkCode` union currently contains exactly
`ISO27001 | NIST_CSF | SOC2 | HIPAA | PCI_DSS | CIS_CONTROLS` — **six** registered
frameworks. ISO 42001, NIST AI RMF, and GDPR are **not present** in `FRAMEWORK_REGISTRY`
today.

| # | Framework | Status in `FrameworkRegistry.ts` (verified this pass) |
|---|---|---|
| 1 | SOC 2 | EXISTS — `FRAMEWORK_REGISTRY.SOC2` |
| 2 | ISO 27001 | EXISTS — `FRAMEWORK_REGISTRY.ISO27001` |
| 3 | ISO 42001 | **MISSING** — no AI-management-system framework entry exists yet; this is the AI-governance-specific gap the user's spec calls out explicitly. Compliance Center's IA must name it regardless, with its readiness badge withheld (per the publish-threshold rule below) until a `FRAMEWORK_REGISTRY` entry and corresponding `frameworks` row exist. Naming the framework in the IA does not require its registry entry to exist first — the IA names what the product supports or intends to support; the badge only renders once readiness data exists. |
| 4 | NIST CSF | EXISTS — `FRAMEWORK_REGISTRY.NIST_CSF` |
| 5 | NIST AI RMF | **MISSING** — no AI Risk Management Framework entry exists; same treatment as ISO 42001 above (named in IA, badge withheld until registry/readiness data exists) |
| 6 | HIPAA | EXISTS — `FRAMEWORK_REGISTRY.HIPAA` |
| 7 | PCI DSS | EXISTS — `FRAMEWORK_REGISTRY.PCI_DSS` |
| 8 | GDPR | **MISSING** — no `frameworks` row or `FrameworkRegistry` entry for GDPR exists today; same treatment as the two AI frameworks above |

CIS Controls (already in `FrameworkRegistry`) is not one of the 8 the user's spec names
explicitly, but its existing registry entry and any published certification remain
visible through the general framework-readiness mechanism below — this document does not
remove existing coverage, it only ensures the 8 specifically named frameworks are
explicitly represented in Compliance Center's IA, with ISO 42001 the standout addition
since AI governance is core to this platform per CLAUDE.md's AI Command Center section.
Adding the three missing `FrameworkRegistry` entries and corresponding `frameworks` seed
rows is **out of scope for this documentation batch** (no application code or migrations
are introduced here) — it is flagged as a prerequisite implementation gap that whichever
Fable phase implements Compliance Center must close before all 8 badges can actually
render.

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

## Visual Learning Standard compliance

Per the cross-cutting Visual Learning Standard (`TRUST_CENTER_OS_AUDIT.md`), Compliance
Center satisfies the requirement via its **compliance matrix** (the per-framework
readiness/certification badge table above) and a **framework crosswalk** view, where the
existing `framework_mappings` rollup (internal) is presented externally only as the
banded per-framework status, never the per-requirement mapping detail itself.

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
