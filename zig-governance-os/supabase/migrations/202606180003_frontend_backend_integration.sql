-- Phase 1: Frontend/backend integration vertical-slice database hardening.

create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('app.current_tenant_id', true), '')::uuid,
    nullif((current_setting('request.headers', true)::jsonb ->> 'x-tenant-id'), '')::uuid
  );
$$;

alter type audit_event_action add value if not exists 'login';
alter type audit_event_action add value if not exists 'logout';

alter table users
  add column if not exists auth_user_id uuid,
  add column if not exists persona text not null default 'Tenant Admin';

create unique index if not exists users_auth_user_id_idx on users (auth_user_id) where auth_user_id is not null;
create index if not exists users_tenant_persona_idx on users (tenant_id, persona);

create table if not exists project_frameworks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  framework_id uuid not null references frameworks(id) on delete cascade,
  assigned_by_user_id uuid references users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, project_id, framework_id)
);

create index if not exists project_frameworks_tenant_project_idx on project_frameworks (tenant_id, project_id);
create trigger set_project_frameworks_updated_at
  before update on project_frameworks
  for each row execute function set_updated_at();

alter table project_frameworks enable row level security;

drop policy if exists tenant_project_frameworks_access on project_frameworks;
create policy tenant_project_frameworks_access on project_frameworks
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

comment on table project_frameworks is 'Tenant-scoped framework assignments for governance projects.';
comment on column users.persona is 'Role-based Zig persona loaded after authentication.';
