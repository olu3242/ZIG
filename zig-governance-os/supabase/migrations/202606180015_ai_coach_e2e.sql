-- AI Coach: closes Workflow "AI Coach Session" per docs/certification/E2E_GAP_REPORT.md
-- (#8 AI Coach — FAIL: "static cards, no conversation/message table") and
-- docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md ("Table(s) = none — no conversation
-- table", one of only 3 workflows described as "blocked at the schema level").
--
-- This is module #9 (AI Command Center) on CLAUDE.md's canonical 11-module list — no PRD
-- gap-justification section is required (unlike Vendor/Career), since AI Command Center
-- already is a top-level module; this migration closes a gap *within* it.
--
-- Schema follows the proposal already written (not built) in
-- docs/academy/AI_COACH_ARCHITECTURE.md Section 2, including its context_type/context_id
-- rationale (Section 3) and its explainability columns (Section 2, mirroring CLAUDE.md's
-- "every AI recommendation must be explainable" rule).
--
-- A grep across every migration for "conversation", "chat_message", "coach_session" before
-- this change returned no table definitions (confirmed, not assumed).

create table if not exists coach_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid not null references users(id) on delete cascade,
  context_type text not null default 'general' check (context_type in ('learning_path', 'lesson', 'assessment', 'lab', 'general')),
  context_id uuid,
  started_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_conversations_learner_idx on coach_conversations (tenant_id, learner_user_id);

create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  conversation_id uuid not null references coach_conversations(id) on delete cascade,
  role text not null check (role in ('learner', 'coach')),
  content text not null,
  reasoning text,
  supporting_data jsonb not null default '{}'::jsonb,
  confidence numeric,
  framework_reference text,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_messages_conversation_idx on coach_messages (conversation_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['coach_conversations', 'coach_messages']
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
