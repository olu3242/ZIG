# Scenario Visualization Report

## Purpose
Reports what each of the 5 simulated-company scenarios now has visualized, and what's
honestly absent because the underlying data doesn't exist yet.

## Coverage matrix

| Scenario | Org Chart | Architecture | Vendor Map | Risk Map | Compliance Map | Control Map | Incident Flow | Audit History |
|---|---|---|---|---|---|---|---|---|
| CloudPay | ✓ | ✓ | ✓ (minimal) | ✓ | ✓ | ✓ | Gap (no incident data) | ✓ (empty by design — pre-audit) |
| HealthBridge | ✓ | ✓ | ✓ (single-vendor) | ✓ | ✓ | ✓ | Gap (pre-incident narrative) | ✓ (1 milestone: failed internal assessment) |
| RetailNova | ✓ | ✓ | ✓ (full tiered) | ✓ | ✓ | ✓ | Gap (no incident data) | ✓ (empty by design — scope undocumented) |
| ManufacturX | ✓ | ✓ | Gap (out of scope for this scenario's track anchors) | ✓ | Gap (no compliance target) | ✓ | Gap (incident happened to a peer, not ManufacturX) | Gap (no compliance target, so no audit) |
| GovSec | ✓ | ✓ | Gap (out of scope) | Gap (no seeded risk register) | ✓ | ✓ | Gap (no incident data) | Gap (no audit cadence established) |

## Why the gaps are gaps, not omissions
Every "Gap" cell above is explained in that scenario's own `docs/scenarios/*.md` file under
the relevant section heading — each one traces back to what the scenario's `Narrative` and
`Simulated objects` table actually establish. Inventing a risk register for GovSec or an
incident for CloudPay would create scenario content that contradicts the narrative used
elsewhere in the curriculum (labs, lessons), so each gap is left explicit instead.

## Richest vs. thinnest scenario
- **Richest**: RetailNova (full 8/8 minus none — every section populated, including the
  only full tiered Vendor Ecosystem Map).
- **Thinnest**: ManufacturX and GovSec (4/8 each) — both are intentionally narrow,
  reflecting their track anchors (ManufacturX: Risk/BCM-DR/Security Governance only;
  GovSec: Governance/Executive Leadership/Audit only, but with no seeded risk or incident
  data yet).

## What this wave does NOT do
Does not seed any `simulated_company_objects` rows to fill these gaps — seeding remains a
documented follow-up across every scenario doc, consistent with doc-first methodology.
