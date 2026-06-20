# Master Curriculum Map

> Documentation-first, per `CLAUDE.md`: this file defines the curriculum structure before
> any track's `learning_paths`/`learning_modules` rows are seeded. It does not change
> schema, routes, or services — every track below maps onto the existing
> `LearningService` (`learning_paths`, `learning_modules`) and `simulated_companies` /
> `simulated_company_objects` tables already in `supabase/migrations/202606180007_learning_os_e2e.sql`.

## Status

| Track | Doc | Learning paths seeded | Stage |
|---|---|---|---|
| Governance | `GOVERNANCE_TRACK.md` | 0 | Documented, not seeded |
| Risk | `RISK_TRACK.md` | 0 | Documented, not seeded |
| Compliance | `COMPLIANCE_TRACK.md` | 0 | Documented, not seeded |
| Audit | `AUDIT_TRACK.md` | 0 | Documented, not seeded |
| Vendor Risk | `VENDOR_RISK_TRACK.md` | 0 | Documented, not seeded |
| Security Governance | `SECURITY_GOVERNANCE_TRACK.md` | 0 | Documented, not seeded |
| BCM/DR | `BCM_DR_TRACK.md` | 0 | Documented, not seeded |
| Executive Leadership | `EXECUTIVE_LEADERSHIP_TRACK.md` | 0 | Documented, not seeded |
| ISO 27001 / SOC 2 / NIST CSF | `docs/curriculum/LEARNING_CONTENT_WAVE_1.md` | 3 | **Seeded** (`supabase/seed/002_learning_content_wave_1.sql`) |

Wave 1 (ISO 27001, SOC 2, NIST CSF) is already live. The eight tracks below are the next
content wave and are documented here first; seeding them is a follow-up commit once this
map is reviewed, consistent with "never implement before documenting."

## Why these eight tracks

Each track corresponds to one node in the Universal Governance Model
(`Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence →
Task → Report`) or to a real service already shipped, so curriculum content always trains
a learner on a real, working part of the product rather than an abstract concept:

| Track | Trains the learner on | Backing service(s) |
|---|---|---|
| Governance | Programs, governance scoring, Mission Control | `GovernanceService` |
| Risk | Risk identification, assessment, treatment | `RiskService` |
| Compliance | Framework requirements, control mapping, status | `ComplianceStatusService`, `FrameworkMappingService` |
| Audit | Audit planning, evidence sampling, findings | `AuditService` |
| Vendor Risk | Third-party assessment workflows | `RiskService` + `Asset` (vendor as asset category) |
| Security Governance | Control design across ISO/SOC2/NIST | `ControlService`, `FrameworkRoadmapService` |
| BCM/DR | Business continuity & disaster recovery planning | `RiskService` + `Scenario`/`ScenarioRun` |
| Executive Leadership | Reading governance scores, reports, board communication | `GovernanceService`, Executive Reporting module |

## Track → Scenario pairing

Each scenario in `docs/scenarios/` is a simulated company (`simulated_companies` /
`simulated_company_objects`) used as the applied-practice anchor for one or more tracks,
so labs/exercises operate on a concrete, named org instead of a generic placeholder:

| Scenario | Industry | Primary track(s) |
|---|---|---|
| CloudPay | Fintech/payments | Compliance, Security Governance, Audit |
| HealthBridge | Healthcare | Compliance (HIPAA), Risk, Audit |
| RetailNova | Retail/e-commerce | Vendor Risk, Compliance (PCI DSS), Governance |
| ManufacturX | Manufacturing/OT | Risk, BCM/DR, Security Governance |
| GovSec | Public sector | Governance, Executive Leadership, Audit |

## Sequencing

Tracks are independent of each other (a learner can start on any track), but within a
track, modules follow lesson → lab → exercise, and the exercise in each track's final
module is performed against one of the five scenarios above rather than an abstract org —
matching the pattern already used in Wave 1's "Build a Statement of Applicability for a
Sample Org" / "Produce a Target Profile Roadmap for a Mid-Size Org" exercises.

## What is explicitly not covered by this map

Same schema gaps already flagged in `docs/curriculum/LEARNING_CONTENT_WAVE_1.md`:
no quiz question bank, no lesson body-text field. Those are schema decisions, not made by
this content map.
