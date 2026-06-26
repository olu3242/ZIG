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

## Organization Chart
See `docs/learning/ORG_CHART_LIBRARY.md` → "HealthBridge Organization Chart". Depicts:
CEO → CMO/Compliance Officer (HIPAA Privacy & Security Officer dual role) → IT Director →
EHR Integration team; the audit-logging gap below traces directly to no dedicated security
engineering reporting line.

## Technology Architecture Diagram
See `docs/learning/DIAGRAM_LIBRARY.md` → "HealthBridge Technology Architecture". Depicts:
telehealth platform → EHR Integration Service → PHI data store, with the incomplete
audit-logging boundary flagged at the EHR Integration Service node.

## Vendor Ecosystem Map
HealthBridge's vendor surface centers on its EHR vendor (data processor under HIPAA) — a
single-vendor, high-data-access map rather than a tiered ecosystem, useful as a
contrasting minimal case against RetailNova's multi-vendor map.

## Risk Landscape Map
See `docs/learning/HEATMAP_LIBRARY.md` → "HealthBridge Risk Landscape Map". Plots
"Incomplete PHI Access Logging" (open) — high impact given HIPAA exposure, the risk the
Audit track's internal audit plan is built to surface and remediate.

## Compliance Coverage Map
See `docs/learning/TABLE_LIBRARY.md` → "HealthBridge Compliance Coverage Map". Row: HIPAA
Security Rule — "Audit Log Retention Policy" shown as "control, evidence needed" (matches
the `needs_evidence` status above), the gap the failed internal risk assessment exposed.

## Control Coverage Map
Pivots the Compliance Coverage Map by control: "Audit Log Retention Policy" → maps to
HIPAA Security Rule §164.312(b) (audit controls) only — single-framework coverage,
contrasting with CloudPay's multi-framework control reuse case.

## Incident Flow
HealthBridge's narrative is a failed internal risk assessment, not a declared incident —
no `incident` object type exists in its seeded objects above. No Incident Flow exists for
this scenario; the gap (inconsistent audit logging) is pre-incident, which is precisely
why the Audit track uses this scenario for proactive internal-audit planning rather than
post-incident response.

## Audit History Timeline
One milestone so far: "Internal HIPAA risk assessment — failed, [date]," per the Narrative
above. The Audit track's exercise ("Plan an ISO 27001 Internal Audit for HealthBridge")
adds the next timeline milestone the learner must plan: the upcoming internal audit
itself, not yet conducted.
