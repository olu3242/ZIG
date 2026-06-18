-- Batch 21: Zig Core Data Platform
-- Canonical PostgreSQL/Supabase schema for tenant-scoped governance records.

create extension if not exists pgcrypto;

create type tenant_status as enum ('trial', 'active', 'suspended', 'archived');
create type project_status as enum ('draft', 'active', 'assessment', 'remediation', 'audit_ready', 'certified', 'paused', 'completed');
create type record_status as enum ('draft', 'active', 'archived');
create type task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type audit_event_action as enum ('create', 'update', 'delete', 'approve', 'review', 'certification');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_tenant_id', true), '')::uuid;
$$;

create or replace function set_tenant_self_id()
returns trigger
language plpgsql
as $$
begin
  new.tenant_id = new.id;
  return new;
end;
$$;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid unique,
  slug text not null unique,
  name text not null,
  status tenant_status not null default 'trial',
  settings jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  subscription jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  action text not null,
  resource text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, action, resource)
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  role_id uuid references roles(id) on delete set null,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  status text not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  framework_id uuid,
  industry text,
  status project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table frameworks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  code text not null,
  name text not null,
  version text not null,
  description text not null default '',
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code, version)
);

alter table projects
  add constraint projects_framework_id_fkey foreign key (framework_id) references frameworks(id) on delete set null;

create table controls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  framework_id uuid not null references frameworks(id) on delete restrict,
  owner_user_id uuid references users(id) on delete set null,
  control_id text not null,
  title text not null,
  description text not null default '',
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, project_id, framework_id, control_id)
);

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

create table assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  name text not null,
  category text not null,
  criticality text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table risks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  title text not null,
  description text not null default '',
  severity text not null default 'medium',
  treatment text not null default 'mitigate',
  residual_risk text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table risk_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  risk_id uuid not null references risks(id) on delete cascade,
  likelihood integer not null check (likelihood between 1 and 5),
  impact integer not null check (impact between 1 and 5),
  severity text not null,
  treatment_decision text not null,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  control_id uuid not null references controls(id) on delete cascade,
  submitted_by_user_id uuid references users(id) on delete set null,
  title text not null,
  status text not null default 'missing',
  source_uri text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  title text not null,
  status task_status not null default 'todo',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  framework_id uuid not null references frameworks(id) on delete restrict,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table learning_paths (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  description text not null default '',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table learning_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learning_path_id uuid not null references learning_paths(id) on delete cascade,
  title text not null,
  module_type text not null,
  duration_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text not null default '',
  framework_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scenario_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  scenario_id uuid not null references scenarios(id) on delete cascade,
  status text not null default 'not_started',
  score_delta integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table governance_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  controls_implemented integer not null default 0,
  evidence_coverage integer not null default 0,
  risk_treatment integer not null default 0,
  assessment_completion integer not null default 0,
  explanation text not null default '',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  severity text not null,
  title text not null,
  explanation text not null,
  action text not null,
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  framework_reference text,
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  action audit_event_action not null,
  entity_table text not null,
  entity_id uuid not null,
  before_state jsonb,
  after_state jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index on permissions (tenant_id);
create index on tenants (tenant_id);
create index on roles (tenant_id);
create index on users (tenant_id);
create index on projects (tenant_id);
create index on frameworks (tenant_id);
create index on controls (tenant_id, project_id);
create index on control_mappings (tenant_id, project_id);
create index on assets (tenant_id, project_id);
create index on risks (tenant_id, project_id, asset_id);
create index on risk_assessments (tenant_id, project_id, risk_id);
create index on evidence (tenant_id, project_id, control_id);
create index on tasks (tenant_id, project_id);
create index on audits (tenant_id, project_id);
create index on assessments (tenant_id, project_id);
create index on learning_paths (tenant_id);
create index on learning_modules (tenant_id, learning_path_id);
create index on scenarios (tenant_id, project_id);
create index on scenario_runs (tenant_id, project_id, scenario_id);
create index on governance_scores (tenant_id, project_id, calculated_at desc);
create index on recommendations (tenant_id, project_id);
create index on audit_events (tenant_id, entity_table, entity_id, created_at desc);

create trigger set_tenants_updated_at before update on tenants for each row execute function set_updated_at();
create trigger set_tenants_self_id before insert or update on tenants for each row execute function set_tenant_self_id();
create trigger set_permissions_updated_at before update on permissions for each row execute function set_updated_at();
create trigger set_roles_updated_at before update on roles for each row execute function set_updated_at();
create trigger set_users_updated_at before update on users for each row execute function set_updated_at();
create trigger set_projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger set_frameworks_updated_at before update on frameworks for each row execute function set_updated_at();
create trigger set_controls_updated_at before update on controls for each row execute function set_updated_at();
create trigger set_control_mappings_updated_at before update on control_mappings for each row execute function set_updated_at();
create trigger set_assets_updated_at before update on assets for each row execute function set_updated_at();
create trigger set_risks_updated_at before update on risks for each row execute function set_updated_at();
create trigger set_risk_assessments_updated_at before update on risk_assessments for each row execute function set_updated_at();
create trigger set_evidence_updated_at before update on evidence for each row execute function set_updated_at();
create trigger set_tasks_updated_at before update on tasks for each row execute function set_updated_at();
create trigger set_audits_updated_at before update on audits for each row execute function set_updated_at();
create trigger set_assessments_updated_at before update on assessments for each row execute function set_updated_at();
create trigger set_learning_paths_updated_at before update on learning_paths for each row execute function set_updated_at();
create trigger set_learning_modules_updated_at before update on learning_modules for each row execute function set_updated_at();
create trigger set_scenarios_updated_at before update on scenarios for each row execute function set_updated_at();
create trigger set_scenario_runs_updated_at before update on scenario_runs for each row execute function set_updated_at();
create trigger set_governance_scores_updated_at before update on governance_scores for each row execute function set_updated_at();
create trigger set_recommendations_updated_at before update on recommendations for each row execute function set_updated_at();

alter table tenants enable row level security;
alter table permissions enable row level security;
alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table users enable row level security;
alter table projects enable row level security;
alter table frameworks enable row level security;
alter table controls enable row level security;
alter table control_mappings enable row level security;
alter table assets enable row level security;
alter table risks enable row level security;
alter table risk_assessments enable row level security;
alter table evidence enable row level security;
alter table tasks enable row level security;
alter table audits enable row level security;
alter table assessments enable row level security;
alter table learning_paths enable row level security;
alter table learning_modules enable row level security;
alter table scenarios enable row level security;
alter table scenario_runs enable row level security;
alter table governance_scores enable row level security;
alter table recommendations enable row level security;
alter table audit_events enable row level security;

create policy tenant_self_access on tenants
  using (id = current_tenant_id())
  with check (id = current_tenant_id());

create policy tenant_permissions_access on permissions using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_roles_access on roles using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_role_permissions_access on role_permissions using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_users_access on users using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_projects_access on projects using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_frameworks_access on frameworks using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_controls_access on controls using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_control_mappings_access on control_mappings using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_assets_access on assets using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_risks_access on risks using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_risk_assessments_access on risk_assessments using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_evidence_access on evidence using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_tasks_access on tasks using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_audits_access on audits using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_assessments_access on assessments using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_learning_paths_access on learning_paths using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_learning_modules_access on learning_modules using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_scenarios_access on scenarios using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_scenario_runs_access on scenario_runs using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_governance_scores_access on governance_scores using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_recommendations_access on recommendations using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
create policy tenant_audit_events_access on audit_events using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id());
