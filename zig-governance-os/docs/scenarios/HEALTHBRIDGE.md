# Scenario: HealthBridge

Simulated company used as the applied-practice anchor for Compliance (HIPAA), Risk, and
Audit track exercises. Backed by `simulated_companies` / `simulated_company_objects` — no
new schema required.

## Profile

| Field | Value |
|---|---|
| `name` | HealthBridge |
| `industry` | Healthcare / Telehealth |
| `maturity` | 50 (mid-stage; some HIPAA safeguards implemented, audit trail incomplete) |

## Narrative

HealthBridge runs a telehealth platform handling PHI across three states. It just failed
an internal HIPAA risk assessment due to inconsistent audit logging on its EHR
integration, and needs an internal audit plan and corrective action set before its next
external assessment — the anchor for the Audit track's "Plan an ISO 27001 Internal Audit
for HealthBridge" / "Draft Findings and Corrective Actions for HealthBridge" modules.

## Simulated objects (`simulated_company_objects`, indicative — not yet seeded)

| `object_type` | `name` | `status` |
|---|---|---|
| asset | EHR Integration Service | active |
| risk | Incomplete PHI Access Logging | open |
| control | Audit Log Retention Policy | needs_evidence |
| evidence | Q1 Access Review Export | requested |

Seeding these rows is a follow-up to this doc, not included here (doc-first per
`CLAUDE.md`).
