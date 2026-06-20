# Security Governance Lab: Design Cross-Framework Controls

## Scenario
CloudPay (`docs/scenarios/CLOUDPAY.md`).

## Inputs
- CloudPay's existing controls and target frameworks (ISO 27001, SOC 2)
- Security Governance track Lessons 02-04 (Control Design, Cross-Framework Reuse, Ownership Lifecycle)

## Tasks
1. Design 3 new controls (beyond CloudPay's existing two) addressing its open risks.
2. For each, write a `ControlMapping` rationale covering both ISO 27001 and SOC 2.
3. Assign an owner and set initial lifecycle status for each control.
4. Identify which of the 3 controls is highest priority given CloudPay's audit timeline.

## Deliverables
- Control Matrix entry for each of the 3 new controls: design, cross-framework mapping, ownership, priority.

## Scoring Rubric
| Criterion | Weight |
|---|---|
| Each control is specific, testable, and traceable to a real risk | 30% |
| Cross-framework mapping rationale holds for both frameworks, not just one | 30% |
| Every control has a single assigned owner | 20% |
| Priority ranking matches CloudPay's stated audit timeline | 20% |

## AI Feedback Rules
ZARA reviews as **Auditor**: rejects any control mapping that would not survive an
auditor's challenge, and as **Reviewer**: flags any control without a single clear owner.
