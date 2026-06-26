# Workflow Library

Step-sequence workflows (process flows distinct from lifecycle diagrams — these show a
single end-to-end procedure, not a recurring cycle). Indexed per `VISUAL_LEARNING_STANDARD.md`.

## Governance
| Workflow | Used by | Steps |
|---|---|---|
| Decision Escalation Workflow | `governance/04_DECISION_RIGHTS.md` | Decision raised → severity classified → routed to owner per decision-rights matrix → approved/escalated |

## Risk
| Workflow | Used by | Steps |
|---|---|---|
| Risk Treatment Workflow | `risk/04_*` | Risk scored → treatment option selected (accept/mitigate/transfer/avoid) → owner assigned → tracked to closure |

## Audit
| Workflow | Used by | Steps |
|---|---|---|
| Finding Escalation Workflow | `audit/04_*` | Finding identified → severity assigned → routed to control owner → corrective action plan → re-test → closure |

## Vendor Risk
| Workflow | Used by | Steps |
|---|---|---|
| Vendor Assessment Workflow | `vendor_risk/03_*` | Due diligence → questionnaire sent → responses scored → data-access multiplier applied → tier assigned → monitoring cadence set |

## Security Governance
| Workflow | Used by | Steps |
|---|---|---|
| Vulnerability Management Workflow | `security_governance/02_*` | Scan → triage → prioritize (CVSS + asset criticality) → remediate → verify → close |

## BCM/DR
| Workflow | Used by | Steps |
|---|---|---|
| BIA Workflow | `bcm_dr/02_*` | Identify critical process → quantify downtime cost over time → derive RTO/RPO → identify single points of failure |
| Recovery Workflow | `bcm_dr/04_*` | Disruption declared → failover initiated → recovery validated against RTO/RPO → stand-down |

## Executive Leadership
| Workflow | Used by | Steps |
|---|---|---|
| Board Reporting Flow | `executive_leadership/05_*` | Score decomposed → business-language translation → roadmap built → delivery → Q&A |
| Strategic Risk Reporting Workflow | `executive_leadership/02_*` | Risk register filtered to board-relevant items → severity re-framed in business terms → included in report |

## Scenario assessment workflows
| Workflow | Scenario | Steps |
|---|---|---|
| Vendor Ecosystem Assessment Workflow | `docs/scenarios/RETAILNOVA.md` | Map vendor ecosystem → tier by data access → assess each → aggregate ecosystem risk |

## What this wave does NOT do
Does not implement workflow execution/automation. These are teaching workflows, not
product workflow-engine specs.
