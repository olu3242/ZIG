# Trust OS Database Alignment (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. No migration is introduced by this batch.
Every table cited below was re-read directly from `supabase/migrations/*.sql` on `main` in
this session (17 migration files as of this writing).

## 1. Purpose

Reconcile every table/column referenced as existing or proposed across PRs #7, #8, #9,
#10, #12, #11 against the actual schema, flag contradictions, and resolve each with one
canonical shape.

## 2. Re-verification of the two columns the task explicitly calls out

### `control_mappings`

Confirmed unchanged from PR #7's original audit, re-read directly at
`supabase/migrations/202606180001_batch_21_core_data_platform.sql:137-147`:

```sql
create table control_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  source_control_id uuid not null references controls(id) on delete cascade,
  target_framework_id uuid not null references frameworks(id) on delete cascade,
  target_control_id text not null,
  mapping_rationale text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

`source_control_id` is a real FK to `controls(id)`. `target_framework_id` is a real FK to
`frameworks(id)`. `target_control_id` is **still free text**, not a foreign key — meaning a
cross-framework mapping records the target framework but not a real link to a row in
`controls` for that framework (e.g. mapping an ISO 27001 control to "SOC2 CC6.1" stores
the literal string `"CC6.1"`, not a `controls.id`). This is unchanged and still accurate as
of this session's read. Every batch (Questionnaire OS's question->control mapping, AI
Governance OS's AI control mapping) that proposes a similar crosswalk should follow this
same shape (FK to source, FK to target framework, free-text target identifier) for
consistency, rather than inventing a fully-FK'd crosswalk that the existing pattern does
not use.

### `vendors.questionnaire jsonb`

Confirmed unchanged, re-read directly at
`supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`:

```sql
create table if not exists vendors (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    category text not null,
    inherent_risk text not null default 'medium',
    assessment_status text not null default 'not_started',
    risk_rating integer not null default 0 check (risk_rating between 0 and 100),
    questionnaire jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (tenant_id, name)
);
```

`questionnaire jsonb not null default '[]'::jsonb` is still accurate: an unstructured JSON
array, scoped to a single vendor row, with no `questionnaires`, `questions`, or
`responses` table anywhere in any of the 17 migrations. This remains the entire current
questionnaire data model in the codebase, and remains insufficient to back Questionnaire
OS's structured, reusable, framework-aware question library (PR #8's stated conclusion,
re-verified here).

## 3. Contradictions found across the six PRs — resolved

### Contradiction 1: Two non-interoperable evidence health vocabularies, neither persisted

- `EvidenceManagementEngine.health()` (`packages/evidence/src/index.ts:10-18`) returns one
  of 6 states: `current | expired | missing | pending_review | rejected | approved`,
  driven by `{exists, expiresAt, reviewStatus}`.
- `AutonomousEvidenceEngine.health()` (`packages/autonomous-evidence/src/index.ts:12-20`)
  returns one of 5 *different* states: `fresh | current | expiring | expired | missing`,
  driven by `{source, collectedAt, expiresAt, mappedControlIds}` (a freshness-window
  calculation, not a review-status calculation).
- `evidence.status` (the actual column, `supabase/migrations/202606180001_batch_21_core_data_platform.sql:197`,
  `default 'missing'`) is free text, not constrained by either engine's enum — a third,
  ungoverned vocabulary in practice.

**Resolution:** the canonical persisted shape is `evidence.status` constrained (via a
future migration, not this batch) to the **union of both engines' value sets**, deduplicated:
`missing | pending_review | rejected | approved | current | expired | fresh | expiring`.
Both engines remain as **input-signal functions**, not replaced — `EvidenceManagementEngine`
computes status from manual review state (used when `evidence_reviews` has a row),
`AutonomousEvidenceEngine` computes status from collection freshness (used when evidence
arrived via an automated `AutonomousEvidenceSource`, per `evidence.status`'s
`'manual_upload' | 'automation' | 'api_integration' | 'cloud_sync' | 'import' | 'generated'`
source taxonomy already on the `evidence` table per PR #9's audit). A single
`resolveEvidenceHealth(evidence)` adapter function — documented here, not implemented —
picks which engine to call based on `evidence.source`, then writes the result into the
already-existing `evidence.status` column. This requires zero new tables, only a future
constraint/check on the existing column plus the adapter function. No third engine is
invented.

### Contradiction 2: `control_evidence` (join table with `coverage`) vs. `evidence.control_id` (direct FK) — two competing control-evidence linkage mechanisms

PR #9's audit found both mechanisms exist (`evidence.control_id` direct FK, used by the
only real service method `EvidenceService.findByControl`; and `control_evidence` join
table with a `coverage` column, `grc_core_engine.sql:111-121`, unused by any service). PR
#7 and PR #10 both assume `EvidenceService.findByControl` is the canonical lookup without
discussing `control_evidence` at all — an implicit, unstated assumption rather than a
resolved one.

**Resolution:** `evidence.control_id` (direct FK) is canonical for the common case of
"evidence supports exactly one control," and remains what every batch should call through
`EvidenceService.findByControl`. `control_evidence` (with its `coverage` column, e.g.
`'primary' | 'supporting'`) is reserved for the **many-to-many case** — evidence that
supports multiple controls with varying degrees of coverage, which the single-FK model
cannot represent. Both tables are kept; `control_evidence` is currently unused because no
evidence in the seeded/demo data yet needs many-to-many coverage, not because it is
redundant. Any future Evidence OS implementation should treat `evidence.control_id` as the
primary-coverage shortcut and `control_evidence` as the authoritative many-to-many record,
syncing the former from the latter's `'primary'`-coverage rows — documented here as the
resolution so a future implementer does not have to re-derive it.

### Contradiction 3: `assessments` table cited as existing by four separate audits, used for four different implied purposes, with zero service

PR #7 (Batch 1), PR #8 (Batch 11), PR #9 (Batch 21), and PR #11 (Batch 51) each
independently re-confirm `assessments`
(`supabase/migrations/202606180001_batch_21_core_data_platform.sql:228`) exists with no
wrapping service — but each audit cites it as relevant to a *different* future use
(governance program assessment generally; questionnaire-adjacent; evidence-program
input; Trust Intelligence input). None of the four actually read the table's column
list in their cited line ranges to confirm whether one shape can serve all four purposes.

**Resolution:** this batch re-reads the table directly:

```sql
-- supabase/migrations/202606180001_batch_21_core_data_platform.sql:228-238
create table assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  framework_id uuid references frameworks(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

This is a generic, framework-scoped, tenant/project-scoped readiness-assessment shell —
broad enough to serve as the eventual backing table for a `ReadinessAssessment` concept
that Trust Intelligence OS's Continuous Assurance or Compliance Center's readiness
calculation could wrap in a service, but it has **no columns specific to questionnaires,
evidence programs, or AI governance** — meaning it cannot be the backing table for
Questionnaire OS's "Response," Evidence OS's evidence-program tracking, or AI Governance
OS's AI risk assessment without each adding its own dedicated table alongside it (which is
exactly what PR #8 and PR #12 each independently and correctly proposed). The contradiction
is resolved by stating explicitly: `assessments` is reserved for **framework-level
readiness assessments only** (a future `AssessmentService` should wrap exactly this), and
none of the four batches should repurpose it for their domain-specific structured data —
each must build its own table as already separately proposed.

### Contradiction 4: PR #11's audit states Evidence OS's and Questionnaire OS's doc directories were "empty when checked this session"

PR #11's `TRUST_INTELLIGENCE_AUDIT.md` (Batch 51) states: "`docs/trust-os/evidence-os/` is
referenced by sibling PRs but empty when checked this session" and the same for
`docs/trust-os/questionnaire-os/`. This batch's own fresh read of
`origin/docs/trust-os-batches-11-20` and `origin/docs/trust-os-batches-21-30` finds both
directories fully populated (13 and 19 files respectively, all with real content, listed
in this batch's own grounding pass). **Resolution: this was a branch-isolation artifact**
— PR #11 was authored from a worktree that had not fetched those two branches at the time,
so its local `docs/trust-os/` tree (which does not include sibling-PR-only paths in a
single-branch checkout) appeared empty. It is not a real contradiction in the documents
themselves, and is recorded here only so a future reader does not mistake PR #11's
"empty when checked" finding for evidence the sibling PRs' content does not exist — it
does, and is fully reconciled by this batch's reads.

## 4. Tables this batch confirms remain accurate, unchanged, requiring no resolution

- `frameworks`, `framework_requirements`, `framework_mappings` (PR #7, #10) — unchanged.
- `governance_scores` (`score integer 0-100`, `controls_implemented`, `evidence_coverage`,
  `risk_treatment`, `assessment_completion`, `explanation` — re-confirmed at
  `202606180001_batch_21_core_data_platform.sql:285-298`) — unchanged, and confirmed to
  have **no question/response/AI columns of any kind**, consistent with every prior
  batch's non-collision statement for Confidence Score and AI Trust Score.
- `governed_agents` and its satellite `agent_*` tables (`agent_raci_assignments`,
  `agent_handoffs`, `agent_memory_policies`, `agent_approval_workflows`,
  `agent_certifications`, `agent_risk_register`, `agent_self_healing_events`,
  `agent_scorecards`, `agent_audit_traces`, `agent_finops_metrics`, `agent_soc_events`) —
  unchanged; confirmed Zig-internal-agent shaped (no `provider`/`vendor`/
  `is_customer_owned` discriminator), correctly excluded from AI Governance OS's customer
  AI inventory scope by PR #12 and re-confirmed here.

## 5. Genuinely missing tables (no contradiction, just absent — listed for completeness)

`questionnaires`, `questions`, `responses`, `question_control_map`, `ai_systems`,
`ai_models`, `ai_risks` (customer-AI-scoped), `ai_controls` (customer-AI-scoped),
`ai_decisions`, `published_documents`, `published_certifications`, `access_requests`,
`trust_certifications`. None exist in any of the 17 migrations on `main`; none are
proposed as net-new by this batch (documentation-only constraint) — each remains owned by
its originating PR's data-model document.
