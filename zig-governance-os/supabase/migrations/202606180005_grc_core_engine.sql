-- Phase 3: GRC Core Engine, framework intelligence, controls, risks, evidence, audits, policies, and gaps.

alter type audit_event_action add value if not exists 'test';
alter type audit_event_action add value if not exists 'attest';
alter type audit_event_action add value if not exists 'accept_risk';

create table if not exists framework_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  framework_id uuid references frameworks(id) on delete cascade,
  version text not null,
  status text not null default 'active',
  effective_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists framework_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  framework_id uuid references frameworks(id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists framework_controls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  framework_id uuid references frameworks(id) on delete cascade,
  domain_id uuid references framework_domains(id) on delete set null,
  control_code text not null,
  title text not null,
  description text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists framework_requirements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  framework_control_id uuid references framework_controls(id) on delete cascade,
  requirement_code text not null,
  requirement_text text not null,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists framework_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source_framework_control_id uuid references framework_controls(id) on delete cascade,
  target_framework_control_id uuid references framework_controls(id) on delete cascade,
  mapping_strength text not null default 'partial',
  rationale text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists framework_crosswalks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source_framework_id uuid references frameworks(id) on delete cascade,
  target_framework_id uuid references frameworks(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_owners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  accountability text not null default 'owner',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_tests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  test_type text not null default 'manual',
  outcome text not null default 'not_tested',
  tested_by_user_id uuid references users(id) on delete set null,
  tested_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  evidence_id uuid references evidence(id) on delete cascade,
  coverage text not null default 'supporting',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_effectiveness (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  effectiveness_score integer not null default 0,
  maturity_score integer not null default 0,
  scoring_label text not null default 'not_implemented',
  assessed_at timestamptz not null default now(),
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_exceptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  expires_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists control_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  control_id uuid references controls(id) on delete cascade,
  reviewer_user_id uuid references users(id) on delete set null,
  status text not null default 'pending',
  reviewed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists risk_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists risk_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  risk_id uuid references risks(id) on delete cascade,
  reviewer_user_id uuid references users(id) on delete set null,
  residual_risk integer not null default 0,
  status text not null default 'pending',
  reviewed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists risk_acceptances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  risk_id uuid references risks(id) on delete cascade,
  accepted_by_user_id uuid references users(id) on delete set null,
  rationale text not null,
  expires_at timestamptz,
  status text not null default 'active',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists risk_treatments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  risk_id uuid references risks(id) on delete cascade,
  strategy text not null,
  treatment_effectiveness integer not null default 0,
  owner_user_id uuid references users(id) on delete set null,
  due_at timestamptz,
  status text not null default 'planned',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  source text not null default 'manual_upload',
  retention_days integer,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  evidence_id uuid references evidence(id) on delete cascade,
  reviewer_user_id uuid references users(id) on delete set null,
  status text not null default 'pending_review',
  reviewed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists evidence_collections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  purpose text not null default '',
  status text not null default 'open',
  due_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_programs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  framework_id uuid references frameworks(id) on delete set null,
  status text not null default 'planned',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_findings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  audit_id uuid references audits(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  finding_id uuid references audit_findings(id) on delete cascade,
  recommendation text not null,
  priority text not null default 'medium',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  finding_id uuid references audit_findings(id) on delete cascade,
  responder_user_id uuid references users(id) on delete set null,
  response text not null,
  status text not null default 'submitted',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_remediations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  finding_id uuid references audit_findings(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  plan text not null,
  due_at timestamptz,
  status text not null default 'open',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  policy_type text not null default 'policy',
  title text not null,
  status text not null default 'draft',
  owner_user_id uuid references users(id) on delete set null,
  published_at timestamptz,
  review_due_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists policy_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  policy_id uuid references policies(id) on delete cascade,
  approver_user_id uuid references users(id) on delete set null,
  status text not null default 'pending',
  approved_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists policy_attestations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  policy_id uuid references policies(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text not null default 'pending',
  attested_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gap_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  gap_type text not null,
  expected_count integer not null default 0,
  missing_count integer not null default 0,
  readiness_score integer not null default 0,
  band text not null default 'red',
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
    'framework_versions','framework_domains','framework_controls','framework_requirements','framework_mappings','framework_crosswalks',
    'control_owners','control_tests','control_evidence','control_effectiveness','control_exceptions','control_reviews',
    'risk_categories','risk_reviews','risk_acceptances','risk_treatments',
    'evidence_types','evidence_reviews','evidence_collections',
    'audit_programs','audit_findings','audit_recommendations','audit_responses','audit_remediations',
    'policies','policy_approvals','policy_attestations','gap_assessments'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;
