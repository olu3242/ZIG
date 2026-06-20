# Vendor Tier Matrix (Detail Spec)

## Purpose
Expands the existing "Vendor Tier Matrix" table from `TABLE_LIBRARY.md` with a worked
example using the RetailNova scenario. This is a content spec only — no rendering
implementation.

## Structure

| Vendor | Data Access Level | Tier | Reassessment Cadence |
|---|---|---|---|
| Vendor | Data Access Level | Tier | Reassessment Cadence |

(Same columns as the indexed library entry — reused as-is, not redefined.)

## Worked example: RetailNova

| Vendor | Data Access Level | Tier | Reassessment Cadence |
|---|---|---|---|
| Processor A | High — cardholder data (CDE) | Tier 1 | Quarterly |
| Processor B | High — cardholder data (CDE) | Tier 1 | Quarterly |
| Logistics Vendor (e.g. fulfillment) | Medium — order/shipping PII | Tier 2 | Semi-annual |
| Marketing Vendor (e.g. email platform) | Low — contact info only | Tier 3 | Annual |

This mirrors `docs/scenarios/RETAILNOVA.md`'s "Vendor Ecosystem Map," which places
Processor A and Processor B at Tier 1 due to cardholder-data access, with the remaining
logistics/marketing vendors spread across Tier 2/3 by data-access level.

## Used by
- `vendor_risk/02_*` (lesson using the base Vendor Tier Matrix)
- `docs/scenarios/RETAILNOVA.md` (worked example source)
- Cross-references `TABLE_LIBRARY.md` → "Vendor Tier Matrix"

## Reconciliation
This file does not redefine the Vendor Tier Matrix — it reuses the exact columns indexed in
`TABLE_LIBRARY.md` and adds a populated worked example (RetailNova's Processor A/B as Tier
1) so learners can see the abstract table applied to a concrete scenario already documented
elsewhere in the repo.
