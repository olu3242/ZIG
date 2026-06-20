# 05_DISASTER_RECOVERY_TESTING

## Objectives
- Run a tabletop or live DR test against a continuity plan using a `ScenarioRun`.
- Score recovery performance against the RTO/RPO targets set in Lesson 03.
- Feed test results back into the continuity plan as improvements.

## Business Context
This closes the BCM/DR track — an untested plan (like ManufacturX's current state) is
just a document; testing is what makes it governance rather than paperwork.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — run its first tested DR failover for Plant 1.

## Framework Mapping
Trains on `ScenarioService.findRuns` and `ScenarioRun.scoreDelta`/`status`.

## Diagram Requirements
- DR test execution flow diagram
- Test-result-to-plan-improvement feedback loop diagram

## Knowledge Check
1. What does a `ScenarioRun.scoreDelta` measure in a DR test context?
2. Why must test results feed back into the continuity plan rather than just being filed away?

## Artifact Produced
BIA/continuity plan updated with test results — see `docs/artifacts/` BIA template.

## Visual Assets Required
- DR Test Execution Flow Diagram
- Test-Result-to-Plan-Improvement Feedback Loop Diagram
