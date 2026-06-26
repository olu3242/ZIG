# Evidence OS — Intelligence Model

> Batch 29. Answers: which evidence is reused most, which controls lack evidence, which
> frameworks lack evidence, which evidence is expiring. All four queries are read-only
> aggregations over existing/proposed tables — no new computation engine, no new persisted
> score beyond what `EVIDENCE_HEALTH_MODEL.md` already defines.

## Query 1 — Which evidence is reused most

```sql
-- conceptual, not a literal migration
select evidence_id, count(*) as control_count
from control_evidence
group by evidence_id
order by control_count desc
```

This is the `UsageComponent` input to `EVIDENCE_HEALTH_MODEL.md`'s weighted health score
(weight 15) — Evidence Intelligence is the reporting *view* over the same data the health
score already consumes, not a separate computation.

## Query 2 — Which controls lack evidence

```sql
select c.id, c.name
from controls c
left join control_evidence ce on ce.control_id = c.id
where ce.id is null
```

This directly feeds `EVIDENCE_REQUEST_WORKFLOW.md`'s entry point ("Control identified as
lacking sufficient evidence") — Evidence Intelligence is what triggers new `EvidenceRequest`
rows, closing the loop from gap-detection to remediation.

## Query 3 — Which frameworks lack evidence

```sql
-- frameworks whose mapped controls have no control_evidence rows.
-- control_mappings columns confirmed by direct read in this session:
-- source_control_id, target_framework_id, target_control_id (text, external framework
-- control code, not a FK) — supabase/migrations/202606180001_batch_21_core_data_platform.sql:137-147
select f.id, f.name
from frameworks f
join control_mappings cm on cm.target_framework_id = f.id
left join control_evidence ce on ce.control_id = cm.source_control_id
where ce.id is null
group by f.id, f.name
```

Note `control_mappings.target_control_id` is a free-text column (the external framework's own
control code, e.g. `"A.5.1"`), not a foreign key into `controls` — confirmed by direct read of
the `create table control_mappings` statement. The join above correctly uses
`source_control_id` (the real FK to the tenant's own `controls` row) rather than
`target_control_id`.

## Query 4 — Which evidence is expiring

Directly reuses `EVIDENCE_EXPIRATION_MODEL.md`'s "expiring soon" condition (≤14 days,
reusing `AutonomousEvidenceEngine`'s threshold) — no separate computation.

## Output: Evidence Intelligence Dashboard (design only, feeds Batch 30)

| Widget | Query | Action surfaced |
|---|---|---|
| Most-Reused Evidence | Query 1 | "This evidence supports N controls — verify it stays current" |
| Controls Without Evidence | Query 2 | "Request evidence" → creates `EvidenceRequest` |
| Frameworks With Evidence Gaps | Query 3 | "View affected controls" → drills into Query 2 scoped to that framework |
| Expiring Evidence | Query 4 | "Request refresh" → creates `EvidenceRequest` with `control_id` pre-filled from the expiring item's mapping |

Every widget here is a read-only aggregation; none of them introduces a new scoring formula,
consistent with this batch's framing that Intelligence reports on existing health/usage/
mapping data rather than re-deriving it.
