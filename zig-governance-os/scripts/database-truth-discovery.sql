-- ZIG Database Truth Discovery
-- Run in Supabase SQL Editor before applying new migrations.

-- Schemas
select schema_name
from information_schema.schemata
order by schema_name;

-- Base tables
select
  table_schema,
  table_name
from information_schema.tables
where table_type = 'BASE TABLE'
order by table_schema, table_name;

-- Columns
select
  table_schema,
  table_name,
  column_name,
  data_type
from information_schema.columns
order by table_schema, table_name, ordinal_position;

-- Auth entities of interest
select
  table_schema,
  table_name
from information_schema.tables
where table_type = 'BASE TABLE'
  and lower(table_name) in (
    'profiles',
    'users',
    'organizations',
    'tenants',
    'memberships',
    'organization_members',
    'organization_memberships',
    'roles',
    'permissions',
    'auth_events'
  )
order by table_schema, table_name;

-- Foreign keys
select
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.constraint_schema = tc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
order by tc.table_schema, tc.table_name, kcu.column_name;

-- RLS policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
order by schemaname, tablename, policyname;

-- Auth data validation
select count(*) as auth_user_count
from auth.users;

-- Run the following only if the tables exist:
-- select count(*) as profile_count from public.profiles;
-- select count(*) as organization_count from public.organizations;
-- select count(*) as membership_count from public.organization_memberships;
