-- ZIG MVP Auth Foundation
-- Phase 1: identity + tenancy only.
-- Scope: signup, login, profile bootstrap, organization bootstrap,
-- membership bootstrap, default roles, RLS helpers, and dashboard access.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.organizations (
  organization_id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organization_default_id uuid references public.organizations(organization_id) on delete set null,
  email text,
  full_name text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  role_name text primary key,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null references public.roles(role_name),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (organization_id, user_id)
);

create table if not exists public.auth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  ip text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.roles (role_name, description)
values
  ('student', 'Default learning and practice access.'),
  ('professional', 'Operational GRC practitioner access.'),
  ('instructor', 'Learning and lab management access.'),
  ('manager', 'Manager access for workspace oversight.'),
  ('admin', 'Workspace administration access.'),
  ('super_admin', 'Platform-level administration access.')
on conflict (role_name) do update set
  description = excluded.description;

create index if not exists organization_memberships_user_idx on public.organization_memberships(user_id);
create index if not exists organization_memberships_org_idx on public.organization_memberships(organization_id);
create index if not exists profiles_org_idx on public.profiles(organization_default_id);
create index if not exists auth_events_user_idx on public.auth_events(user_id, created_at desc);
create index if not exists auth_events_type_idx on public.auth_events(event_type, created_at desc);

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

create or replace function public.has_org_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role_name = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.roles enable row level security;
alter table public.auth_events enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
for select
using (user_id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select on public.organizations
for select
using (public.is_org_member(organization_id));

drop policy if exists organization_memberships_member_select on public.organization_memberships;
create policy organization_memberships_member_select on public.organization_memberships
for select
using (user_id = auth.uid() or public.is_org_member(organization_id));

drop policy if exists organization_memberships_admin_write on public.organization_memberships;
create policy organization_memberships_admin_write on public.organization_memberships
for all
using (public.has_org_role(organization_id, array['admin', 'super_admin']))
with check (public.has_org_role(organization_id, array['admin', 'super_admin']));

drop policy if exists roles_authenticated_select on public.roles;
create policy roles_authenticated_select on public.roles
for select
to authenticated
using (true);

drop policy if exists auth_events_self_select on public.auth_events;
create policy auth_events_self_select on public.auth_events
for select
using (user_id = auth.uid());

create or replace function public.bootstrap_auth_foundation()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  workspace_id uuid := gen_random_uuid();
  workspace_name text := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, 'ZIG User'), '@', 1)
  ) || ' Workspace';
  workspace_slug text := lower(regexp_replace(split_part(coalesce(new.email, new.id::text), '@', 1), '[^a-z0-9-]+', '-', 'g')) || '-' || substr(new.id::text, 1, 8);
begin
  insert into public.organizations (organization_id, name, slug, status)
  values (workspace_id, workspace_name, workspace_slug, 'active')
  on conflict (slug) do update set updated_at = now()
  returning organization_id into workspace_id;

  insert into public.profiles (user_id, organization_default_id, email, full_name, status)
  values (
    new.id,
    workspace_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'ZIG User'), '@', 1)),
    'active'
  )
  on conflict (user_id) do update set
    organization_default_id = coalesce(public.profiles.organization_default_id, excluded.organization_default_id),
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  insert into public.organization_memberships (organization_id, user_id, role_name, status, created_by)
  values (workspace_id, new.id, 'admin', 'active', new.id)
  on conflict (organization_id, user_id) do update set
    role_name = coalesce(public.organization_memberships.role_name, excluded.role_name),
    status = 'active';

  insert into public.auth_events (user_id, event_type, metadata)
  values (new.id, 'AUTH_FOUNDATION_BOOTSTRAPPED', jsonb_build_object('organization_id', workspace_id));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_auth_foundation on auth.users;
create trigger on_auth_user_created_auth_foundation
after insert on auth.users
for each row execute function public.bootstrap_auth_foundation();

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
