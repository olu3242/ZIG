# Artifact: Asset Register

## Purpose
The inventory of everything in scope for governance — systems, data stores, vendors,
facilities. Every risk, control, and evidence record traces back to an asset; this
artifact is the entry point to the Universal Governance Model chain.

## Backing Data
`AssetService` (`packages/services/src/AssetService.ts`, extends `BaseService<AssetRecord>`)
— real, exists on `main`. Each row in the register is an `AssetRecord` scoped to a
`Project`.

## Structure
- Asset name, type, owner, criticality
- Data classification / sensitivity
- Linked risks (count or references)
- Framework relevance tags

## Track
Governance, Risk

## Lesson
`docs/learning/lessons/governance/01_GOVERNANCE_FOUNDATIONS.md`,
`docs/learning/lessons/risk/01_RISK_FOUNDATIONS.md`

## Lab
Referenced as an input artifact across all 8 labs (each lab's scenario asset is drawn
from the relevant simulated company's existing `simulated_company_objects`).

## Skill
Building and maintaining a complete, criticality-ranked asset inventory.

## Career Outcome
Can stand up an asset register from scratch as the foundation of a governance program.
