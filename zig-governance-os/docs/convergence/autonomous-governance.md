# Autonomous Governance

## Purpose

Autonomous Governance moves Zig from governance management to governed automation. Agents may generate work, but humans approve material changes before those changes affect official records, scores, reports, or certification states.

## Agent Model

| Agent | Responsibilities |
|---|---|
| Risk Agent | generate risks, detect escalation, recommend treatments |
| Control Agent | generate controls, map controls, suggest effectiveness improvements |
| Evidence Agent | request evidence, detect missing or expired evidence, score evidence quality |
| Audit Agent | generate audit programs, identify findings, draft audit reports |
| Learning Agent | recommend learning paths, labs, and certifications from graph gaps |
| Certification Agent | evaluate certification readiness and capstone completion |
| Executive Agent | produce executive summaries, board views, and decision memos |

## Autonomous Tasks

Agents can draft:

- Risks
- Controls
- Assessments
- Audit programs
- Reports
- Learning plans
- Remediation plans
- Evidence requests
- Scenario recommendations

## Human-In-The-Loop Controls

Every material recommendation supports:

- Approve
- Reject
- Modify
- Track

Approval decisions become graph records. Rejections and modifications improve future agent behavior.

## Agent Orchestration

AI Command Center is the primary orchestration surface:

```text
Command -> Agent Selection -> Context Package -> Draft Output -> Approval -> Graph Write -> Audit Log
```

Agents must operate within:

- Tenant boundary
- User permissions
- Framework scope
- Project scope
- Explainability standard
- Audit logging requirement

## Safety Rules

- Agents cannot bypass RBAC.
- Agents cannot write cross-tenant data.
- Agents cannot mark audit-ready, certified, or complete without approval.
- Agents cannot hide uncertainty.
- Agents must show source graph records and confidence.

## Acceptance Criteria

- Every autonomous output has an approval state.
- Every approved output is traceable to a user and agent.
- Every agent action is logged.
- Mission Control can show pending approvals and automation impact.
- Executive reports distinguish human-approved facts from AI-drafted recommendations.
