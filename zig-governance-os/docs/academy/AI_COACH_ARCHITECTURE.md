# AI Coach Architecture

> Proposed architecture for an AI Coach grounded in the verified fact that no
> conversation/message table and no LLM client exist anywhere in this repo today. This
> document proposes schema and integration points without implementing them.

## 1. Verified current state

- `apps/web/app/ai-command/page.tsx` (the literal "AI Command Center" route) renders three
  static `StatCard`s: `value="0"` with detail "AI-generated records require the later AI
  platform batch," `value="N/A"` for confidence scoring, and `value="0"` for framework
  references (lines 12-14). Four "Command Starter" buttons render but are not wired to any
  action (lines 16-23).
- A repo-wide grep for `conversation`, `chat_message`, and `coach_session` across every
  `.ts` and `.sql` file returns **zero matches**. No conversation/message table exists in
  any migration.
- No LLM client (OpenAI, Anthropic, or otherwise) is referenced anywhere in `packages/` or
  `apps/`.
- `docs/certification/E2E_GAP_REPORT.md` and `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md`
  both independently confirm this same finding (AI Coach Session row: "Table(s) = none —
  no conversation table," Status = OPEN, one of only 3 workflows in the matrix described as
  "blocked at the schema level").

This document does not contradict or duplicate those findings — it proposes the schema and
integration points that would close the gap, explicitly as new work.

## 2. Proposed schema (new tables — not built)

```sql
-- Proposed, not created by this document.
create table coach_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid not null references users(id) on delete cascade,
  context_type text not null check (context_type in
    ('learning_path','lesson','assessment','lab','general')),
  context_id uuid,            -- nullable FK target depends on context_type;
                               -- e.g. learning_paths.id, learning_modules.id,
                               -- learning_assessments.id, or scenarios.id
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  conversation_id uuid not null references coach_conversations(id) on delete cascade,
  role text not null check (role in ('learner','coach')),
  content text not null,
  -- explainability fields, per CLAUDE.md's "every AI recommendation must be
  -- explainable" rule — applied here even though this is a conversational
  -- surface, not a generator, because coach responses that reference
  -- specific learner data (e.g. "your last assessment score was X") should
  -- carry the same reason/data/confidence discipline as any other AI output.
  reasoning text,
  supporting_data jsonb default '{}',
  confidence numeric,
  framework_reference text,
  created_at timestamptz not null default now()
);
```

This follows the same tenant-scoping and RLS pattern every other table in this Learning OS
uses (`tenant_id` FK + `<table>_tenant_access` policy, per the pattern in
`202606180007_learning_os_e2e.sql` and `202606180011_learning_progress_e2e.sql`/
`202606180012_assessment_questions_e2e.sql`/`202606180013_lab_workflow_e2e.sql`).

## 3. Why `context_type`/`context_id` instead of separate FK columns

A coach conversation could be anchored to a learning path, a specific lesson, an
assessment, or a lab run. Rather than adding four nullable FK columns (one per possible
anchor, only one populated at a time), the proposed schema uses a single
`context_type`/`context_id` pair — the same pattern already used by
`adaptive_learning_recommendations.skill_node_id` style nullable-FK relationships
elsewhere in the Learning OS schema, generalized to multiple possible target tables. This
avoids a 4-column sparse-FK table while keeping the relationship queryable per type.

## 4. Proposed integration points (specification only)

| Integration point | What it would do | Where it would live |
|---|---|---|
| `CoachService` (new, following the `BaseService<T>` pattern) | `startConversation(context, contextType, contextId)`, `sendMessage(context, conversationId, content)`, `getHistory(context, conversationId)` | `packages/services/src/CoachService.ts` (does not exist) |
| LLM client wrapper | Wraps a chosen provider's completion API; takes a conversation history + structured learner context (current `student_twins` scores, recent `learning_assessment_results`, recent `lab_artifacts`) and returns a coach response | `packages/ai-coach-client/` or similar new package (does not exist) — naming follows the existing `packages/*` per-concern convention already used for e.g. `@zig/progress-engine`, `@zig/completion-engine` |
| Explainability enforcement | Every coach response that makes a recommendation (not just conversational filler) must populate `reasoning`, `supporting_data`, `confidence`, and `framework_reference` where applicable — enforced at the `CoachService` layer, not left to the LLM call to self-report | `CoachService.sendMessage`, per `CLAUDE.md`'s explainable-AI rule |
| `/ai-command` page wiring | Replace the static `StatCard`s with real counts from `coach_conversations`/`coach_messages`; replace the 4 unwired "Command Starter" buttons with real `startConversation` calls | `apps/web/app/ai-command/page.tsx` |

## 5. Open questions this document does not resolve

- Which LLM provider/model to use, and how API keys/secrets would be managed — out of
  scope for a documentation-only task and a product/infra decision, not an architecture one.
- Whether coach conversations should be scoped per-tenant-shared or per-learner-private by
  default (the proposed RLS policy above is per-learner via `learner_user_id`, consistent
  with every other learner-scoped table in this schema, e.g. `user_progress`,
  `learning_assessment_results`).
- Whether `coach_messages.content` for the `coach` role should be persisted verbatim or
  redacted/summarized for storage cost — not addressed here.

## 6. What this document does not do

- It does not create `coach_conversations` or `coach_messages`.
- It does not write `CoachService`.
- It does not select or integrate an LLM provider.
- It does not modify `apps/web/app/ai-command/page.tsx`.
