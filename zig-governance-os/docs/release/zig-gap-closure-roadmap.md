# Zig Gap Closure Roadmap

## Purpose

The gap closure roadmap translates the platform gap analysis into dependency-aware execution planning. It prevents Zig from overbuilding visible features while underbuilding enterprise operating capabilities.

Source: `docs/product/gap-analysis.md`.
Closure plan: `docs/product/gap-closure-plan.md`.

## Guiding Rule

Do not implement gap capabilities as isolated features. Each gap must attach to the Governance Graph, tenant model, audit layer, service layer, and release gates.

## Foundational Gap Closure Waves

### Wave 1: MVP-Enabling Platform Gaps

These should be designed during Track 1 because they affect controls, evidence, audits, score, and Mission Control.

| Capability | Why It Matters | Dependency |
|---|---|---|
| Workflow OS | approvals, escalations, automation, task routing | Batch 21A/21B, 22, 23 |
| Document Management | evidence, policies, reports, retention | Batch 21A/21B, 22, 26 |
| Policy Management | ISO/SOC2 customer requirement | Document Management, Workflow OS |
| Issue Management | findings, nonconformities, corrective actions | Batch 27 Assessment & Audit |
| Notification Hub | reminders, approvals, task digests | Workflow OS, Identity |

### Wave 2: Enterprise GRC Completeness

These should be planned after core MVP workflows are stable.

| Capability | Why It Matters | Dependency |
|---|---|---|
| Vendor Risk | third-party governance and assessments | Asset, Risk, Evidence, Assessment |
| Incident Management | ISO/SOC2/HIPAA/NIST operational requirement | Risk, Control, Evidence, Workflow |
| Business Continuity & DR | high-value governance domain | Asset, Risk, Scenario, Assessment |
| Enterprise Search | cross-platform usability | Governance Graph and Data Platform |
| Data Import / Export | onboarding and migrations | Data Platform and Repository Layer |

### Wave 3: SaaS And Scale

These support enterprise adoption and operations.

| Capability | Why It Matters | Dependency |
|---|---|---|
| API Platform | customer integrations and automation | Identity, RBAC, service layer |
| Integration Hub | Microsoft, Google, Okta, Jira, Slack, cloud providers | API Platform, Workflow OS |
| Observability Platform | production operations and agent monitoring | Deployment Architecture |
| Billing Platform | commercial SaaS operations | Identity and tenant subscription model |
| Deployment Architecture | environments, CI/CD, backups, secrets, DR | Production hardening |

### Wave 4: Strategic Intelligence

These support long-term moat and enterprise maturity.

| Capability | Why It Matters | Dependency |
|---|---|---|
| Customer Success Platform | onboarding, adoption, renewal readiness | Product Analytics, Billing |
| Governance Data Lake | benchmarking and industry insights | Mature tenant data and privacy model |
| Product Analytics | adoption, dropoff, learning/scenario analytics | Observability and event model |
| Multi-Language Platform | regional enterprise support | Localization strategy |
| Mobile Experience | audit and evidence collection workflows | Stable web workflows |

## Top 10 Roadmap Additions

The roadmap must now include these ten foundational capabilities:

```text
Workflow OS
Policy Management
Document Management
Vendor Risk
Incident Management
Issue Management
Integration Hub
API Platform
Observability Platform
Billing Platform
```

## Relationship To Current Execution Tracks

Track 1 remains the immediate execution priority. Gap capabilities should be introduced only when they unblock or harden Track 1:

- Workflow OS should be documented before approvals and Mission Control become real.
- Document and Policy Management should be documented before Evidence and Audit become production workflows.
- Issue Management should be documented before Assessment & Audit.
- API, Integration, Observability, and Billing should not distract from MVP coding, but their architecture should be acknowledged before production hardening.

## Required Documentation Before Implementation

Each gap capability requires:

- PRD update or module justification
- Architecture doc
- Domain model update
- Data model update
- Security and tenant isolation notes
- Acceptance criteria
- Implementation report template

## Open Decision

Some gap capabilities may become first-class modules; others may remain platform services. The decision must be made per capability before implementation, using PRD and ADR updates.

## Inserted Closure Batches

The closure plan inserts:

```text
23A Knowledge Graph Engine
24A Workflow Operating System
24B Policy Management
24C Vendor Risk Management
24D Incident Management
24E Issue Management
24F Governance Program Management
24G Strategy & Objectives Engine
24H Regulatory Change Management
24I Control Testing Engine
24J Maturity Model Engine
24K Runtime OS
24L Advanced Automation Platform
29A Advanced Dashboard & Analytics Platform
```

These batches must not be implemented until their prerequisite platform layers are complete and their module/architecture docs exist.
