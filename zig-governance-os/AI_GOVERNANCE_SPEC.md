# AI Governance Specification

The AI governance layer defines trust and safety controls for agent permissions, execution limits, approvals, audit logging, data classification, PII protection, prompt governance, and model governance.

## Implementation

- Package: `packages/ai-governance`
- Engine: `AiGovernanceLayer`
- Execute gate: audit logging and PII protection are mandatory; approval-required actions remain blocked pending human decision
