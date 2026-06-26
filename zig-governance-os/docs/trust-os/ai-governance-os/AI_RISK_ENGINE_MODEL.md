# AI Governance OS — AI Risk Engine (Batch 44)

> Batch 44. Defines the 8 risk domains scored per AI System (Batch 42). Reuses the column
> shape of the existing `agent_risk_register` table
> (`supabase/migrations/202606180009_agent_governance_os.sql`) as a pattern — `risk_type`,
> `likelihood`, `impact`, `treatment`, `mitigation_plan` — repointed at `ai_system_id`
> instead of `governed_agent_id`, per `AI_GOVERNANCE_REUSE_MATRIX.md`'s build-sequence
> recommendation. This is the only place in AI Governance OS where an existing table's
> *shape* is reused this directly; the table itself is new (`ai_risks`, not
> `agent_risk_register`) because the two track risks for different subjects (customer AI
> systems vs. Zig's own agents) and must remain independently queryable and tenant-scoped
> to the right context.

## The 8 risk domains

| Domain | What it captures | Example |
|---|---|---|
| **Bias** | Discriminatory or unfair outcomes from model outputs | A hiring-screening AI System disproportionately rejects candidates from a protected group |
| **Hallucination** | Fabricated or factually incorrect outputs presented as true | A customer support copilot invents a refund policy that doesn't exist |
| **Privacy** | Improper handling, exposure, or retention of personal data | An internal agent logs PII from prompts into a shared, unencrypted memory store |
| **Security** | Prompt injection, model exfiltration, unauthorized access, jailbreaking | A workflow agent's tool permissions allow it to be tricked into exfiltrating credentials |
| **Compliance** | Use violates an applicable regulation or framework requirement | An AI System processes PHI without a signed BAA from the provider |
| **Copyright** | Outputs infringe third-party intellectual property | Generated marketing content reproduces copyrighted material verbatim |
| **Safety** | Physical, financial, or operational harm from acting on AI output without review | An automated approval agent approves a transaction outside policy limits with no human checkpoint |
| **Operational Risk** | Availability, vendor lock-in, cost overrun, model deprecation | A provider deprecates the model version the organization depends on with no migration plan |

## Per-domain risk record shape (reusing `agent_risk_register`'s columns)

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `ai_system_id` | uuid | FK to AI System (`AI_INVENTORY_DATA_MODEL.md`) — the new FK that did not exist on `agent_risk_register` |
| `risk_domain` | text | one of the 8 domains above — reuses `agent_risk_register.risk_type`'s column name/shape, renamed for clarity since "type" was ambiguous in the original table |
| `likelihood` | integer | 0-100, same scale as the original column |
| `impact` | integer | 0-100, same scale as the original column |
| `treatment` | text | e.g. `accept`, `mitigate`, `transfer`, `avoid` — same vocabulary as standard risk treatment used elsewhere in the platform's Risk Workspace |
| `mitigation_plan` | text | free text, reused verbatim |
| `mapped_control_ids` | uuid[] | new — links to AI Controls (Batch 45) that mitigate this specific risk row, since AI Risk Engine and AI Controls Library must be traversable in both directions |

## Per-system aggregate risk score → AI System.risk_level

```
DomainScore = likelihood * impact / 100        (0-100 scale)

AISystemRiskScore = max(DomainScore across all 8 domains)
```

The maximum, not the average, is used deliberately: an AI System that is low-risk on 7
domains but critical on one (e.g. Privacy) must surface as critical overall — averaging
would mask a single severe exposure, which would violate the explainability and
no-hidden-uncertainty principle already established for Trust Score
(`TRUST_SCORE_MODEL.md`'s "must not hide uncertainty" rule, itself drawn from
`docs/convergence/autonomous-governance.md:66-67`).

`AISystemRiskScore` is mapped to `AI System.risk_level`:

| Score range | risk_level |
|---|---|
| 0-24 | low |
| 25-49 | medium |
| 50-74 | high |
| 75-100 | critical |

## Why this is a new table, not a redefinition of `agent_risk_register`

`agent_risk_register` rows are tenant-scoped to a `governed_agent_id`, and every consumer
of that table found in this codebase (none, per the audit — it has no service wrapper
either, but its schema and naming are unambiguously agent-runtime-internal) assumes the
subject is one of Zig's own governed agents. Repointing the literal table at customer AI
systems would conflate two governance domains that must remain separately queryable: a
customer auditor reviewing their organization's AI risk posture must never see, or be
confused by, Zig's internal agent risk register, and vice versa. The column *shape* is
reused; the table and its tenant-scoping context are not shared.
