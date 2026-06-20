# 04_VENDOR_RISK_SCORING

## Objectives
- Score vendor risk using the same likelihood/impact model as internal risk, with data-access as an added multiplier.
- Rank a vendor portfolio by risk score.
- Decide which vendors require enhanced ongoing monitoring.

## Business Context
Vendor scoring reuses `RiskAssessment` mechanics so a CISO can compare vendor and internal
risk on one severity scale instead of two incompatible systems.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — rank its payment processors and logistics
vendors by risk score.

## Framework Mapping
Trains on `RiskAssessment` applied to vendor `Asset` records, same `RiskSeverity` union.

## Diagram Requirements
- Vendor Third-Party Risk Model diagram
- Vendor portfolio risk ranking chart

## Knowledge Check
1. What additional factor should multiply a vendor's risk score beyond likelihood × impact?
2. How do you decide which vendors need enhanced ongoing monitoring vs. annual review?

## Artifact Produced
Vendor Assessment (scoring section) — see `docs/artifacts/` Vendor Assessment template.

## Visual Assets Required
- Vendor Third-Party Risk Model Diagram
- Vendor Portfolio Risk Ranking Chart

## Required Diagram
- Third-Party Risk Map (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram/Table instead

## Required Table
- Vendor Risk Heatmap (see `HEATMAP_LIBRARY.md`)

## Required Visual Exercise
- Plot RetailNova's payment processors and logistics vendors onto the Vendor Risk Heatmap with the data-access multiplier applied, then cross-reference against the Third-Party Risk Map to rank which vendors require enhanced ongoing monitoring.
