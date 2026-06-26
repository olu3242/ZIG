-- Evidence OS Phase 1: net-new entities per
-- docs/trust-os/evidence-os/EVIDENCE_DATA_MODEL.md (Batch 22) and
-- docs/trust-os/runtime-convergence/TRUST_OS_COMPONENT_MAP.md ("Implement" rows under
-- the Evidence section: Evidence Request Workflow, Evidence Intelligence / discovery
-- support, Evidence expiration alerting).
--
-- Five of eight Evidence OS entities reuse existing tables (evidence, evidence_collections,
-- control_evidence, evidence_reviews) per the data model doc -- those are NOT duplicated
-- here. Only the genuinely new tables are created in this migration:
--   evidence_sources   -- "where did this evidence come from" (Evidence Source entity)
--   evidence_requests  -- Request -> Assign -> Collect -> Review -> Approve -> Map tracking
--                         (Evidence Request entity, EVIDENCE_REQUEST_WORKFLOW.md, Batch 28)
--   evidence_alerts    -- expiration alert log (Evidence Expiration entity, Batch 27);
--                         expiration state itself derives from evidence.expires_at + health,
--                         not stored separately -- only the alert log is new.

create table if not exists evidence_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  evidence_id uuid not null references evidence(id) on delete cascade,
  source_type text not null default 'manual_upload'
    check (source_type in ('policy', 'procedure', 'standard', 'assessment', 'audit_report', 'manual_upload', 'integration')),
  source_ref_id uuid,
  discovered_via text not null default 'manual'
    check (discovered_via in ('manual', 'evidence_discovery_engine')),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid not null references controls(id) on delete cascade,
  requested_from_user_id uuid references users(id) on delete set null,
  collection_id uuid references evidence_collections(id) on delete set null,
  status text not null default 'requested'
    check (status in ('requested', 'assigned', 'collected', 'reviewed', 'approved')),
  due_at timestamptz,
  resulting_evidence_id uuid references evidence(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  evidence_id uuid not null references evidence(id) on delete cascade,
  alert_type text not null default 'expiring'
    check (alert_type in ('expiring', 'expired', 'missing')),
  triggered_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evidence_sources_evidence_id_idx on evidence_sources(evidence_id);
create index if not exists evidence_requests_control_id_idx on evidence_requests(control_id);
create index if not exists evidence_requests_status_idx on evidence_requests(status);
create index if not exists evidence_alerts_evidence_id_idx on evidence_alerts(evidence_id);

-- RLS: exact existing tenant-isolation pattern from
-- supabase/migrations/202606180005_grc_core_engine.sql (the `do $$ ... loop $$` block that
-- enables RLS, creates the `<table>_tenant_access` policy keyed on current_tenant_id(), and
-- wires the shared set_updated_at() trigger) -- copied precisely, not reinvented, per
-- docs/data/RLS_STRATEGY.md's single canonical policy pattern:
--   using (tenant_id = current_tenant_id())
--   with check (tenant_id = current_tenant_id())
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'evidence_sources','evidence_requests','evidence_alerts'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
