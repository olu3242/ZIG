-- Canonical updated_at trigger helper.
-- Deployed by migrations/202606180001_batch_21_core_data_platform.sql.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
