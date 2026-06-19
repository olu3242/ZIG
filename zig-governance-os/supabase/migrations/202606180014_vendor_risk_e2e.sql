-- Vendor / Third-Party Risk: closes Workflow #10 (Vendor Assessment) per
-- docs/certification/E2E_GAP_REPORT.md ("none — no vendor tables in any migration") and
-- docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md ("no schema, no service, no route").
--
-- Scoped per docs/product/prd.md Section 11 ("Documented module-surface gap: Third-Party /
-- Vendor Risk") as an EXTENSION of the existing Risk Workspace (module #5) — the same way
-- risk_assessments/risk_acceptances/risk_reviews/risk_treatments
-- (202606180005_grc_core_engine.sql, lines 174-215) already hang off `risks` without being
-- a separate top-level module. This migration does NOT introduce a 12th product module.
--
-- A vendor is assessed (producing a risk posture) and reviewed (producing findings) — the
-- same shape `risks` already has via risk_assessments/risk_reviews, reused here rather than
-- inventing a parallel pattern. `lab_artifacts.artifact_type` already has a
-- 'vendor_review' value (202606180013_lab_workflow_e2e.sql) anticipating this workflow.
--
-- A grep across every migration in supabase/migrations/ for "vendor" returned no table
-- definitions before this change (confirmed, not assumed) — three new tables are required:
--   - vendors: the third-party entity itself (name, category, criticality, status).
--   - vendor_assessments: a point-in-time risk assessment of a vendor (mirrors
--     risk_assessments' likelihood/impact/severity shape).
--   - vendor_findings: individual gaps/issues raised by an assessment, with remediation
--     tracking (mirrors how risk_treatments tracks remediation of a risk).

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  criticality text not null default 'medium' check (criticality in ('low', 'medium', 'high', 'critical')),
  status text not null default 'active' check (status in ('active', 'offboarding', 'offboarded')),
  contact_email text,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_project_idx on vendors (tenant_id, project_id);

create table if not exists vendor_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  assessed_by_user_id uuid references users(id) on delete set null,
  likelihood integer not null check (likelihood between 1 and 5),
  impact integer not null check (impact between 1 and 5),
  risk_score integer not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  assessed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendor_assessments_vendor_idx on vendor_assessments (vendor_id);

create table if not exists vendor_findings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  vendor_assessment_id uuid not null references vendor_assessments(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  title text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'remediating', 'resolved', 'accepted')),
  remediation_due_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendor_findings_assessment_idx on vendor_findings (vendor_assessment_id);
create index if not exists vendor_findings_vendor_idx on vendor_findings (vendor_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['vendors', 'vendor_assessments', 'vendor_findings']
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
