# Governance Graph

## Purpose

The Governance Graph is the canonical operating model for Zig after the feature batches reach critical mass. It prevents the product from becoming a set of disconnected modules by requiring every record to participate in one connected governance graph.

Zig is not a dashboard collection. Zig is a graph of governance work: who owns it, what it affects, what proves it, what improves it, and what it teaches.

## Graph Nodes

Every major entity becomes a node:

| Node | Job |
|---|---|
| Tenant | Boundary for identity, data isolation, settings, subscription, and branding |
| Project | Governance initiative inside a tenant |
| Framework | Metadata model for requirements, mappings, coverage, and readiness |
| Control | Operational commitment that reduces risk and satisfies framework requirements |
| Asset | Governed business, technology, process, vendor, data, or facility object |
| Risk | Threat and exposure attached to assets and treated through controls |
| Evidence | Proof that a control exists, operates, or has been reviewed |
| Task | Assigned action generated from gaps, recommendations, reviews, or workflows |
| Assessment | Structured evaluation of readiness, maturity, controls, or learning |
| Audit | Formal review of scope, evidence, findings, and remediation |
| Learning | Training content, labs, paths, and certifications tied to operational gaps |
| Scenario | Simulated governance situation that generates decisions and outcomes |
| Governance Score | Explainable metric generated from graph health |
| Recommendation | Actionable guidance generated from graph gaps and intelligence |

## Required Relationships

The minimum graph spine is:

```text
Tenant -> Project -> Asset -> Risk -> Control -> Framework -> Evidence -> Task
```

The convergence graph extends that spine:

```text
Evidence -> Audit -> Finding -> Task
Learning -> Scenario -> Assessment -> Governance Score -> Recommendation -> Task
Risk -> Control -> Evidence -> Assessment -> Audit Readiness
Framework -> Control -> Evidence -> Certification Readiness
```

## Invariants

- Every node is tenant-scoped.
- Operational records are project-scoped unless they are tenant configuration, framework metadata, or marketplace content.
- No feature may create an orphan record.
- Every AI-generated record must include reason, confidence, supporting data, and framework references where applicable.
- Every recommendation must be traceable to at least one graph gap or graph signal.
- Governance Score must be explainable from graph inputs, not manually entered.

## Graph Uses

The graph powers:

- AI Coach context
- AI Command execution
- Mission Control widgets
- Executive Reporting
- Learning recommendations
- Scenario scoring
- Audit readiness
- Certification readiness

## Acceptance Criteria

- A user can inspect any major record and see its upstream and downstream relationships.
- Mission Control can summarize graph health without custom per-module aggregation.
- AI Coach can answer why a recommendation exists using graph evidence.
- Executive Reporting can generate from live graph records.
- No workflow ends without creating, updating, or resolving graph state.
