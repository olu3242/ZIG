-- Trust Center + Security Assurance Platform (Phase 11.5). Per the audit performed before
-- this migration (see docs/certification/TRUST_CENTER_CERTIFICATION.md), every internal
-- intelligence input (controls, evidence, audit_events, vendors, governance_scores,
-- framework_controls/mappings) already exists with RLS applied. Compliance status, security
-- health, and audit readiness are computed at read time over those tables (same precedent as
-- GovernanceService.calculateScore and the Phase 11B framework intelligence services) and are
-- NOT persisted here. The seven tables below are the only genuinely new, point-in-time facts
-- this phase introduces: a published trust profile, a document an org chooses to publish, a
-- visitor's access request, a questionnaire template/submission/answer, and an access log
-- entry — none of these are derivable from existing rows.
create table if not exists trust_center_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  slug text not null unique,
  organization_name text not null,
  tagline text,
  support_email text,
  is_published boolean not null default false,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trust_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  category text not null,
  visibility text not null default 'protected',
  source_uri text not null,
  expires_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trust_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  document_id uuid references trust_documents(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  requester_company text,
  reason text not null default '',
  status text not null default 'pending',
  decided_by_user_id uuid references users(id) on delete set null,
  decided_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists questionnaire_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  template_type text not null default 'custom',
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  template_id uuid not null references questionnaire_templates(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  status text not null default 'in_progress',
  completed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists questionnaire_answers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  submission_id uuid not null references questionnaire_submissions(id) on delete cascade,
  question_key text not null,
  question_text text not null,
  answer_text text not null default '',
  ai_generated boolean not null default false,
  confidence numeric(3,2) not null default 0,
  reasoning text not null default '',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trust_access_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  event_type text not null,
  resource_id uuid,
  visitor_email text,
  occurred_at timestamptz not null default now(),
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
    'trust_center_profiles', 'trust_documents', 'trust_requests',
    'questionnaire_templates', 'questionnaire_submissions', 'questionnaire_answers',
    'trust_access_logs'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('drop policy if exists %I on %I', table_name || '_tenant_access', table_name);
    execute format('create policy %I on %I using (tenant_id = current_tenant_id()) with check (tenant_id = current_tenant_id())', table_name || '_tenant_access', table_name);
    execute format('drop trigger if exists set_%I_updated_at on %I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()', table_name, table_name);
  end loop;
end $$;

-- The Trust Portal is the one part of Zig that is, by design, read by anonymous visitors
-- (auditors, prospects, vendors) rather than an authenticated tenant member. The app server
-- still resolves a single tenant by published slug before issuing any query (see
-- apps/web/app/lib/trustPublic.ts), but these narrow anon-select policies are the
-- defense-in-depth equivalent for any client that talks to Supabase directly, scoped to only
-- the rows an org has explicitly chosen to publish.
create policy trust_center_profiles_public_read on trust_center_profiles
  for select to anon using (is_published = true);

create policy trust_documents_public_read on trust_documents
  for select to anon using (visibility = 'public');

create policy trust_requests_public_insert on trust_requests
  for insert to anon with check (status = 'pending');
