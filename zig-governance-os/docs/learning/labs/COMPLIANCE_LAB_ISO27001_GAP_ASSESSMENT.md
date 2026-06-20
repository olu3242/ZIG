# Compliance Lab: Perform ISO 27001 Gap Assessment

## Scenario
CloudPay (`docs/scenarios/CLOUDPAY.md`).

## Inputs
- CloudPay's existing controls (Encryption at Rest: needs_evidence; Access Review Quarterly: planned)
- ISO 27001 Annex A requirement set (`Framework` record)
- Compliance track Lessons 01-02 (Foundations, Requirements Mapping)

## Tasks
1. Map CloudPay's existing controls to ISO 27001 Annex A requirements.
2. Identify requirements with no covering control.
3. Identify requirements with a control but missing evidence.
4. Prioritize the resulting gap list by audit risk and remediation cost.

## Deliverables
- Gap assessment report: coverage matrix + prioritized gap list with owners and target dates.

## Scoring Rubric
| Criterion | Weight |
|---|---|
| Coverage matrix correctly distinguishes "no control" from "control, no evidence" | 30% |
| Every gap has a documented audit-risk and cost rationale | 30% |
| Prioritization order is defensible given the rationale | 20% |
| Every gap has an owner and target date | 20% |

## AI Feedback Rules
ZARA reviews as **Auditor**: flags any requirement marked "covered" without a real
mapped control, and as **Reviewer**: checks that prioritization order matches the stated
audit-risk/cost rationale rather than appearing arbitrary.
