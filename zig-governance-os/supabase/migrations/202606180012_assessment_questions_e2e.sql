-- Assessment Workflow E2E: question/answer content for learning_assessments.
--
-- Schema check performed before writing this migration: `learning_assessments` and
-- `learning_assessment_results` (202606180007_learning_os_e2e.sql) store only the
-- assessment definition (title, passing_score) and the final result (score, passed,
-- remediation_skill_ids). Neither stores individual questions or correct answers, and no
-- other migration in this repo defines anything resembling an assessment-question table
-- (grep across supabase/migrations for "question" found nothing). A new table is required
-- to score a real submitted answer set rather than a hardcoded composite average.

create table if not exists learning_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  assessment_id uuid not null references learning_assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_option_index integer not null,
  weight integer not null default 1,
  order_index integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_assessment_questions_assessment_idx
  on learning_assessment_questions (assessment_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['learning_assessment_questions']
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
