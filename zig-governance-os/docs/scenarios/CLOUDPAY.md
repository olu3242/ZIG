# Scenario: CloudPay

Simulated company used as the applied-practice anchor for Compliance, Security
Governance, and Audit track exercises. Backed by `simulated_companies` /
`simulated_company_objects` (`supabase/migrations/202606180007_learning_os_e2e.sql`) —
no new schema required.

## Profile

| Field | Value |
|---|---|
| `name` | CloudPay |
| `industry` | Fintech / Payments |
| `maturity` | 35 (early-stage; most controls planned, not implemented) |

## Narrative

CloudPay is a Series B payments processor preparing for its first SOC 2 Type II audit
while also pursuing ISO 27001 certification to win enterprise customers. It has real
customer payment data, a small security team, and pressure from sales to close compliance
gaps fast — a deliberately tight, realistic scenario for the Security Governance and
Compliance tracks' lab/exercise modules ("Design a Control Set for CloudPay", "Map
CloudPay's Controls to NIST CSF").

## Simulated objects (`simulated_company_objects`, indicative — not yet seeded)

| `object_type` | `name` | `status` |
|---|---|---|
| asset | Production Payments API | active |
| asset | Customer PII Database | active |
| control | Encryption at Rest | needs_evidence |
| control | Access Review Quarterly | planned |
| risk | Unencrypted Backup Snapshots | open |

Seeding these rows is a follow-up to this doc, not included here (doc-first per
`CLAUDE.md`).

## Organization Chart
See `docs/learning/ORG_CHART_LIBRARY.md` → "CloudPay Organization Chart". Depicts: CEO →
CTO/CISO (dual-hatted, small security team) → Engineering Lead → 2 security engineers;
GRC function does not yet exist as a separate reporting line, a gap the Security
Governance track's lab makes the learner address.

## Technology Architecture Diagram
See `docs/learning/DIAGRAM_LIBRARY.md` → "CloudPay Technology Architecture". Depicts:
Production Payments API → Customer PII Database, plus the third-party processors and
encryption boundary around the Customer PII Database (the asset tied to the "Encryption
at Rest" control above).

## Vendor Ecosystem Map
CloudPay's vendor surface is limited to payment-rail and cloud-infrastructure providers;
no formal vendor risk program exists yet (unlike RetailNova, this is not the focus
scenario for Vendor Risk track exercises, so this map stays minimal: 2-3 nodes, not a
full tiered ecosystem).

## Risk Landscape Map
See `docs/learning/HEATMAP_LIBRARY.md` → "CloudPay Risk Landscape Map". Plots the
"Unencrypted Backup Snapshots" risk (open) against likelihood/impact, the seed risk a
learner expands into a full register in the Security Governance lab.

## Compliance Coverage Map
See `docs/learning/TABLE_LIBRARY.md` → "CloudPay Compliance Coverage Map". Rows: SOC 2
(Type II in progress), ISO 27001 (pursuing certification) — both showing CloudPay's two
existing controls as "control, evidence needed" rather than "no control," consistent with
the maturity-30 narrative above.

## Control Coverage Map
Uses the same `ControlMapping` data as the Compliance Coverage Map above, pivoted by
control instead of by framework: "Encryption at Rest" → maps to both SOC 2 and ISO 27001;
"Access Review Quarterly" (planned) → no framework mapping yet, the gap the Security
Governance lab's "Design Cross-Framework Controls" exercise closes.

## Incident Flow
CloudPay has no recorded incident history in its seeded objects (`simulated_company_objects`
above lists only assets/controls/risk, no `incident` rows) — no Incident Flow exists for
this scenario yet. This is a documented gap, not an invented incident; HealthBridge and
ManufacturX are better anchors for incident-flow exercises given their narratives.

## Audit History Timeline
CloudPay is "preparing for its first SOC 2 Type II audit" per the Narrative above — it has
no audit history yet. The Audit History Timeline for this scenario starts empty by design:
one milestone ("First SOC 2 Type II audit — scheduled, not yet conducted"), reflecting the
early-stage maturity-35 profile rather than a fabricated audit record.
