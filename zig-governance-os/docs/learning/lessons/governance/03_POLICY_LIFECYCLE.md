# 03_POLICY_LIFECYCLE

## Objectives
- Walk a policy through draft, review, approval, publication, and retirement.
- Tie a policy to the controls and evidence it governs.
- Identify when a policy is stale and needs re-approval.

## Business Context
Policies are the written intent behind controls. Without a lifecycle, policies drift out
of sync with what's actually implemented — exactly the kind of gap an auditor flags first.

## Scenario Mapping
CloudPay (`docs/scenarios/CLOUDPAY.md`) — draft an encryption policy lifecycle tied to its
"Encryption at Rest" control (status: needs_evidence).

## Framework Mapping
Trains on `ControlService` (`Control.status` transitions) — policy lifecycle is modeled
as the human process around a control's lifecycle, not a separate policy table.

## Diagram Requirements
- Policy lifecycle state diagram (draft → review → approved → published → retired)
- Policy-to-control linkage diagram

## Knowledge Check
1. What should happen to a policy when its linked control moves to "needs_evidence"?
2. Who should approve a policy retirement, and why does that differ from who drafts it?

## Artifact Produced
None directly; feeds the Control Matrix artifact in 04_DECISION_RIGHTS.

## Visual Assets Required
- Policy Lifecycle State Diagram
- Policy-to-Control Linkage Diagram

## Required Diagram
- Policy Lifecycle (see `DIAGRAM_LIBRARY.md`)

## Required Workflow
- Not applicable for this lesson — see Required Diagram instead

## Required Table
- Not applicable for this lesson — no indexed table entry exists yet for policy-to-control linkage; see Required Diagram instead

## Required Visual Exercise
- Walk CloudPay's "Encryption at Rest" control through each stage of the Policy Lifecycle diagram and mark the stage it is currently stuck in given its "needs_evidence" status.
