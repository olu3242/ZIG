# Trust OS Data Model

> Batch 8. Every entity is mapped to existing Zig tables/types FIRST, per
> `supabase/migrations/*.sql` and `packages/data-access/src/records.ts`, before anything
> net-new is proposed. Entities required by the task: Trust Record, Evidence, Questionnaire,
> Question, Response, Framework, Vendor, Certification, AI Asset, AI Decision, Trust Score.

## Mapping table

| Entity | Existing table/type | Evidence | Verdict |
|---|---|---|---|
| Trust Record | none (closest: `governance_scores` row + its joined Evidence/Control/Risk graph) | `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298` | **Reframe, don't build.** "Trust Record" is not a new entity — it is the existing `GovernanceScoreRecord` (`packages/data-access/src/records.ts:44`) read together with its supporting Evidence/Control/Risk rows. Introducing a separate `trust_records` table would create a second source of truth for the same fact. |
| Evidence | `evidence` table; `EvidenceRecord` type | `supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`; `packages/data-access/src/records.ts:36` | **Reuse as-is.** |
| Questionnaire | none — only `vendors.questionnaire jsonb` | `supabase/migrations/202606190002_mvp_convergence_schema.sql:93` | **Build.** Genuinely net-new relational entity; the jsonb column is the migration source, not the target shape. |
| Question | none | grep across `packages/*/src` and `supabase/migrations/*.sql` returns no `questions` table | **Build.** |
| Response | none | same | **Build.** |
| Framework | `frameworks`, `framework_versions`, `framework_requirements`, `framework_mappings`, `framework_crosswalks` tables; `FrameworkRecord` type | `packages/data-access/src/records.ts:30`; full framework table family in migrations | **Reuse as-is.** Mature, do not touch. |
| Vendor | `vendors` table | `supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97` | **Reuse table, build service.** No `VendorRecord` type exists in `packages/data-access/src/records.ts` — that type and a `VendorService` are the actual gap, not the table. |
| Certification | `certifications`, `user_certifications` tables | `supabase/migrations/202606190003_mvp_plus_launch_schema.sql:51-67` | **Extend.** Add `certification_type` discriminator (`learner_credential` \| `compliance_attestation`) rather than create a parallel table. |
| AI Asset | none | no `ai_assets` table anywhere in `supabase/migrations/*.sql` | **Build.** Model directly on `AssetRecord` shape (`packages/data-access/src/records.ts:33`) plus governed-agent fields already proven in `governed_agents` (`supabase/migrations/202606180009_agent_governance_os.sql`). |
| AI Decision | none | no `ai_decisions` table anywhere | **Build.** Model on the explainability payload already required of AI outputs (`CLAUDE.md:122-125`): reason, supporting data, confidence, framework reference, plus an `ai_asset_id` foreign key. |
| Trust Score | `governance_scores` table | `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298` | **Extend.** Two new weighted columns/inputs (vendor posture, AI governance posture) on the existing computation — see `TRUST_SCORE_MODEL.md`. Not a new table. |

## Proposed net-new schema (design only — no migration is created by this batch)

These are the only entities Batch 1 confirmed as genuinely absent under any name. Field
lists below follow the column conventions already used throughout
`supabase/migrations/*.sql` (every table seen has `id uuid primary key default
gen_random_uuid()`, `tenant_id uuid not null references tenants(id) on delete cascade`,
`created_at`/`updated_at timestamptz`).

### `questionnaires`
- `id`, `tenant_id`, `project_id`
- `vendor_id` (nullable — null when the questionnaire is *incoming*, about this tenant, vs. one this tenant is sending to a vendor)
- `source` (`inbound` | `outbound`)
- `title`, `status` (`draft` | `in_progress` | `submitted` | `completed`)
- `due_at`, `created_at`, `updated_at`

### `questions`
- `id`, `tenant_id`, `questionnaire_id` (references `questionnaires`)
- `prompt`, `question_type` (`text` | `boolean` | `multiple_choice` | `evidence_request`)
- `framework_reference` (nullable, references `framework_requirements`) — keeps questions
  framework-aware per `CLAUDE.md:107-109`
- `order_index`, `created_at`, `updated_at`

### `responses`
- `id`, `tenant_id`, `question_id` (references `questions`)
- `answer_text`, `evidence_id` (nullable, references existing `evidence` table — reuse, not duplication)
- `drafted_by` (`ai` | `human`), `ai_confidence` (nullable numeric, populated only when `drafted_by = 'ai'`)
- `approved_by_user_id` (nullable, references `users`), `approved_at`
- `created_at`, `updated_at`

### `ai_assets`
- `id`, `tenant_id`, `project_id`
- `name`, `asset_type` (`model` | `agent` | `feature`), `criticality`, `data_sensitivity`
- `owner_user_id` (references `users`)
- `created_at`, `updated_at`

### `ai_risks`
- `id`, `tenant_id`, `ai_asset_id` (references `ai_assets`)
- `risk_category` (`drift` | `bias` | `hallucination` | `data_leakage` | `prompt_injection` | `other`)
- `likelihood`, `impact`, `status`
- `created_at`, `updated_at`

### `ai_controls`
- `id`, `tenant_id`, `ai_risk_id` (references `ai_risks`)
- `control_type` (`human_review` | `output_filtering` | `evaluation_cadence` | `red_teaming` | `other`)
- `owner_user_id`, `effectiveness_score`
- `created_at`, `updated_at`

### `ai_decisions`
- `id`, `tenant_id`, `ai_asset_id` (references `ai_assets`)
- `decision_summary`, `reason`, `supporting_data jsonb`, `confidence`, `framework_reference` (nullable)
- `approved_by_user_id` (nullable), `created_at`

## What this batch deliberately does not propose

- A `trust_records` table — see "Reframe, don't build" above.
- A second `governance_scores`-equivalent table for Trust Score — it's additive columns/
  inputs on the existing table (see `TRUST_SCORE_MODEL.md`).
- A `vendors` table rewrite — the existing table is reused; only a `VendorRecord` type and
  `VendorService` are missing.
- A `certifications` table fork — a single discriminator column closes the gap.
