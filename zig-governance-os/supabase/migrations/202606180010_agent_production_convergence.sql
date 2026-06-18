-- Agent Governance OS production convergence: live ingestion, ledger, telemetry, costing, alerting, chaos, reliability.

create table if not exists agent_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_id text not null,
  source text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_event_stream (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  stream_key text not null,
  last_event_id uuid references agent_events(id) on delete set null,
  sequence_number bigint not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_event_failures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_id text not null,
  source text not null,
  event_type text not null,
  failure_reason text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_id text not null,
  ledger_version integer not null,
  previous_hash text,
  input_hash text not null,
  output_hash text not null,
  reasoning_hash text not null,
  confidence integer not null default 0,
  approvals text[] not null default '{}',
  escalations text[] not null default '{}',
  failures text[] not null default '{}',
  recoveries text[] not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_ledger_hashes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_ledger_id uuid references agent_ledger(id) on delete cascade,
  hash_algorithm text not null default 'sha256',
  hash_value text not null,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_ledger_id uuid references agent_ledger(id) on delete cascade,
  evidence_type text not null,
  evidence_uri text not null,
  exportable boolean not null default true,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists model_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  provider text not null,
  model_version text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  retries integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists model_costs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  model_usage_id uuid references model_usage(id) on delete cascade,
  cost numeric not null default 0,
  currency text not null default 'USD',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists model_failures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  provider text not null,
  model_version text not null,
  failure_reason text not null,
  retry_count integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists model_latency (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  provider text not null,
  model_version text not null,
  latency_ms integer not null default 0,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_cost_feeds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  cost_per_agent numeric not null default 0,
  cost_per_workflow numeric not null default 0,
  cost_per_tenant numeric not null default 0,
  cost_per_student numeric not null default 0,
  cost_per_assessment numeric not null default 0,
  cost_per_report numeric not null default 0,
  observed_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_alert_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  alert_type text not null,
  severity text not null,
  channels text[] not null default '{}',
  enabled boolean not null default true,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_alert_route_id uuid references agent_alert_routes(id) on delete cascade,
  delivery_status text not null default 'queued',
  delivered_at timestamptz,
  failure_reason text,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_chaos_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scenario text not null,
  self_healing_validated boolean not null default false,
  escalation_validated boolean not null default false,
  recovery_validated boolean not null default false,
  fallback_validated boolean not null default false,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_reliability_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  agent_id text not null,
  mttr_minutes numeric not null default 0,
  mtbf_hours numeric not null default 0,
  recovery_rate numeric not null default 0,
  escalation_rate numeric not null default 0,
  failure_rate numeric not null default 0,
  approval_accuracy numeric not null default 0,
  confidence_accuracy numeric not null default 0,
  observed_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supervisor_validations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  supervisor_key text not null,
  escalation_passed boolean not null default false,
  approval_passed boolean not null default false,
  override_passed boolean not null default false,
  recovery_passed boolean not null default false,
  auditability_passed boolean not null default false,
  validated_at timestamptz not null default now(),
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
    'agent_events','agent_event_stream','agent_event_failures','agent_ledger','agent_ledger_hashes','agent_evidence',
    'model_usage','model_costs','model_failures','model_latency','agent_cost_feeds','agent_alert_routes',
    'agent_alert_deliveries','agent_chaos_runs','agent_reliability_metrics','supervisor_validations'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
