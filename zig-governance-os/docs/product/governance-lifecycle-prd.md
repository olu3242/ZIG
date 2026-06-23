# Governance Lifecycle PRD

## Product Principle

Zig is organized around one operating loop:

```text
CREATE -> ASSESS -> IMPROVE -> REPORT
```

No module may exist as isolated CRUD. Every object must either establish governance foundations, assess posture, improve posture, or demonstrate posture.

## MVP Outcome

A user can create a governance program, define assets and controls, assess risks and framework readiness, receive remediation recommendations, complete improvement work, run a scenario, and generate an executive report without manual database intervention.

## Lifecycle Scope

| Stage | Purpose | MVP Modules | Primary Output |
| --- | --- | --- | --- |
| CREATE | Establish governance foundations | Projects, Assets, Controls | Project workspace and operational control library |
| ASSESS | Understand posture | Risks, Frameworks, Readiness | Explainable readiness and risk posture |
| IMPROVE | Move the program forward | Tasks, Recommendations, Learning Scenarios | Remediation backlog and scenario progress |
| REPORT | Demonstrate posture | Mission Control, Executive Reports | Governance summary and exportable reports |

## Stage 1 Acceptance Criteria

- User can create a project with name, industry, framework focus, description, and status.
- User can create assets inside a project.
- User can create controls inside a project.
- Project overview shows health, asset coverage, and control coverage.
- Every create action writes an activity record.
- Empty states guide the user to the next lifecycle action.

## Frozen Until Stage Validation

The following remain defined but not implemented until Stage 1 is validated:

- Risk register
- Readiness engine
- Remediation tasks
- Health Advisor
- Scenario generation
- Executive report generation
