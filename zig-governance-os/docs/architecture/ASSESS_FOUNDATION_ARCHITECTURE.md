# ASSESS Foundation Architecture Package

Status: **ARCHITECTURE READY / IMPLEMENTATION LOCKED**

Gate state:

```text
CREATE  = FAIL
ASSESS  = LOCKED
IMPROVE = LOCKED
REPORT  = LOCKED
```

This package is architecture-only. It is not authorization to implement ASSESS. ASSESS implementation may begin only after CREATE certification is PASS.

## Objective

Design the ASSESS lifecycle so Zig can answer:

```text
What can go wrong?
How protected are we?
Which frameworks are covered?
How mature are we?
What gaps exist?
```

## Lifecycle Chain

ASSESS must preserve this trace:

```text
Project
  -> Asset
     -> Risk
        -> Control
           -> Framework Requirement
              -> Coverage
                 -> Readiness
                    -> Gap
```

No ASSESS object may exist outside this chain.

## Domain 1: Risk Management

### Entities

- Risk
- Risk Category
- Risk Treatment
- Risk Owner
- Risk Review

### Required Fields

| Field | Purpose |
| --- | --- |
| `risk_id` | Primary identifier |
| `organization_id` | Tenant isolation |
| `project_id` | Program scope |
| `title` | User-facing risk name |
| `description` | Risk narrative |
| `category` | Risk classification |
| `likelihood` | 1-5 scoring input |
| `impact` | 1-5 scoring input |
| `inherent_risk` | Likelihood x impact before controls |
| `residual_risk` | Remaining risk after controls |
| `owner_user_id` | Accountability |
| `status` | Open, reviewing, treated, accepted, archived |
| `treatment` | Accept, mitigate, transfer, avoid |

### Relationships

```text
Asset -> Risk
Risk -> Control
```

Both relationships are many-to-many.

### Capabilities

- Create risk
- Update risk
- Archive risk
- Assign owner
- Select treatment
- Score inherent risk
- Score residual risk
- Review risk

## Domain 2: Framework Engine

Frameworks are metadata, not separate product modules.

Supported MVP frameworks:

- ISO 27001
- SOC 2
- NIST CSF
- CIS Controls
- HIPAA
- PCI DSS

### Model

```text
Framework
  -> Domain
     -> Requirement
        -> Control Mapping
```

### Requirements

- Frameworks are seeded metadata.
- Domains group requirements.
- Requirements are stable, versioned records.
- Controls can map to many requirements.
- Requirements can map to many controls.
- Framework logic must be data-driven, not hardcoded in UI pages.

## Domain 3: Coverage Engine

### Inputs

- Project
- Selected framework
- Framework requirements
- Controls
- Control-framework mappings

### Outputs

- Covered requirements
- Missing requirements
- Coverage percentage
- Coverage trend
- Coverage by framework
- Coverage by project

### Formula

```text
coverage_percent = covered_requirements / total_requirements * 100
```

Coverage must include an explanation:

- Which controls satisfy the requirement
- Which requirements are missing controls
- Which mappings are pending review

## Domain 4: Readiness Engine

### Inputs

- Assets
- Controls
- Risks
- Framework coverage

### Outputs

- Governance readiness
- Framework readiness
- Coverage score
- Maturity level
- Confidence
- Gap severity

### Maturity Levels

| Level | Name | Meaning |
| --- | --- | --- |
| 1 | Foundation | Core program records exist |
| 2 | Visibility | Assets, risks, and controls are mapped |
| 3 | Control | Controls reduce risks and map to frameworks |
| 4 | Managed | Readiness and gaps are actively tracked |
| 5 | Optimized | Coverage, risk, and improvement trends are measurable |

## Domain 5: Gap Analysis

### Gap Types

- Missing controls
- Missing coverage
- Unmapped risks
- Unprotected assets
- Low readiness areas

### Gap Requirements

Every gap must include:

- Source record
- Severity
- Reason
- Recommended next action
- Lifecycle stage
- Framework reference when applicable

## Domain 6: Governance Score V2

Governance Score V2 extends CREATE score.

### Components

| Component | Weight |
| --- | ---: |
| CREATE foundation | 25% |
| Asset coverage | 15% |
| Risk coverage | 20% |
| Control effectiveness | 15% |
| Framework coverage | 15% |
| Readiness/gap health | 10% |

### Required Explanations

Score output must explain:

- Current score
- Score drivers
- Score blockers
- Highest impact next action
- Data freshness

## Data Model Design

### Tables

| Table | Purpose |
| --- | --- |
| `risks` | Project-scoped risk register |
| `risk_asset_mappings` | Many-to-many asset-risk links |
| `risk_control_mappings` | Many-to-many risk-control links |
| `framework_domains` | Framework domain metadata |
| `framework_requirements` | Framework requirement metadata |
| `control_framework_mappings` | Many-to-many control-requirement links |
| `readiness_snapshots` | Calculated readiness states |
| `gap_findings` | Source-backed ASSESS gaps |

### Existing Table Reuse

| Existing Table | ASSESS Role |
| --- | --- |
| `organizations` | Tenant scope |
| `projects` | Program scope |
| `assets` | Risk source and coverage denominator |
| `controls` | Risk reducer and framework coverage source |
| `asset_control_mappings` | CREATE protection baseline |
| `frameworks` | Framework registry metadata |
| `activities` | Audit trail |

## API Design

No implementation yet. Target APIs/actions:

| API | Responsibilities |
| --- | --- |
| Risk API | create, update, archive, assign, treat, score |
| Risk Mapping API | link assets to risks, link risks to controls |
| Framework API | list frameworks, domains, requirements |
| Coverage API | calculate requirement coverage |
| Readiness API | calculate readiness/maturity |
| Gap API | generate and list gap findings |

## UI Design

### Risk Register

Shows:

- Title
- Category
- Owner
- Likelihood
- Impact
- Inherent risk
- Residual risk
- Treatment
- Status

### Risk Detail

Shows:

- Risk narrative
- Linked assets
- Linked controls
- Scoring explanation
- Treatment plan
- Activity history

### Risk Heatmap

Requirements:

- 5x5 likelihood x impact matrix
- Real risk counts
- Click-through drilldown
- Dynamic updates

### Framework Coverage

Shows:

- Framework
- Domain
- Requirement
- Mapped controls
- Coverage state

### Readiness Dashboard

Shows:

- Overall readiness
- Framework readiness
- Maturity level
- Confidence
- Top readiness drivers

### Gap Analysis

Shows:

- Gap type
- Severity
- Source record
- Reason
- Suggested next action

## Certification Criteria

ASSESS can pass only when this workflow works end-to-end:

```text
Asset
  -> Risk
     -> Control
        -> Framework
           -> Coverage
              -> Readiness
                 -> Gap
```

Evidence required:

- Browser validation
- Database validation
- RLS validation
- Persistence validation
- Testing validation
- Workflow validation

## Build Dependencies

Required before implementation:

```text
CREATE = PASS
```

Build order after CREATE pass:

1. Risk data model and risk register.
2. Risk asset/control mappings.
3. Framework domains and requirements.
4. Control-framework mappings.
5. Coverage engine.
6. Readiness engine.
7. Gap engine.
8. Mission Control ASSESS expansion.

## Decision

```text
ASSESS architecture package = READY
ASSESS implementation = LOCKED
```

