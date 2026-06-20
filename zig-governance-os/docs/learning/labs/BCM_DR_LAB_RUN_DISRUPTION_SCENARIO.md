# BCM/DR Lab: Run a Disruption Scenario

## Scenario
ManufacturX (`docs/scenarios/MANUFACTURX.md`).

## Inputs
- ManufacturX's Plant 1 SCADA Network asset (no tested DR failover)
- BCM/DR track Lessons 02-05 (BIA, RTO/RPO, Continuity Plan Design, DR Testing)

## Tasks
1. Build a BIA for Plant 1, quantifying downtime cost over time.
2. Set RTO/RPO targets justified by the BIA.
3. Design a continuity plan addressing the flat OT/IT network segmentation single point of failure.
4. Run a `ScenarioRun` (tabletop) testing the plan and score the result against the RTO/RPO targets.

## Deliverables
- BIA + continuity plan + scenario run result with a scored gap-to-target.

## Scoring Rubric
| Criterion | Weight |
|---|---|
| BIA downtime-cost figures are justified, not arbitrary | 25% |
| RTO/RPO targets are derived from the BIA, not set independently | 25% |
| Continuity plan explicitly addresses the identified single point of failure | 25% |
| Scenario run result is honestly scored against target, including gaps found | 25% |

## AI Feedback Rules
ZARA reviews as **Auditor**: challenges any RTO/RPO target with no BIA justification, and
as **Mentor**: helps reframe an honest "we missed the target" result as a useful finding
rather than a failure to hide.
