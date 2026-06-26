# AI Governance OS — AI Inventory Data Model (Batch 42)

> Batch 42. Defines the entities for tracking the **customer organization's** use of AI
> systems — ChatGPT, Claude, Copilot, custom LLMs, internal agents the customer built — not
> Zig's own AI features. Confirmed via `AI_GOVERNANCE_OS_AUDIT.md` Finding 2 that no table
> of this shape exists today; the closest structural analog, `governed_agents`, governs
> Zig's own internal agents and is reused only as a column-shape pattern, not as the table
> itself (see Audit Finding 1 and the Reuse Matrix).

## Entities

### AI System

The top-level inventory record — one row per distinct AI capability the organization uses
or operates.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | FK `tenants(id)`, tenant isolation per `CLAUDE.md:99-102` |
| `project_id` | uuid | FK `projects(id)` — every AI System belongs to a project, per the Universal Governance Model (no orphans) |
| `name` | text | e.g. "Customer Support Copilot," "Marketing ChatGPT Workspace" |
| `system_type` | text | enum: `third_party_saas`, `api_integration`, `custom_llm`, `internal_agent`, `workflow_agent` |
| `provider_id` | uuid | FK to Provider |
| `model_id` | uuid | FK to Model (nullable — some Use Cases span multiple models) |
| `owner_id` | uuid | FK `users(id)` — accountable individual |
| `department` | text | e.g. Engineering, Marketing, Customer Support, Legal |
| `use_case` | text | free text description of what the system is used for |
| `data_types` | text[] | e.g. `pii`, `phi`, `financial`, `source_code`, `customer_content`, `none` |
| `risk_level` | text | enum: `low`, `medium`, `high`, `critical` — computed by the AI Risk Engine (Batch 44), not hand-entered |
| `status` | text | enum: `requested`, `under_review`, `approved`, `registered`, `monitored`, `retired` — see `AI_REGISTRY_LIFECYCLE_MODEL.md` (Batch 43) |
| `created_at`, `updated_at` | timestamptz | standard audit columns, consistent with every other table in `supabase/migrations/` |

### Provider

The vendor or origin of the AI capability.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `name` | text | e.g. OpenAI, Anthropic, Microsoft, Google, "Internal" (for custom/internal systems) |
| `provider_type` | text | enum: `external_vendor`, `internal` |
| `trust_documentation_url` | text | nullable — link to the provider's own trust/security page, if external |

This is intentionally a *separate* entity from Zig's existing `vendors` table
(`supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`, referenced in
`TRUST_SCORE_MODEL.md`'s Vendor dimension). An AI Provider is conceptually a vendor, but
`vendors` today is a flat third-party-risk record with no model/system relationship. Rather
than overload `vendors` with AI-specific columns, Provider stores an optional
`vendor_id` FK so an AI Provider *can* link to an existing Vendor record when one exists,
without forcing every AI Provider to have a full vendor risk-assessment lifecycle. This
mirrors the same non-collision discipline used for AI Trust Score (Batch 46).

### Model

The specific model version or family in use.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `provider_id` | uuid | FK to Provider |
| `name` | text | e.g. "GPT-4", "Claude Opus 4.6", "Copilot (GPT-4 base)" |
| `model_family` | text | e.g. "GPT-4", "Claude", "Llama" — groups model versions |
| `is_fine_tuned` | boolean | true for custom/fine-tuned variants |
| `deployment_mode` | text | enum: `saas_api`, `self_hosted`, `embedded_product_feature` |

### Owner

Not a new table — reuses the existing `users` table directly. Every AI System has exactly
one accountable `owner_id`. This follows the same reuse discipline as Evidence OS, which
reuses `users` rather than inventing a parallel "Owner" entity (`EVIDENCE_DATA_MODEL.md`,
Batch 22).

### Department

Stored as a `text` column on AI System rather than a normalized table in this MVP — there
is no existing `departments` table anywhere in `supabase/migrations/`, and introducing one
is out of scope for a documentation-only batch whose job is to specify the AI-specific
entities, not invent organizational-structure tables the rest of the platform doesn't have
yet. If a `departments` table is added platform-wide in a future Fable, AI System's
`department` column becomes a FK at that time — flagged here as a known future
normalization, not solved now.

### Use Case

Stored as a `text` field on AI System (free text) plus a `use_case_category` enum for
reporting: `customer_facing`, `internal_productivity`, `software_development`,
`decision_support`, `content_generation`, `data_analysis`, `other`.

### Data Types

`text[]` array on AI System (see table above) rather than a join table, consistent with how
`governed_agents.permissions` and `governed_agents.tools` are modeled as arrays directly on
the parent row rather than normalized — same pattern, same rationale (small bounded
vocabulary, no need for independent lifecycle).

### Risk Level

A derived `text` enum on AI System, written only by the AI Risk Engine (Batch 44) — never
hand-entered by a user, the same rule CLAUDE.md applies to Governance Score
(`CLAUDE.md:113`, "explainable... never manually entered" — restated for Trust Score in
`TRUST_KNOWLEDGE_GRAPH.md`'s invariants).

### Status

Drives and is driven by the AI Registry lifecycle state machine — see
`AI_REGISTRY_LIFECYCLE_MODEL.md` (Batch 43).

## Worked examples

| AI System | system_type | Provider | Model | Department | Use Case | Data Types | Risk Level |
|---|---|---|---|---|---|---|---|
| Customer Support Copilot | third_party_saas | Microsoft | Copilot (GPT-4 base) | Customer Support | customer_facing | `pii`, `customer_content` | high |
| Engineering ChatGPT Workspace | api_integration | OpenAI | GPT-4 | Engineering | software_development | `source_code` | medium |
| Internal Risk Triage Agent | internal_agent | Internal | Custom LLM (fine-tuned Llama) | GRC | decision_support | `financial`, `pii` | critical |
| Marketing Claude Workspace | third_party_saas | Anthropic | Claude Opus | Marketing | content_generation | `none` | low |
| Workflow Approval Agent | workflow_agent | Internal | GPT-4 (via API) | Operations | internal_productivity | `none` | medium |

## Relationship to the Universal Governance Model

AI System slots into the existing spine as a typed specialization of Asset, exactly as
`TRUST_KNOWLEDGE_GRAPH.md` (Batch 5) anticipated:

```text
Organization -> Project -> AI System -> AI Risk -> AI Control -> AI Evidence -> AI Trust Score
```

No new top-level entity is introduced outside this chain — AI System always belongs to a
Project, never floats as an orphan, per `CLAUDE.md:163-164`.
