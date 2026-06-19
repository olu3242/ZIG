# Scenario Engine Architecture — The 5 Named Scenario Companies

> How CloudPay, HealthBridge, RetailNova, ManufacturX, and GovSec (Source C) map onto the
> real `scenarios`, `scenario_runs`, `simulated_companies`, `lab_tasks`, and `lab_artifacts`
> tables. Verified fact: none of these 5 names appear anywhere in the repo today — zero
> hits across migrations, code, and docs for "CloudPay," "HealthBridge," "RetailNova,"
> "ManufacturX," or "GovSec." `simulated_companies` exists as a table with zero seed rows.
> This document proposes how to author lab content for these companies without inventing
> any new table.

## 1. The two existing, currently-unconnected pieces

```
simulated_companies (id, tenant_id, name, industry, maturity, created_at, updated_at)
   — defined in 202606180007_learning_os_e2e.sql lines 70-80
   — zero FK to scenarios; zero seed rows

simulated_company_objects (id, simulated_company_id FK→simulated_companies cascade,
   object_type, name, status, payload jsonb)
   — defined in same file, lines 82-94
   — deliberately left unextended per the migration's own comments
   — zero FK to scenarios, lab_tasks, or lab_artifacts

scenarios (id, tenant_id, project_id FK, name, description, framework_ids uuid[])
   — defined in 202606180001_batch_21_core_data_platform.sql lines 261-270
   — this is the table the real, working /learning/practice-lab route actually uses
   — has no FK to simulated_companies
```

These two table families were built independently and never connected. The Learning OS
that exists today (the practice-lab flow) runs entirely on `scenarios` /
`scenario_runs` / `lab_tasks` / `lab_artifacts` and has never touched
`simulated_companies`. Authoring "CloudPay" as a scenario company therefore requires a
decision about which family carries the company identity.

## 2. Two options, both schema-neutral; neither is chosen here

### Option A — Convention-based linkage (no migration required)

Seed 5 `simulated_companies` rows (CloudPay, HealthBridge, RetailNova, ManufacturX,
GovSec) with appropriate `industry`/`maturity` values. Separately, author `scenarios` rows
whose `name` or `description` textually references the company (e.g.
`scenarios.name = "CloudPay: SOC 2 Readiness Assessment"`). `simulated_company_objects`
rows under each company (e.g. "CloudPay's payment gateway," "CloudPay's customer database")
become reference material a lesson or lab instructions can cite, without any FK enforcing
the relationship.

**Pro:** zero schema change. **Con:** the link is editorial discipline, not
database-enforced; a report joining "all scenarios for CloudPay" requires a `LIKE` query
or tagging convention, not a join.

### Option B — FK-based linkage (one new column, no new table)

Add a nullable `simulated_company_id uuid references simulated_companies(id) on delete
set null` column to `scenarios`. This lets a lab's company be queried with a real join and
lets `simulated_company_objects` (the fictional company's assets/systems) be looked up
directly from a `scenarios` row.

**Pro:** queryable, enforced. **Con:** is a real migration — out of scope for this
documentation-only task, and not yet justified by a concrete reporting need.

**Recommendation for the implementer:** start with Option A (zero schema cost) for the
initial 5 companies; revisit Option B only if a concrete feature (e.g. "show me my
CloudPay lab history across all scenarios") requires a real join rather than a naming
convention.

## 3. Worked example — CloudPay

```
simulated_companies row:
  name: "CloudPay"
  industry: "Fintech / Payments"
  maturity: (author's choice, e.g. 35 — low-maturity company needing governance work)

simulated_company_objects rows (optional, for richer lab narrative):
  object_type: "system", name: "Payment Gateway API", status: "active"
  object_type: "data_store", name: "Cardholder Data Environment", status: "active"

scenarios row:
  project_id: <a real project under the authoring tenant>
  name: "CloudPay — PCI DSS Gap Assessment"
  description: "CloudPay processes card payments for SMB merchants and has never
                completed a PCI DSS assessment. Identify gaps and produce a gap
                assessment artifact."
  framework_ids: [<PCI DSS framework id>]

lab_tasks rows (FK scenario_id → the scenarios row above), e.g.:
  1. "Review CloudPay's cardholder data flow" — expected_output_type: "text", weight: 1
  2. "Identify missing PCI DSS controls" — expected_output_type: "text", weight: 2
  3. "Draft remediation plan" — expected_output_type: "text", weight: 1

A learner launches this via ScenarioService.launchLab(scenarioId) → creates a
scenario_runs row → completes each lab_tasks via ScenarioService.completeTask()
(writes lab_task_submissions) → calls ScenarioService.scoreAndComplete(scenarioRunId,
artifactType: "gap_assessment") → writes a lab_artifacts row with
artifact_type = "gap_assessment", scores the weighted completion, and updates
student_twins.skills_score.
```

This worked example uses **only existing service methods** (`launchLab`, `completeTask`,
`scoreAndComplete` — all verified in `packages/services/src/ScenarioService.ts` lines
68-185) and **only existing tables**. No code was written to produce this example; it
documents how an author would use what already exists.

## 4. The 5 companies — suggested industry/lab-domain pairing

| Company | Suggested industry (`simulated_companies.industry`) | Suggested primary lab focus | Suggested `lab_artifacts.artifact_type` |
|---|---|---|---|
| CloudPay | Fintech / Payments | PCI DSS, payment security | `gap_assessment`, `risk_register` |
| HealthBridge | Healthcare | HIPAA, patient data protection | `evidence_record`, `gap_assessment` |
| RetailNova | Retail / E-commerce | Vendor risk, PCI DSS, supply chain | `vendor_review` |
| ManufacturX | Manufacturing / OT | Operational resilience, asset/risk management | `risk_register` |
| GovSec | Government / Public Sector | NIST CSF, audit readiness | `audit_finding` |

This pairing is a content-design suggestion, not a constraint — `lab_artifacts.artifact_type`'s
check constraint already allows any of the 5 values regardless of company, so an author is
free to mix focus areas (e.g. a CloudPay vendor-risk lab is equally valid).

## 5. What this document does not do

- It does not seed any row into `simulated_companies` or `scenarios`.
- It does not add the `simulated_company_id` column described in Option B.
- It does not decide between Option A and Option B — that decision belongs to whoever
  authors the first real lab content batch.
