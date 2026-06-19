-- Lab Workflow E2E: task definitions + scored artifacts for the existing
-- scenarios / scenario_runs tables.
--
-- Schema check performed before writing this migration: `scenarios` and `scenario_runs`
-- (202606180001_batch_21_core_data_platform.sql, lines 261-283, read directly, not
-- assumed) already store everything needed to launch and track a lab run:
-- scenario_runs.status ('not_started' | 'running' | 'paused' | 'completed'),
-- scenario_runs.score_delta, started_at, completed_at. There is no need to add a
-- redundant "lab_runs" table or duplicate status/score columns onto a new table —
-- scenario_runs IS the lab run, reused as-is exactly like the Assessment migration
-- reused learning_assessments/learning_assessment_results.
--
-- Also checked: `simulated_companies` / `simulated_company_objects`
-- (202606180007_learning_os_e2e.sql, lines 70-93) model a free-floating company
-- simulation (industry, maturity, arbitrary typed objects) and are unrelated to
-- per-scenario task/submission/artifact tracking — they are not extended here,
-- consistent with the gap report's finding that they are a separate, already-existing
-- surface.
--
-- A grep across every migration in supabase/migrations/ for "lab_task", "lab_artifact",
-- "scenario_task", and "submission" returned no hits. No table for lab tasks,
-- submissions, or artifacts exists anywhere in this schema (confirming the audit
-- finding). Two new tables are required, not optional:
--   - lab_tasks: per-scenario task definitions (title, instructions, expected output type).
--   - lab_artifacts: the scored artifact produced when a scenario_run is submitted/scored,
--     plus a lab_task_submissions join table so individual task completions persist
--     before the run is scored (mirrors learning_assessment_questions feeding into
--     learning_assessment_results).

create table if not exists lab_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scenario_id uuid not null references scenarios(id) on delete cascade,
  title text not null,
  instructions text not null default '',
  expected_output_type text not null default 'text',
  weight integer not null default 1,
  order_index integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lab_tasks_scenario_idx on lab_tasks (scenario_id);

create table if not exists lab_task_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scenario_run_id uuid not null references scenario_runs(id) on delete cascade,
  lab_task_id uuid not null references lab_tasks(id) on delete cascade,
  submitted_by uuid references users(id) on delete set null,
  content jsonb not null default '{}'::jsonb,
  is_complete boolean not null default true,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lab_task_submissions_run_idx on lab_task_submissions (scenario_run_id);
create index if not exists lab_task_submissions_task_idx on lab_task_submissions (lab_task_id);

create table if not exists lab_artifacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scenario_run_id uuid not null references scenario_runs(id) on delete cascade,
  artifact_type text not null check (
    artifact_type in ('risk_register', 'audit_finding', 'gap_assessment', 'evidence_record', 'vendor_review')
  ),
  content jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lab_artifacts_run_idx on lab_artifacts (scenario_run_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['lab_tasks', 'lab_task_submissions', 'lab_artifacts']
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
