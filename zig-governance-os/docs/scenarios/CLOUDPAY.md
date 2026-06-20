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
