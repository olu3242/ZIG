-- Learning OS E2E: skills graph, adaptive learning, assessments, practice lab, cohorts, mentorship, career outcomes.

create table if not exists skill_nodes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  node_type text not null,
  label text not null,
  domain text not null,
  parent_skill_id uuid references skill_nodes(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_skill_mastery (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  skill_node_id uuid references skill_nodes(id) on delete cascade,
  proficiency integer not null default 0,
  experience_hours numeric not null default 0,
  last_assessed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists adaptive_learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  skill_node_id uuid references skill_nodes(id) on delete set null,
  priority text not null default 'medium',
  recommended_action text not null,
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  assessment_type text not null,
  title text not null,
  passing_score integer not null default 75,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_assessment_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  assessment_id uuid references learning_assessments(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  score integer not null default 0,
  passed boolean not null default false,
  remediation_skill_ids uuid[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulated_companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  industry text not null,
  maturity integer not null default 50,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulated_company_objects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  simulated_company_id uuid references simulated_companies(id) on delete cascade,
  object_type text not null,
  name text not null,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists capstone_projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  portfolio_score integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_portfolios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  validation_status text not null default 'pending',
  portfolio_score integer not null default 0,
  resume_summary text not null default '',
  linkedin_summary text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_cohorts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  cohort_type text not null default 'bootcamp',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mentorship_matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  mentor_user_id uuid references users(id) on delete set null,
  match_score integer not null default 0,
  status text not null default 'proposed',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employment_outcomes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid references users(id) on delete cascade,
  target_role text not null,
  readiness_score integer not null default 0,
  job_match_status text not null default 'not_started',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'skill_nodes','learner_skill_mastery','adaptive_learning_recommendations','learning_assessments',
    'learning_assessment_results','simulated_companies','simulated_company_objects','capstone_projects',
    'learner_portfolios','learning_cohorts','mentorship_matches','employment_outcomes'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
