# E2E Implementation Roadmap

Status: **STAGE-GATED**

Only highest-priority work is included.

## Sprint 1: CREATE Certification

Goal:

```text
CREATE = PASS
```

Deliverables:

- `CREATE_BROWSER_EXECUTION_EVIDENCE.md`
- Browser screenshots for project, asset, control, relationship, Mission Control
- Database row evidence for `projects`, `assets`, `controls`, `asset_control_mappings`, `activities`
- Persistence proof after refresh/logout/login/direct URL
- RLS proof for own tenant vs another tenant

Certification progress:

```text
Unlocks ASSESS
```

## Sprint 2: ASSESS Risk Engine

Prerequisite:

```text
CREATE = PASS
```

Deliverables:

- `risks`
- `risk_asset_mappings`
- `risk_control_mappings`
- risk register
- risk detail
- risk heatmap
- inherent/residual risk scoring

Certification progress:

```text
Asset -> Risk -> Control traceability
```

## Sprint 3: ASSESS Framework + Coverage Engine

Prerequisite:

```text
Risk Engine operational
```

Deliverables:

- `framework_domains`
- `framework_requirements`
- `control_framework_mappings`
- framework coverage calculator
- framework coverage UI

Certification progress:

```text
Control -> Framework Requirement traceability
```

## Sprint 4: ASSESS Readiness + Gap Engine

Prerequisite:

```text
Framework coverage operational
```

Deliverables:

- `readiness_snapshots`
- `gap_findings`
- readiness dashboard
- Governance Score V2
- gap analysis UI

Certification progress:

```text
ASSESS = PASS candidate
```

## Sprint 5: IMPROVE Foundation

Prerequisite:

```text
ASSESS = PASS
```

Deliverables:

- `tasks`
- `recommendations`
- Health Advisor checks
- one-click task creation from gaps/risks
- task completion score impact

Certification progress:

```text
Know Gap -> Get Guidance -> Take Action -> Improve Score
```

## Deferred Until Later

- REPORT implementation
- AI Governance OS
- Vendor Risk
- Audit Management
- Trust Center
- BCM/DR
- Academy expansion

These are locked until CREATE, ASSESS, and IMPROVE certify PASS.
