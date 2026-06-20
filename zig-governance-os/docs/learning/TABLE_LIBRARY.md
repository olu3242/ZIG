# Table Library

Structured reference/comparison tables that are not cross-framework crosswalks (see
`FRAMEWORK_MAP_LIBRARY.md`), org structures (see `ORG_CHART_LIBRARY.md`), or
heatmaps/scoring matrices (see `HEATMAP_LIBRARY.md`). Indexed per
`VISUAL_LEARNING_STANDARD.md`.

## Governance
| Table | Used by | Columns |
|---|---|---|
| RACI Chart | `governance/02_GOVERNANCE_STRUCTURES.md` | Activity, Responsible, Accountable, Consulted, Informed |

## Audit
| Table | Used by | Columns |
|---|---|---|
| Audit Timeline | `audit/01_AUDIT_FOUNDATIONS.md` | Phase, Start, End, Owner, Milestone |

## Vendor Risk
| Table | Used by | Columns |
|---|---|---|
| Vendor Tier Matrix | `vendor_risk/02_*` | Vendor, Data Access Level, Tier, Reassessment Cadence |

## Security Governance
| Table | Used by | Columns |
|---|---|---|
| MITRE Mapping Table | `security_governance/02_*` | Threat Technique (MITRE ATT&CK ID), Affected Asset, Control Mitigating It |

## BCM/DR
| Table | Used by | Columns |
|---|---|---|
| Crisis Escalation Chart | `bcm_dr/04_*` | Severity, Notify, Decision Authority, SLA |

## Scenario coverage maps
| Table | Scenario | Columns |
|---|---|---|
| CloudPay Compliance Coverage Map | `docs/scenarios/CLOUDPAY.md` | Framework, Control Count, Evidence Status, Gap |
| HealthBridge Compliance Coverage Map | `docs/scenarios/HEALTHBRIDGE.md` | Framework, Control Count, Evidence Status, Gap |
| RetailNova Compliance Coverage Map | `docs/scenarios/RETAILNOVA.md` | Framework, Control Count, Evidence Status, Gap |
| ManufacturX Compliance Coverage Map | `docs/scenarios/MANUFACTURX.md` | Framework, Control Count, Evidence Status, Gap |
| GovSec Compliance Coverage Map | `docs/scenarios/GOVSEC.md` | Framework, Control Count, Evidence Status, Gap |

## What this wave does NOT do
Does not populate these tables with live data — they are teaching templates filled with
each scenario's documented facts, not a query against a live database.
