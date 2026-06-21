-- ZIG DB Push Certification
-- Run after applying only:
-- 1. supabase/migrations/202606200001_auth_foundation.sql
-- 2. supabase/migrations/202606200002_onboarding_experience.sql

with required_tables(table_schema, table_name) as (
  values
    ('public', 'profiles'),
    ('public', 'organizations'),
    ('public', 'organization_memberships'),
    ('public', 'roles'),
    ('public', 'auth_events'),
    ('public', 'onboarding_progress'),
    ('public', 'user_learning_profiles')
)
select
  rt.table_schema,
  rt.table_name,
  case when t.table_name is null then 'MISSING' else 'EXISTS' end as status
from required_tables rt
left join information_schema.tables t
  on t.table_schema = rt.table_schema
 and t.table_name = rt.table_name
 and t.table_type = 'BASE TABLE'
order by rt.table_schema, rt.table_name;

select
  table_schema,
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'profiles',
    'organizations',
    'organization_memberships',
    'roles',
    'auth_events',
    'onboarding_progress',
    'user_learning_profiles'
  )
order by table_name, ordinal_position;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'organizations',
    'organization_memberships',
    'roles',
    'auth_events',
    'onboarding_progress',
    'user_learning_profiles'
  )
order by tablename, policyname;

select
  trigger_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema in ('public', 'auth')
  and (
    event_object_table in ('profiles', 'organizations', 'onboarding_progress', 'user_learning_profiles')
    or trigger_name in ('on_auth_user_created_auth_foundation')
  )
order by event_object_table, trigger_name;

select 'auth_user_count' as metric, count(*)::text as value from auth.users
union all
select 'profile_count', count(*)::text from public.profiles
union all
select 'organization_count', count(*)::text from public.organizations
union all
select 'membership_count', count(*)::text from public.organization_memberships
union all
select 'role_count', count(*)::text from public.roles
union all
select 'onboarding_progress_count', count(*)::text from public.onboarding_progress
union all
select 'learning_profile_count', count(*)::text from public.user_learning_profiles;

select
  'missing_profiles' as validation,
  count(*)::text as failures
from auth.users au
left join public.profiles p on p.user_id = au.id
where p.user_id is null
union all
select
  'missing_memberships',
  count(*)::text
from auth.users au
left join public.organization_memberships om on om.user_id = au.id
where om.user_id is null
union all
select
  'broken_membership_organizations',
  count(*)::text
from public.organization_memberships om
left join public.organizations o on o.organization_id = om.organization_id
where o.organization_id is null
union all
select
  'broken_membership_roles',
  count(*)::text
from public.organization_memberships om
left join public.roles r on r.role_name = om.role_name
where r.role_name is null;
