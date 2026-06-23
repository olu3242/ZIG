-- ZIG Governance Lifecycle Stage 1: CREATE
-- Scope: Projects, framework metadata, assets, controls, and lifecycle activity.

create table if not exists public.frameworks (
  framework_id text primary key,
  code text not null unique,
  name text not null,
  version text not null,
  description text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  project_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  name text not null,
  industry text not null,
  framework_focus text not null references public.frameworks(framework_id),
  description text not null default '',
  status text not null default 'draft',
  health_score integer not null default 0 check (health_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  asset_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  name text not null,
  asset_type text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  classification text not null default 'internal',
  criticality text not null default 'medium',
  description text not null default '',
  ai_classification text not null default 'pending',
  framework_relevance jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.controls (
  control_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  name text not null,
  description text not null default '',
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'draft',
  effectiveness integer not null default 0 check (effectiveness between 0 and 100),
  framework_mapping jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  activity_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  project_id uuid references public.projects(project_id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  lifecycle_stage text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.frameworks (framework_id, code, name, version, description, status)
values
  ('iso27001', 'ISO27001', 'ISO 27001', '2022', 'Information security management system requirements and Annex A controls.', 'active'),
  ('soc2', 'SOC2', 'SOC 2', 'Trust Services Criteria', 'Security, availability, confidentiality, processing integrity, and privacy criteria.', 'active'),
  ('nist_csf', 'NIST_CSF', 'NIST CSF', '2.0', 'Govern, identify, protect, detect, respond, and recover cybersecurity outcomes.', 'active'),
  ('cis_controls', 'CIS_CONTROLS', 'CIS Controls', 'v8', 'Prioritized cybersecurity safeguards for practical defense.', 'active'),
  ('hipaa', 'HIPAA', 'HIPAA', 'Security Rule', 'Administrative, physical, and technical safeguards for protected health information.', 'active'),
  ('pci_dss', 'PCI_DSS', 'PCI DSS', '4.0', 'Payment card data security requirements.', 'active')
on conflict (framework_id) do update set
  name = excluded.name,
  version = excluded.version,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

create index if not exists projects_org_idx on public.projects(organization_id);
create index if not exists projects_org_status_idx on public.projects(organization_id, status);
create index if not exists assets_project_idx on public.assets(project_id);
create index if not exists assets_org_criticality_idx on public.assets(organization_id, criticality);
create index if not exists controls_project_idx on public.controls(project_id);
create index if not exists controls_org_status_idx on public.controls(organization_id, status);
create index if not exists activities_org_project_idx on public.activities(organization_id, project_id, created_at desc);

alter table public.frameworks enable row level security;
alter table public.projects enable row level security;
alter table public.assets enable row level security;
alter table public.controls enable row level security;
alter table public.activities enable row level security;

drop policy if exists frameworks_authenticated_select on public.frameworks;
create policy frameworks_authenticated_select on public.frameworks
for select
to authenticated
using (status = 'active');

drop policy if exists projects_member_select on public.projects;
create policy projects_member_select on public.projects
for select
using (public.is_org_member(organization_id));

drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects
for all
using (public.has_org_role(organization_id, array['admin', 'manager', 'super_admin']))
with check (public.has_org_role(organization_id, array['admin', 'manager', 'super_admin']));

drop policy if exists assets_member_select on public.assets;
create policy assets_member_select on public.assets
for select
using (public.is_org_member(organization_id));

drop policy if exists assets_admin_write on public.assets;
create policy assets_admin_write on public.assets
for all
using (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']))
with check (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']));

drop policy if exists controls_member_select on public.controls;
create policy controls_member_select on public.controls
for select
using (public.is_org_member(organization_id));

drop policy if exists controls_admin_write on public.controls;
create policy controls_admin_write on public.controls
for all
using (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']))
with check (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']));

drop policy if exists activities_member_select on public.activities;
create policy activities_member_select on public.activities
for select
using (public.is_org_member(organization_id));

drop trigger if exists set_frameworks_updated_at on public.frameworks;
create trigger set_frameworks_updated_at before update on public.frameworks for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at before update on public.assets for each row execute function public.set_updated_at();

drop trigger if exists set_controls_updated_at on public.controls;
create trigger set_controls_updated_at before update on public.controls for each row execute function public.set_updated_at();
