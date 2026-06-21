# Zig MVP Lifecycle Current State Assessment

Status: **MVP NOT CERTIFIED**

Assessment date: 2026-06-20

This assessment supersedes roadmap enthusiasm with certification evidence. The platform must not move into REPORT, AI Governance OS, Vendor Risk, Audit Management, Trust Center, BCM/DR, or Academy expansion until the lifecycle gates pass.

## Certification Gate Summary

```text
CREATE  = FAIL
ASSESS  = LOCKED
IMPROVE = LOCKED
REPORT  = LOCKED
```

CREATE implementation is largely present, but user acceptance evidence is missing. Because CREATE is not certified PASS, all later stages remain locked.

## Current State

| Area | Implementation Status | Certification Status | Notes |
| --- | --- | --- | --- |
| Authentication | Built | Partial | Auth foundation exists, but live browser evidence remains important for final MVP certification |
| Organizations | Built | Partial | Foundation tables and onboarding are present |
| Roles | Built | Partial | Roles exist; cross-tenant role/RLS proof remains required |
| Memberships | Built | Partial | Membership foundation exists |
| Multi-tenant foundation | Built | Partial | RLS exists; cross-tenant acceptance proof missing |
| Onboarding | Built | Partial | Flow exists; final browser evidence still needed |
| Navigation | Built | Not separately certified | Shell exists |
| Dashboard shell | Built | Partial | CREATE metrics are now wired, but browser acceptance is missing |
| CREATE | 90% built | FAIL | Browser/user acceptance validation did not run |
| ASSESS | 0-5% built | LOCKED | Risks, framework requirements, mappings, readiness, and gaps not certified |
| IMPROVE | 0% built | LOCKED | Tasks, recommendations, Health Advisor, scenarios not certified |
| REPORT | 5% built | LOCKED | Basic Mission Control exists; reports/exports/insights not certified |
| Learning runtime | 10% built | Out of gate | Architecture exists, runtime is not MVP lifecycle certified |

## CREATE Assessment

Implementation present:

- Project create/edit/archive/view
- Asset create/edit/archive/view
- Control create/edit/archive/view
- Asset-control many-to-many mappings
- CREATE activity logging
- Governance Score V1
- CREATE Mission Control metrics

Certification missing:

- Real deployed browser session
- Real authenticated user evidence
- Project named `CREATE Certification Project`
- Asset named `Customer Database`
- Control named `Multi-Factor Authentication`
- UI evidence of asset-control relationship
- UI and database evidence of required activity rows
- Browser refresh persistence proof
- Logout/login persistence proof
- RLS cross-tenant proof

CREATE certification remains:

```text
FAIL
```

## ASSESS Assessment

Required capabilities:

- Risk register
- Risk detail
- Risk scoring
- Risk heatmap
- Asset-risk relationships
- Risk-control relationships
- Framework domains
- Framework requirements
- Control-framework mappings
- Coverage engine
- Readiness engine
- Gap analysis engine
- Governance Score V2

Current state:

```text
Not certified. Locked behind CREATE PASS.
```

## IMPROVE Assessment

Required capabilities:

- Tasks
- Recommendations
- Health Advisor
- Scenario runtime
- Portfolio artifacts
- Readiness impact engine
- Score improvement loop

Current state:

```text
Not certified. Locked behind ASSESS PASS.
```

## REPORT Assessment

Required capabilities:

- Mission Control with full lifecycle metrics
- Governance dashboard
- Risk dashboard
- Framework dashboard
- Readiness dashboard
- Executive report engine
- PDF/DOCX export engine
- Trend and insight engine
- Artifact library

Current state:

```text
Not certified. Locked behind IMPROVE PASS.
```

## Critical Gaps

### Tier 1

| Gap | Current | Required | Impact |
| --- | --- | --- | --- |
| CREATE certification | FAIL | PASS | Blocks ASSESS |
| Risk engine | Missing | Operational | Blocks posture assessment |
| Framework engine | Partial metadata only | Requirement/mapping/coverage engine | Blocks readiness |
| Readiness engine | Missing | Explainable readiness | Blocks recommendations |

### Tier 2

| Gap | Current | Required | Impact |
| --- | --- | --- | --- |
| Tasks | Missing | Source-linked remediation engine | Blocks IMPROVE |
| Recommendations | Missing | Explainable Health Advisor outputs | Blocks guided improvement |
| Health Advisor | Missing | Continuous governance checks | Blocks action loop |
| Scenario runtime | Design only | Data-generating learning scenarios | Blocks scenario evidence |

### Tier 3

| Gap | Current | Required | Impact |
| --- | --- | --- | --- |
| Reports | Catalog/basic shell | Data-backed executive reports | Blocks board/auditor value |
| PDF/DOCX exports | Missing | Verified generated files | Blocks deliverables |
| Executive insights | Missing | Source-backed trends/priorities | Blocks REPORT certification |

## Stage-Gated Roadmap

### Sprint 1: CREATE Certification

Goal:

```text
CREATE = PASS
```

Acceptance:

```text
Create Project
  -> Create Asset
  -> Create Control
  -> Link Control to Asset
  -> Activity Logged
  -> Mission Control Updated
  -> Refresh Browser
  -> State Persists
  -> RLS Proven
```

### Sprint 2: ASSESS Risk Engine

Locked until CREATE PASS.

Scope:

- `risks`
- `risk_asset_mappings`
- `risk_control_mappings`
- risk score
- residual risk
- heatmap

### Sprint 3: ASSESS Framework Engine

Locked until risk engine is operational.

Scope:

- `framework_domains`
- `framework_requirements`
- `control_framework_mappings`
- coverage calculations

### Sprint 4: ASSESS Readiness Engine

Locked until framework coverage exists.

Scope:

- readiness calculations
- maturity levels
- gap findings
- Governance Score V2

### Sprint 5: IMPROVE

Locked until ASSESS PASS.

Scope:

- tasks
- recommendations
- Health Advisor
- scenario runtime

### Sprint 6: REPORT

Locked until IMPROVE PASS.

Scope:

- dashboards
- report engine
- export engine
- artifact library
- executive insights

### Sprint 7: Learning Runtime

Locked until MVP lifecycle is stable unless explicitly scoped as support for IMPROVE scenarios.

## Readiness Score

| Domain | Score |
| --- | ---: |
| Foundation | 85% |
| CREATE implementation | 90% |
| CREATE certification | 0% |
| ASSESS | 5% |
| IMPROVE | 0% |
| REPORT | 5% |
| Learning runtime | 10% |

Overall MVP readiness:

```text
30-35%
```

## Final Recommendation

Do not implement REPORT.

Do not implement ASSESS yet.

The only next valid work item is:

```text
CREATE User Acceptance Certification
```

If CREATE passes, proceed to ASSESS implementation. If CREATE fails, fix only the failing CREATE evidence path.
