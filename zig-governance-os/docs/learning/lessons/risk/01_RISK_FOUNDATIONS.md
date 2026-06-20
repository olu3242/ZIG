# 01_RISK_FOUNDATIONS

## Objectives
- Define risk as a function of asset, threat, and vulnerability within the Universal Governance Model.
- Explain why every `Risk` record must reference an `Asset`.
- Distinguish inherent risk from residual risk.

## Business Context
Risk programs fail when risks float free of assets — "ransomware" is not a risk until
it's tied to a specific system with specific criticality. This lesson enforces that link.

## Scenario Mapping
ManufacturX (`docs/scenarios/MANUFACTURX.md`) — its "Flat OT/IT Network Segmentation" risk,
explicitly tied to the Plant 1/Plant 2 SCADA Network assets.

## Framework Mapping
Trains on `RiskService` and the `Risk`/`Asset` relationship (`Risk.assetId` required).

## Diagram Requirements
- Risk Lifecycle Diagram (identify → assess → treat → monitor)
- Asset-to-Risk linkage diagram

## Knowledge Check
1. Why can't a `Risk` record exist without an `assetId`?
2. What's the difference between inherent and residual risk?

## Artifact Produced
None (foundational); first Risk Register entry appears in 02_RISK_IDENTIFICATION.

## Visual Assets Required
- Risk Lifecycle Diagram
- Asset-to-Risk Linkage Diagram
