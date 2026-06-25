# Continuous Assurance Engine (Batch 54)

STATUS: Design document. Documentation only. No code, migrations, or routes.

## Purpose

The Continuous Assurance Engine is the orchestration layer that continuously monitors six
categories of governance objects and detects four categories of problems, surfacing them
before they become audit findings or trust failures.

## What it monitors

1. Evidence
2. Controls
3. Vendors
4. Policies
5. AI Assets
6. Assessments

## What it detects

1. **Drift** — a control, policy, or AI asset's actual configuration/behavior diverging
   from its documented/expected state.
2. **Failures** — a control test, assessment, or review that has failed or is overdue
   past a defined SLA.
3. **Expired Items** — evidence, certifications, or vendor assessments past their
   validity window.
4. **Coverage Gaps** — a risk, framework requirement, or AI asset with no mapped control
   or evidence at all (a zero-state gap, not a degraded one).

## Reuse, not reinvention, for the evidence dimension

For evidence specifically, this engine does **not** reimplement freshness/expiration
detection. `packages/autonomous-evidence` already contains real, working date-threshold
logic that classifies evidence into health states (fresh / current / expiring / expired /
missing), and PR #9 defines the full Evidence Health Score (Freshness 30/Review Status
25/Usage 15/Coverage 15/Mapping 15) and lifecycle
(Created → Collected → Reviewed → Approved → Mapped → Used → Monitored → Expired →
Archived). Continuous Assurance calls into this existing logic for the Evidence row of
its monitoring matrix — it does not define a second, competing evidence-freshness
algorithm.

For the other five monitored categories (Controls, Vendors, Policies, AI Assets,
Assessments), no equivalent dedicated engine exists today (confirmed in the Batch 51
audit: no Vendor OS package, Health Advisor is a stub, AI Governance OS code is a stub).
Continuous Assurance's design for those five categories should be read as a **Build**
target, following the same shape (state classification + SLA threshold + coverage check)
that `autonomous-evidence` already demonstrates works for evidence.

## Monitoring matrix (shape, not implementation)

| Category | Drift signal | Failure signal | Expiration signal | Coverage gap signal |
|---|---|---|---|---|
| Evidence | N/A (evidence doesn't drift, it ages) | Review/approval overdue | Reuses `autonomous-evidence` health-state logic (PR #9) | Requirement/control with zero linked evidence |
| Controls | Implemented config diverges from control definition | Control test failed | Control re-attestation overdue | Risk or framework requirement with zero mapped control |
| Vendors | N/A | Vendor risk assessment failed/declined | Vendor assessment/SOC report expired | Critical vendor with no risk assessment on file |
| Policies | Policy document version diverges from approved baseline | Policy acknowledgment/training failed | Policy past its review-cycle date | Framework requirement with no governing policy |
| AI Assets | Model/system behavior diverges from registered AI Trust Score inputs | AI monitoring check failed | AI risk assessment expired | AI asset in inventory with no governance/oversight record |
| Assessments | N/A | Assessment/questionnaire response marked non-compliant | Assessment validity window expired | Framework requirement with no assessment coverage |

## Output shape

Every detected item produces a structured finding with: category, signal type (drift /
failure / expired / coverage gap), severity, the affected entity (with a path back along
the Universal Governance Model chain — Organization → Project → Asset → Risk → Control →
Framework Requirement → Evidence — so findings are never orphaned), and a plain-language
explanation. This output shape is intentionally identical to what the Health Advisor
stub in `docs/architecture/health-advisor-engine.md` calls for (severity, explanation,
action, ideally one-click remediation) — Continuous Assurance is positioned as the
concrete implementation of that direction for program-wide, continuous (not just
on-demand) monitoring.

## Relationship to other batches

- Findings here are the direct input to Predictive Trust Risk (Batch 55) — a rising count
  of drift/coverage-gap findings is itself a leading indicator.
- Findings here are the direct input to the Recommendation Engine (Batch 56) — every
  finding should be resolvable into at least one recommended action.
- Findings here feed Trust Analytics' (Batch 52) trend metrics (e.g. count of open
  findings over time, by category).
