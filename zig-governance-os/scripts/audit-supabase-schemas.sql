-- ZIG schema inventory audit.
-- Run this before creating or applying schema migrations.
-- Do not assume every table belongs in public.

-- Discover all schemas.
select schema_name
from information_schema.schemata
order by schema_name;

-- Tables by schema.
select
  table_schema,
  table_name
from information_schema.tables
where table_type = 'BASE TABLE'
  and table_schema not in (
    'pg_catalog',
    'information_schema'
  )
order by table_schema, table_name;

-- Functions by schema.
select
  routine_schema,
  routine_name
from information_schema.routines
where routine_schema not in (
  'pg_catalog',
  'information_schema'
)
order by routine_schema, routine_name;
