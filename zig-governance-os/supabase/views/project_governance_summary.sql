-- Project summary view for the MVP vertical slice.
-- Deployed by migrations/202606180002_batch_21a_database_foundation.sql.

create or replace view project_governance_summary
with (security_invoker = true)
as
select
  p.tenant_id,
  p.id as project_id,
  p.name as project_name,
  p.status as project_status,
  f.id as framework_id,
  f.name as framework_name,
  count(distinct a.id) as asset_count,
  count(distinct r.id) as risk_count,
  count(distinct c.id) as control_count,
  count(distinct e.id) as evidence_count,
  count(distinct t.id) filter (where t.status <> 'done') as open_task_count,
  count(distinct ass.id) as assessment_count,
  latest_score.score as governance_score,
  latest_score.calculated_at as score_calculated_at
from projects p
left join frameworks f on f.id = p.framework_id and f.tenant_id = p.tenant_id
left join assets a on a.project_id = p.id and a.tenant_id = p.tenant_id
left join risks r on r.project_id = p.id and r.tenant_id = p.tenant_id
left join controls c on c.project_id = p.id and c.tenant_id = p.tenant_id
left join evidence e on e.project_id = p.id and e.tenant_id = p.tenant_id
left join tasks t on t.project_id = p.id and t.tenant_id = p.tenant_id
left join assessments ass on ass.project_id = p.id and ass.tenant_id = p.tenant_id
left join lateral (
  select gs.score, gs.calculated_at
  from governance_scores gs
  where gs.project_id = p.id and gs.tenant_id = p.tenant_id
  order by gs.calculated_at desc
  limit 1
) latest_score on true
group by p.tenant_id, p.id, p.name, p.status, f.id, f.name, latest_score.score, latest_score.calculated_at;
