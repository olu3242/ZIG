-- Canonical tenant context helper.
-- Deployed by migrations/202606180001_batch_21_core_data_platform.sql.

create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_tenant_id', true), '')::uuid;
$$;
