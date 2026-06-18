-- Tenant isolation policy pattern.
-- The active migration applies concrete policies table-by-table.

-- Pattern:
-- alter table <table_name> enable row level security;
-- create policy tenant_<table_name>_access on <table_name>
--   using (tenant_id = current_tenant_id())
--   with check (tenant_id = current_tenant_id());

-- Tenants are self-scoped:
-- create policy tenant_self_access on tenants
--   using (id = current_tenant_id())
--   with check (id = current_tenant_id());
