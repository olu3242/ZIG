# 03_EVIDENCE_SAMPLING

## Objectives
- Apply a sampling methodology to evidence collection instead of reviewing 100% of records.
- Determine sample size based on control criticality and population size.
- Document a sampling rationale an auditor would accept.

## Business Context
Full-population evidence review doesn't scale — this lesson trains defensible sampling,
directly feeding `EvidenceService`-backed evidence requests.

## Scenario Mapping
HealthBridge (`docs/scenarios/HEALTHBRIDGE.md`) — sample its requested "Q1 Access Review
Export" evidence rather than reviewing every access log entry.

## Framework Mapping
Trains on `Evidence.status` (missing/requested/submitted/approved) and sampling theory
applied on top of it.

## Diagram Requirements
- Evidence Collection Workflow diagram
- Sampling methodology decision diagram (sample size vs. population/criticality)

## Knowledge Check
1. What two factors determine an appropriate evidence sample size?
2. Why must a sampling rationale be documented, not just the sample itself?

## Artifact Produced
None directly; sampling output feeds the Audit Report in 05_AUDIT_REPORTING.

## Visual Assets Required
- Evidence Collection Workflow Diagram
- Sampling Methodology Decision Diagram
