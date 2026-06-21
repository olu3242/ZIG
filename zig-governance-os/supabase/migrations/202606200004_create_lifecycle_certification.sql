-- ZIG Governance Lifecycle Stage 1 certification support.
-- Scope: asset-control relationships, lifecycle score refresh, and relationship activity.

create table if not exists public.asset_control_mappings (
  mapping_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(organization_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  asset_id uuid not null references public.assets(asset_id) on delete cascade,
  control_id uuid not null references public.controls(control_id) on delete cascade,
  relationship_type text not null default 'protects',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (asset_id, control_id)
);

create index if not exists asset_control_mappings_org_idx on public.asset_control_mappings(organization_id);
create index if not exists asset_control_mappings_project_idx on public.asset_control_mappings(project_id);
create index if not exists asset_control_mappings_asset_idx on public.asset_control_mappings(asset_id);
create index if not exists asset_control_mappings_control_idx on public.asset_control_mappings(control_id);

alter table public.assets add column if not exists status text not null default 'active';

alter table public.asset_control_mappings enable row level security;

drop policy if exists asset_control_mappings_member_select on public.asset_control_mappings;
create policy asset_control_mappings_member_select on public.asset_control_mappings
for select
using (public.is_org_member(organization_id));

drop policy if exists asset_control_mappings_member_write on public.asset_control_mappings;
create policy asset_control_mappings_member_write on public.asset_control_mappings
for all
using (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']))
with check (public.has_org_role(organization_id, array['admin', 'manager', 'professional', 'super_admin']));

create or replace function public.refresh_project_create_score(target_project_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  project_exists integer := 0;
  asset_exists integer := 0;
  control_exists integer := 0;
  mapping_exists integer := 0;
  score integer := 0;
begin
  select case when exists (
    select 1 from public.projects where project_id = target_project_id and status <> 'archived'
  ) then 20 else 0 end into project_exists;

  select case when exists (
    select 1 from public.assets where project_id = target_project_id and coalesce(status, 'active') <> 'archived'
  ) then 30 else 0 end into asset_exists;

  select case when exists (
    select 1 from public.controls where project_id = target_project_id and status <> 'archived'
  ) then 30 else 0 end into control_exists;

  select case when exists (
    select 1 from public.asset_control_mappings where project_id = target_project_id
  ) then 20 else 0 end into mapping_exists;

  score := project_exists + asset_exists + control_exists + mapping_exists;

  update public.projects
  set health_score = score,
      updated_at = now()
  where project_id = target_project_id;

  return score;
end;
$$;

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at before update on public.assets for each row execute function public.set_updated_at();
