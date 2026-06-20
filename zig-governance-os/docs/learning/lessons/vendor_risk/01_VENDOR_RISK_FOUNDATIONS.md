# 01_VENDOR_RISK_FOUNDATIONS

## Objectives
- Explain why Zig models vendors as `Asset` records rather than a separate vendor table.
- Identify which vendor relationships carry the highest inherent risk.
- Distinguish vendor risk from internal asset risk in scoring approach.

## Business Context
Vendor risk is asset risk with a third party in the loop — modeling vendors as assets
keeps them inside the Universal Governance Model instead of becoming an orphaned concept.

## Scenario Mapping
RetailNova (`docs/scenarios/RETAILNOVA.md`) — its two payment-processor vendor assets.

## Framework Mapping
Trains on `Asset.category = "vendor"` and `RiskService` applied to vendor assets.

## Diagram Requirements
- Vendor Lifecycle diagram (onboarding → active → review → offboarding)
- Vendor-as-asset modeling diagram

## Knowledge Check
1. Why is a vendor modeled as an `Asset` instead of a new entity type?
2. What makes a vendor relationship higher-risk than an equivalent internal asset?

## Artifact Produced
None (foundational); first Vendor Assessment appears in 03_VENDOR_QUESTIONNAIRES_EVIDENCE.

## Visual Assets Required
- Vendor Lifecycle Diagram
- Vendor-as-Asset Modeling Diagram
