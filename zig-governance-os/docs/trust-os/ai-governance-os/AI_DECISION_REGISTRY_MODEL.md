# AI Governance OS — AI Decision Registry (Batch 47)

> Batch 47. Tracks individual decisions made or materially influenced by a registered AI
> System: Prompt/Input/Model/Output/Reviewer/Approval/Outcome. Distinct in subject from
> `agent_audit_traces` (`supabase/migrations/202606180009_agent_governance_os.sql`), which
> logs Zig's own internal agent executions — referenced here only as a structurally close
> pattern, per `AI_GOVERNANCE_REUSE_MATRIX.md`.

## Why this is a new table, not a repoint of `agent_audit_traces`

`agent_audit_traces` is keyed on `governed_agent_id` and tenant-scoped to Zig's own agent
runtime; its columns (`input_hash`, `output_hash`, `reasoning_summary`, `confidence`,
`approvals`, `actions`, `escalations`, `failures`, `recoveries`) assume the subject is an
agent Zig built and operates. An AI Decision in this batch's scope is a decision made by
the **customer's** AI System (e.g. a customer's ChatGPT-based support bot deciding to issue
a refund) — a different tenant-facing subject that must remain independently queryable, the
same reasoning already applied to AI Risk in Batch 44. The column *shape* — hash-the-input,
hash-the-output, capture reasoning, capture confidence, capture approvals — is reused
directly because it is a sound, generic decision-logging pattern, not because the table
itself should be shared.

## Data shape

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `ai_system_id` | uuid | FK to AI System |
| `prompt` | text | the input prompt or triggering input, redacted/truncated per the AI System's Data Handling control (`AI_GOVERNANCE_CONTROLS_LIBRARY.md` domain 4) before storage if it contains PII |
| `input_context` | jsonb | structured context passed alongside the prompt (e.g. customer record ID, ticket ID) — never the raw PII itself, only references |
| `model_id` | uuid | FK to Model, capturing which exact model version produced this decision (important when a system's underlying model changes over time) |
| `output` | text | the model's output or decision |
| `decision_category` | text | e.g. `refund_approval`, `content_published`, `access_granted`, `escalated_to_human` |
| `reviewer_id` | uuid | FK `users(id)`, nullable — populated only if a human reviewed this specific decision |
| `approval_status` | text | enum: `auto_approved`, `pending_review`, `human_approved`, `human_rejected`, `escalated` |
| `outcome` | text | what actually happened downstream (e.g. `refund_issued`, `reverted`, `no_action`) — captured after the fact, may be null until the outcome is known |
| `confidence` | integer | 0-100, the AI System's own reported confidence in the decision, where available |
| `created_at` | timestamptz | when the decision was made |

## Relationship to AI Risk and AI Controls

A pattern of `human_rejected` or `escalated` decisions in a given `decision_category` is a
direct signal into the AI Risk Engine (Batch 44) — specifically the Safety and Operational
Risk domains. This is a future analytics/intelligence capability (mirroring Evidence OS's
"Evidence intelligence" classification as Missing-but-designed-for in
`EVIDENCE_REUSE_MATRIX.md`), not built in this documentation batch, but the schema above is
shaped to support it: `decision_category` and `approval_status` are queryable/aggregable by
design.

## Relationship to AI Trust Score

AI Decision Registry does not feed AI Trust Score (Batch 46) directly as a weighted
component — Oversight and Controls already capture whether human-in-the-loop review exists
structurally. The Decision Registry is evidentiary detail underneath those components, the
same way individual `evidence` rows are evidentiary detail underneath the aggregate
Evidence dimension of Trust Score, not a sixth scored input in its own right.
