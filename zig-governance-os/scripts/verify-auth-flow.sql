-- ZIG auth flow verification SQL.
-- Run against the actual ZIG Supabase database after schema inventory.

select 'auth_users' as check_name, count(*) as row_count
from auth.users;

select 'profiles' as check_name, count(*) as row_count
from public.profiles;

select 'organizations' as check_name, count(*) as row_count
from public.organizations;

-- Use the table name that exists in the audited schema.
select 'organization_members' as check_name, count(*) as row_count
from public.organization_members;

select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'organizations', 'organization_members', 'organization_memberships')
order by tablename, policyname;
