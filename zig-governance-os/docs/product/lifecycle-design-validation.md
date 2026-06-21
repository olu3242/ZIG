# Zig Governance Lifecycle Design Validation

Status: **APPROVED WITH GATES**

This document is the Phase 0 design artifact set for the Zig MVP lifecycle:

```text
CREATE -> ASSESS -> IMPROVE -> REPORT
```

No module is valid unless it contributes to this loop.

## 1. Lifecycle Traceability Matrix

| Lifecycle Stage | User Goal | Modules | Primary Entities | Required Outputs | Current Evidence |
| --- | --- | --- | --- | --- | --- |
| CREATE | Establish governance foundations | Projects, Assets, Controls | `organizations`, `projects`, `assets`, `controls`, `activities` | Project workspace, asset inventory, control library | Stage 1 schema exists; app routes exist; user-flow certification pending |
| ASSESS | Understand posture | Risks, Frameworks, Readiness | `risks`, `frameworks`, `framework_requirements`, `control_mappings` | Risk register, heatmap, readiness score, gap list | Framework metadata exists; full requirements/mapping/readiness not certified |
| IMPROVE | Move posture forward | Tasks, Recommendations, Learning Scenarios | `tasks`, `recommendations`, `scenarios`, `activities` | Remediation backlog, one-click tasks, scenario artifacts | Route/package shells exist; lifecycle-backed workflow not certified |
| REPORT | Demonstrate posture | Mission Control, Executive Reports | `reports`, lifecycle graph snapshots | Governance summary, risk report, readiness report, export | Report catalog route exists; generation/export not certified |

## 2. User Journey Maps

### Primary MVP Journey

```text
Login
  -> Dashboard
  -> Create Project
  -> Select Framework
  -> Add Asset
  -> Add Control
  -> Create Risk
  -> Measure Readiness
  -> Receive Recommendation
  -> Create Remediation Task
  -> Run Scenario
  -> Improve Score
  -> Generate Executive Report
```

### CREATE Journey

```text
Dashboard
  -> New Project
  -> Industry + Framework Focus
  -> Project Workspace
  -> Add Asset
  -> Add Control
  -> Activity Trail
```

Acceptance gate: a real onboarded user must create each object and produce activity rows.

### ASSESS Journey

```text
Project Workspace
  -> Risk Register
  -> Risk Scoring
  -> Framework Readiness
  -> Gap Explanation
```

Acceptance gate: readiness must explain what is covered, uncovered, and why.

### IMPROVE Journey

```text
Gap or Risk
  -> Health Advisor Recommendation
  -> One-click Remediation Task
  -> Owner Assignment
  -> Status Update
  -> Score Recalculation
```

Acceptance gate: every recommendation must be traceable to source data and create a task.

### REPORT Journey

```text
Mission Control
  -> Drill-down Widget
  -> Executive Report
  -> Export PDF/DOCX
  -> Audit Activity
```

Acceptance gate: report values must be generated from lifecycle records, not static catalog data.

## 3. Screen Inventory

| Screen | Lifecycle Stage | Purpose | Required Data Source | Status |
| --- | --- | --- | --- | --- |
| `/dashboard` | REPORT | Mission entry and starter dashboard | Tenant context, projects, frameworks, metrics | Partial |
| `/projects` | CREATE | Project list | `projects` | Partial |
| `/projects/new` | CREATE | Create project | `organizations`, `frameworks`, `projects` | Implemented, user-flow pending |
| `/projects/[id]` | CREATE/ASSESS | Workspace overview | `projects`, `assets`, `controls`, future risks/tasks | Partial |
| `/assets` | CREATE | Asset inventory | `assets` | Implemented, user-flow pending |
| `/controls` | CREATE | Control library | `controls` | Implemented, user-flow pending |
| `/risk` | ASSESS | Risk register | Should be `risks`; currently seeded MVP data | Partial |
| `/frameworks` | ASSESS | Framework registry/readiness | `frameworks`, future requirements/mappings | Partial |
| `/ai-command` | IMPROVE | Explainable AI operator | Future recommendation services | Partial |
| `/scenarios` | IMPROVE | Scenario-driven learning | Future `scenarios` | Partial |
| `/reports` | REPORT | Report catalog and exports | Future `reports` | Partial |
| `/mission-control` | REPORT | Single-pane lifecycle posture | Real lifecycle metrics required | Partial |

## 4. Database Design

### Certified Identity Spine

```text
auth.users
  -> profiles
  -> organization_memberships
  -> organizations
```

### Lifecycle Spine

```text
organizations
  -> projects
     -> assets
        -> risks
           -> controls
              -> evidence
                 -> tasks
                    -> reports
```

### Minimum MVP Tables

| Entity | Purpose | Lifecycle Stage | Required Before Coding |
| --- | --- | --- | --- |
| `projects` | Governance program container | CREATE | Exists |
| `assets` | Inventory and risk scope | CREATE/ASSESS | Exists |
| `controls` | Control library | CREATE/ASSESS | Exists |
| `risks` | Risk posture | ASSESS | Needed |
| `framework_requirements` | Framework metadata | ASSESS | Needed |
| `control_mappings` | Framework coverage | ASSESS | Needed |
| `evidence` | Proof of control | ASSESS/REPORT | Needed |
| `tasks` | Remediation | IMPROVE | Needed |
| `recommendations` | Health Advisor outputs | IMPROVE | Needed |
| `scenarios` | Guided practice generation | IMPROVE | Needed |
| `reports` | Executive outputs | REPORT | Needed |
| `activities` | Audit trail | All | Exists |

## 5. Framework Intelligence Design

Frameworks must remain metadata, not separate feature modules.

```text
frameworks
  -> framework_requirements
     -> control_mappings
        -> controls
```

Supported MVP frameworks:

- ISO 27001
- SOC 2
- NIST CSF
- CIS Controls
- HIPAA
- PCI DSS

Required framework services:

- Requirement lookup
- Requirement-to-control mapping
- Control coverage calculation
- Gap identification
- Readiness explanation
- Cross-framework comparison

## 6. Governance Score Design

The MVP governance score must be explainable and derived from lifecycle data.

| Component | Weight | Inputs |
| --- | ---: | --- |
| Project Foundation | 15% | Project completeness, framework selected, industry selected |
| Asset Coverage | 15% | Assets recorded, criticality/classification completeness |
| Control Coverage | 20% | Controls created, mapped, owner/status/effectiveness |
| Risk Posture | 20% | Risk count, score, treatment, residual exposure |
| Readiness | 20% | Requirement/control coverage by framework |
| Improvement Momentum | 10% | Tasks created, tasks closed, recent activity |

Score output must include:

- Numerical score
- Stage contribution
- Top three drivers
- Top three blockers
- Suggested next action

## 7. Health Advisor Design

Health Advisor is the IMPROVE layer and must never generate generic advice.

| Signal | Detection | Recommendation | One-click Action |
| --- | --- | --- | --- |
| Missing assets | Project has no assets | Add first critical asset | Create asset |
| Missing controls | Project has assets but no controls | Add baseline control | Create control |
| Missing risk assessment | Assets exist with no risks | Assess top asset risks | Create risk |
| Weak control effectiveness | Control effectiveness below threshold | Create remediation plan | Create task |
| Framework gaps | Requirement without mapped control | Map or create control | Create task/control |
| Stale evidence | Evidence expired or missing | Request evidence | Create evidence task |

Each recommendation requires severity, reason, source records, suggested action, confidence, and audit activity.

## 8. AI Governance Operator Design

The AI operator is allowed only inside governance boundaries.

Required controls:

- Tenant-scoped context only
- Source record citation
- Confidence score
- Explainable reasoning summary
- Human approval for writes
- Audit activity for generation and approval
- No direct report certification without user review

Initial operator commands:

- Generate project starter controls
- Generate risk register from assets
- Map controls to selected framework
- Explain readiness blockers
- Draft executive summary

## 9. Dashboard Architecture

Mission Control must be a drill-down dashboard, not a static card surface.

| Widget | Source | Drill-down |
| --- | --- | --- |
| Governance Score | Score service | Score explanation |
| Framework Readiness | Framework mapping service | Requirement gaps |
| Asset Coverage | `assets` | Asset inventory |
| Risk Exposure | `risks` | Risk register/heatmap |
| Control Effectiveness | `controls` | Control library |
| Open Tasks | `tasks` | Remediation queue |
| Health Advisor | `recommendations` | Recommendation detail |
| Recent Activity | `activities` | Audit timeline |

Zero empty state rule: if a record type is missing, the widget must explain the next lifecycle action and link to it.

## 10. Reporting Architecture

Reports must snapshot lifecycle posture.

MVP reports:

- Governance Summary
- Risk Report
- Framework Readiness Report
- Gap Assessment
- Executive Dashboard Report

Each report requires:

- Scope
- Source counts
- Score calculations
- Gaps and recommendations
- Timestamp
- Actor
- Export format
- Activity/audit row

PDF and DOCX exports are launch requirements, but should not be marked ready until generated artifacts are verified.

## 11. Implementation Dependency Map

```text
Identity + Tenancy
  -> CREATE tables and UI
  -> CREATE user-flow certification
  -> ASSESS schema
  -> ASSESS services
  -> ASSESS UI
  -> IMPROVE schema
  -> Health Advisor services
  -> Scenario generator
  -> REPORT schema
  -> Report generator/export
  -> Full MVP lifecycle certification
```

Hard gate: Stage 2 must not start until Stage 1 user-flow certification passes.

## 12. MVP Acceptance Criteria

MVP is accepted only when a user can complete:

```text
Create Project
  -> Create Assets
  -> Create Controls
  -> Assess Risks
  -> Measure Framework Readiness
  -> Receive Recommendations
  -> Complete Tasks
  -> Run Learning Scenario
  -> Improve Governance Score
  -> Generate Executive Report
```

Certification requirements:

- No manual database intervention
- No orphan entities
- No static placeholder dashboard metrics
- Every mutation writes an activity row
- RLS enforces tenant isolation
- Build passes
- Tests pass
- User-flow evidence exists
