-- Tenant-scoped audit activity view.
-- Deployed by migrations/202606180002_batch_21a_database_foundation.sql.

create or replace view tenant_audit_activity
with (security_invoker = true)
as
select
  ae.tenant_id,
  ae.id as audit_event_id,
  ae.actor_user_id,
  u.email as actor_email,
  ae.action,
  ae.entity_table,
  ae.entity_id,
  ae.reason,
  ae.created_at
from audit_events ae
left join users u on u.id = ae.actor_user_id and u.tenant_id = ae.tenant_id;
