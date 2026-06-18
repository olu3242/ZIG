-- Agent Governance OS: control tower, registry, RACI, approvals, certification, risk, audit, SOC, and FinOps.

create table if not exists governed_agents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_key text not null,
  agent_name text not null,
  agent_type text not null,
  owner text not null,
  department text not null,
  supervisor text not null,
  permissions text[] not null default '{}',
  tools text[] not null default '{}',
  status text not null default 'active',
  version text not null default '1.0.0',
  certification_level integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_raci_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  responsible text not null,
  accountable text not null,
  consulted text[] not null default '{}',
  informed text[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_handoffs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  from_agent text not null,
  to_agent text not null,
  context text not null default '',
  state text not null default '',
  completed_work text[] not null default '{}',
  evidence text[] not null default '{}',
  confidence integer not null default 0,
  recommendations text[] not null default '{}',
  next_steps text[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_memory_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  memory_store text not null,
  retention_days integer not null default 30,
  encrypted boolean not null default true,
  auditable boolean not null default true,
  access_control boolean not null default true,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_approval_workflows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  approval_level integer not null default 1,
  label text not null,
  decision text not null default 'requested',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_certifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  certification_level integer not null default 0,
  certification_label text not null default 'prototype',
  passed_tests text[] not null default '{}',
  certified_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_risk_register (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  risk_type text not null,
  likelihood integer not null default 0,
  impact integer not null default 0,
  treatment text not null default '',
  mitigation_plan text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_self_healing_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  failure_signal text not null,
  remediation text not null,
  status text not null default 'planned',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_scorecards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  score integer not null default 0,
  ranking text not null default 'needs_review',
  metrics jsonb not null default '{}'::jsonb,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_audit_traces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  input_hash text not null,
  output_hash text not null,
  reasoning_summary text not null default '',
  confidence integer not null default 0,
  approvals text[] not null default '{}',
  actions text[] not null default '{}',
  escalations text[] not null default '{}',
  failures text[] not null default '{}',
  recoveries text[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_finops_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete cascade,
  token_usage numeric not null default 0,
  model_costs numeric not null default 0,
  execution_costs numeric not null default 0,
  department_costs numeric not null default 0,
  tenant_costs numeric not null default 0,
  roi numeric not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_soc_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete set null,
  threat_type text not null,
  severity text not null default 'medium',
  remediation text not null default '',
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  governed_agent_id uuid references governed_agents(id) on delete set null,
  signal text not null,
  value numeric not null default 0,
  payload jsonb not null default '{}'::jsonb,
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
    'governed_agents','agent_raci_assignments','agent_handoffs','agent_memory_policies','agent_approval_workflows',
    'agent_certifications','agent_risk_register','agent_self_healing_events','agent_scorecards','agent_audit_traces',
    'agent_finops_metrics','agent_soc_events','agent_telemetry_events'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
