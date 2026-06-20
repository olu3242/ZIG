# Diagram Library

Lifecycle, flow, and architecture diagrams referenced by lessons and scenarios. Each entry
names the asset, the track/lesson(s) that require it, and what it depicts. None of these
are rendered yet — this is the indexed backlog `VISUAL_LEARNING_STANDARD.md` requires
before any lesson points to a one-off, unindexed diagram.

## Governance
| Diagram | Used by | Depicts |
|---|---|---|
| Governance Hierarchy | `governance/01_GOVERNANCE_FOUNDATIONS.md`, `02_GOVERNANCE_STRUCTURES.md` | Org → Board → Committees → GRC roles reporting structure |
| Policy Lifecycle | `governance/03_POLICY_LIFECYCLE.md` | Draft → Review → Approve → Publish → Review-cycle → Retire |

## Risk
| Diagram | Used by | Depicts |
|---|---|---|
| Risk Lifecycle | `risk/01_RISK_FOUNDATIONS.md` | Identify → Assess → Score → Treat → Monitor → Close |

## Compliance
| Diagram | Used by | Depicts |
|---|---|---|
| Control Lifecycle | `compliance/02_*` | Design → Implement → Test → Evidence → Review |

## Audit
| Diagram | Used by | Depicts |
|---|---|---|
| Audit Lifecycle | `audit/01_AUDIT_FOUNDATIONS.md` | Plan → Scope → Fieldwork → Finding → Report → Remediate |
| Evidence Collection Workflow Diagram | `audit/03_*` | Request → Collect → Validate → Link to Control |

## Vendor Risk
| Diagram | Used by | Depicts |
|---|---|---|
| Vendor Lifecycle | `vendor_risk/01_VENDOR_RISK_FOUNDATIONS.md` | Onboard → Assess → Monitor → Reassess → Offboard |
| Third-Party Risk Map | `vendor_risk/04_*` | Vendor tiers radiating risk exposure by data-access level |

## Security Governance
| Diagram | Used by | Depicts |
|---|---|---|
| Incident Lifecycle | `security_governance/03_*` | Detect → Triage → Contain → Eradicate → Recover → Lessons Learned |
| Threat Flow | `security_governance/02_*` | Threat actor → Vector → Vulnerability → Asset → Impact |

## BCM/DR
| Diagram | Used by | Depicts |
|---|---|---|
| Dependency Map | `bcm_dr/02_*` | Asset → upstream/downstream system dependencies |

## Executive Leadership
| Diagram | Used by | Depicts |
|---|---|---|
| Governance Dashboard | `executive_leadership/03_*` | Score trend + top risks + control coverage, single-pane |

## Scenario architecture diagrams
| Diagram | Scenario | Depicts |
|---|---|---|
| CloudPay Technology Architecture | `docs/scenarios/CLOUDPAY.md` | Payment processing stack, data flow, third-party integrations |
| HealthBridge Technology Architecture | `docs/scenarios/HEALTHBRIDGE.md` | PHI data flow across clinical systems |
| RetailNova Technology Architecture | `docs/scenarios/RETAILNOVA.md` | POS/e-commerce stack, payment processor integrations |
| ManufacturX Technology Architecture | `docs/scenarios/MANUFACTURX.md` | OT/IT network segmentation, SCADA topology |
| GovSec Technology Architecture | `docs/scenarios/GOVSEC.md` | Agency systems and inter-agency data exchange |

## What this wave does NOT do
Does not render any diagram. This is the named inventory a future design/UI pass builds
against.
