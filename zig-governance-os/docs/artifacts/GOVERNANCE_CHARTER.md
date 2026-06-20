# Artifact: Governance Charter

## Purpose
Formalizes how an organization governs itself: committee structure, decision rights by
severity, and escalation paths. The foundational document every governance program needs
before any risk/control work is credible.

## Backing Data
No dedicated `governance_charter` table exists. The charter is authored as a structured
document referencing real `Organization` and `Project` records and the roles defined in
the multi-tenant model (Organization Admin, GRC Manager, Risk Analyst, Compliance Analyst,
Auditor, Consultant, Viewer). This is a documented gap, not an invented table.

## Structure
- Governance committee structure (members, roles, cadence)
- Decision-rights matrix (who can approve/escalate at each severity level)
- Escalation paths (severity → owner → SLA)
- Review and revision cadence

## Track
Governance

## Lesson
`docs/learning/lessons/governance/02_GOVERNANCE_STRUCTURES.md`,
`04_DECISION_RIGHTS.md`

## Lab
`docs/learning/labs/GOVERNANCE_LAB_BUILD_GOVERNANCE_CHARTER.md`

## Skill
Designing governance structures with clear, auditable decision rights.

## Career Outcome
Can stand up a governance committee structure for a new organization without supervision.
