# Org Chart Library

Committee structures, RACI charts (cross-referenced from `TABLE_LIBRARY.md`), and
reporting lines. Indexed per `VISUAL_LEARNING_STANDARD.md`.

## Governance
| Chart | Used by | Depicts |
|---|---|---|
| Committee Structure | `governance/02_GOVERNANCE_STRUCTURES.md`, lab `GOVERNANCE_LAB_BUILD_GOVERNANCE_CHARTER.md` | Governance committee membership, roles, reporting line to the board |
| Decision-Rights Reporting Line | `governance/04_DECISION_RIGHTS.md` | Who escalates to whom by decision severity |

## Scenario org charts
| Chart | Scenario | Depicts |
|---|---|---|
| CloudPay Organization Chart | `docs/scenarios/CLOUDPAY.md` | Leadership, GRC function, reporting lines |
| HealthBridge Organization Chart | `docs/scenarios/HEALTHBRIDGE.md` | Leadership, compliance/privacy function, reporting lines |
| RetailNova Organization Chart | `docs/scenarios/RETAILNOVA.md` | Leadership, security function, reporting lines |
| ManufacturX Organization Chart | `docs/scenarios/MANUFACTURX.md` | Leadership, OT/IT security function, reporting lines |
| GovSec Organization Chart | `docs/scenarios/GOVSEC.md` | Leadership, governance/compliance function, reporting lines |

## Backing data
Org charts are authored against each scenario's documented profile in
`docs/scenarios/*.md` — no new `org_chart` table or service is created.

## What this wave does NOT do
Does not render any chart, and does not add an organizational-hierarchy table beyond the
existing `Organization`/`Project` model.
