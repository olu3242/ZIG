# Framework Map Library

Cross-framework crosswalk tables — the visual proof that one control can satisfy multiple
frameworks, reinforcing CLAUDE.md's "frameworks are metadata, never hardcoded per-module"
rule. Indexed per `VISUAL_LEARNING_STANDARD.md`.

## Compliance
| Map | Used by | Maps |
|---|---|---|
| ISO ↔ NIST ↔ SOC 2 Crosswalk | `compliance/02_*`, `03_*` | ISO 27001 Annex A control ↔ NIST CSF subcategory ↔ SOC 2 Trust Services Criterion, one row per equivalent control intent |
| Framework Crosswalk Table (general) | `compliance/01_COMPLIANCE_FOUNDATIONS.md` | Any two in-scope frameworks' control families side by side |

## Security Governance
| Map | Used by | Maps |
|---|---|---|
| Control Coverage Matrix | `security_governance/02_*`, `04_*` | Control ↔ every framework it satisfies, with rationale per mapping (backs `ControlMapping` /
`ControlService.findMappings`) |

## Scenario compliance coverage
| Map | Scenario | Maps |
|---|---|---|
| CloudPay ISO 27001 ↔ SOC 2 Crosswalk | `docs/scenarios/CLOUDPAY.md` | CloudPay's existing two controls mapped across both target frameworks |

## Backing data
Crosswalk content is authored against `ControlMapping` records (real, backs
`ControlService.findMappings`) — these maps are a visual rendering of that mapping data,
not a new schema.

## What this wave does NOT do
Does not add new framework-pair mapping tables to the database. The crosswalk is a
teaching visualization of existing `ControlMapping` rows.
