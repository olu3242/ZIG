# Framework Relationship Maps

> Content spec only — no rendering, no code, no schema change.

## Purpose
Generalize the ISO/NIST/SOC 2 crosswalk pattern to **any two (or more) in-scope
frameworks**, so learners understand crosswalking as a repeatable technique, not a
one-off fact about three specific frameworks. This is the detail file for the asset already
indexed in `FRAMEWORK_MAP_LIBRARY.md` under `## Compliance` as **"Framework Crosswalk Table
(general)"**.

## Visual structure
Same shape as the ISO/NIST/SOC2 crosswalk, but with framework columns left as variables
rather than fixed:

| Control Intent | Framework A: Control Family | Framework A: Citation | Framework B: Control Family | Framework B: Citation |
|---|---|---|---|---|
| (any control statement) | (e.g. Access Control) | (e.g. specific clause/ID) | (e.g. corresponding family) | (e.g. specific clause/ID) |

Worked instantiations:
- ISO 27001 ↔ SOC 2 (used for CloudPay scenario)
- NIST CSF ↔ CIS Controls
- HIPAA ↔ PCI DSS

The teaching point: the table's *shape* never changes — only which two framework columns
are populated. A learner who masters this general table can build a crosswalk for any pair
of frameworks the platform supports, including ones not yet covered by a named library
asset.

## Used by
- `compliance/01_COMPLIANCE_FOUNDATIONS.md` (per `FRAMEWORK_MAP_LIBRARY.md`)

## Reconciliation
This is a description of the **general pattern** behind `FRAMEWORK_MAP_LIBRARY.md`'s
"Framework Crosswalk Table (general)" entry — it generalizes (rather than replaces) the
specific "ISO ↔ NIST ↔ SOC 2 Crosswalk" entry: the crosswalk is one fixed instantiation of
this general two-framework pattern. No new library entry is implied; this file cross-references
the existing one.
