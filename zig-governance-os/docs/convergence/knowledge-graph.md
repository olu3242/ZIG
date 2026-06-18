# Knowledge Graph

## Purpose

The Zig Knowledge Graph is the intelligence layer built on top of the Governance Graph. The Governance Graph stores operational relationships; the Knowledge Graph interprets those relationships into guidance, readiness, learning paths, scenarios, and executive insight.

## Knowledge Sources

The Knowledge Graph draws from:

- Tenant settings and risk appetite
- Project objectives and maturity level
- Framework registry and framework mappings
- Universal controls and crosswalks
- Asset criticality and dependencies
- Risk likelihood, impact, treatment, and residual exposure
- Control ownership, frequency, maturity, and effectiveness
- Evidence quality, freshness, completeness, and audit history
- Assessment responses, gaps, findings, and maturity trends
- Learning progress, lab performance, certification attempts, and scenario outcomes
- AI-generated recommendations and human approval decisions

## Knowledge Objects

| Object | Description |
|---|---|
| Gap | Missing or weak graph coverage requiring action |
| Signal | Computed indicator such as risk velocity or evidence decay |
| Insight | Human-readable interpretation of one or more signals |
| Recommendation | Actionable next step with reason, confidence, and traceability |
| Readiness State | Framework, audit, certification, or launch readiness status |
| Learning Need | Skill or knowledge gap inferred from operational performance |
| Scenario Need | Simulation recommended because the graph shows uncertainty or poor performance |

## Context Contracts

Every AI or analytics surface receives context through a graph context package:

```text
subject
tenant
project
framework scope
related graph nodes
known gaps
recent signals
permission boundary
explainability payload
```

The permission boundary is mandatory. The Knowledge Graph must never expose cross-tenant or unauthorized records through AI summaries, reports, or recommendations.

## Product Surfaces Powered

- AI Coach uses the Knowledge Graph to answer questions and explain recommendations.
- AI Command uses it to generate governed actions and route approvals.
- Mission Control uses it to rank alerts and remediation actions.
- Executive Reporting uses it to produce board-ready summaries.
- Learning OS uses it to recommend training tied to real gaps.
- Scenario Lab uses it to generate simulations from operational weaknesses.

## Explainability Standard

Every knowledge output must include:

- Source graph nodes
- Relationship path
- Reason
- Confidence
- Business impact
- Recommended action
- Expected score or readiness effect

## Acceptance Criteria

- AI Coach can cite the graph path behind an answer.
- Recommendations are never generic; they are tied to tenant/project context.
- Learning recommendations are tied to demonstrated gaps.
- Scenario recommendations are tied to risk, control, evidence, audit, or learning signals.
- Executive summaries can be traced back to underlying graph records.
