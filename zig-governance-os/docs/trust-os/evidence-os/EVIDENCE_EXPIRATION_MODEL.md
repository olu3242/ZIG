# Evidence OS — Expiration Model

> Batch 27. Monitors expired / expiring-soon / missing-review / missing-owner evidence and
> generates Evidence Alerts. Reconciles explicitly with the freshness/expiry logic already
> found in both existing health engines (Batch 25) — does not define a third expiry window.

## Reuse of existing expiry logic

`AutonomousEvidenceEngine.health()` (`packages/autonomous-evidence/src/index.ts:12-20`)
already defines the only expiry-window thresholds found anywhere in the codebase: ≤14 days
remaining → `expiring`; ≤45 days → `current`; negative → `expired`. **Evidence OS reuses
these exact thresholds for the alerting model below rather than inventing new day-counts**,
even for evidence whose categorical health is computed via `EvidenceManagementEngine`
(the review-status-driven engine) per the routing decision in `EVIDENCE_HEALTH_MODEL.md` —
the *expiry* sub-check inside `EvidenceManagementEngine.health()` is a hard boolean (past
`expiresAt` or not, `index.ts:15`), so Evidence OS layers the autonomous engine's 14/45-day
windows on top of it to produce the "expiring soon" warning state that
`EvidenceManagementEngine` alone does not distinguish.

## Monitored conditions

| Condition | Trigger | Existing data used |
|---|---|---|
| Expired | `evidence.health == 'expired'` (post-routing, per `EVIDENCE_HEALTH_MODEL.md`) | `evidence`, plus `expires_at` (new column) |
| Expiring soon | `expires_at` within 14 days (reusing `AutonomousEvidenceEngine`'s threshold) | same |
| Missing review | `evidence_reviews` has no row, or its only row is older than the evidence_type's `retention_days` (existing column, `evidence_types.retention_days`, `grc_core_engine.sql:222`) | `evidence_reviews`, `evidence_types` |
| Missing owner | `evidence.submitted_by_user_id is null` (existing nullable column — currently allowed by schema, meaning this condition can already occur today even without any new logic) | `evidence` |

## Evidence Alerts

**Net new** — `evidence_alerts` table (the only new table this batch proposes, consistent
with `EVIDENCE_DATA_MODEL.md`'s note that Evidence Expiration needs only an alert log, not a
duplicate state engine):

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant scope |
| `evidence_id` | uuid | FK `evidence.id` |
| `alert_type` | text | `'expired'` \| `'expiring_soon'` \| `'missing_review'` \| `'missing_owner'` |
| `triggered_at` | timestamptz | |
| `resolved_at` | timestamptz | nullable |
| `notified_user_id` | uuid | FK `users.id`, nullable — who was notified (the evidence owner if set, else the project's GRC Manager, per the existing role list in `CLAUDE.md:100-102`) |

## Monitoring flow (design only)

```
Scheduled job (could reuse the existing evidence_jobs table's scheduling pattern,
  status default 'queued', grc_core_engine.sql, rather than building new cron infrastructure)
   │
   ▼
For each evidence item: recompute evidence.health via the routed engine (Batch 25)
   │
   ▼
Check the four conditions above
   │
   ▼
Insert evidence_alerts row if a condition newly triggers (no duplicate alert for an
  already-open, unresolved condition of the same type)
   │
   ▼
Surfaces in /trust/evidence "Evidence Expiration" section (Batch 30)
```

Reusing `evidence_jobs` (existing, currently unused at the service layer per the audit) as
the scheduling mechanism avoids building a second job-queue table for what is conceptually
the same kind of recurring background work it already models.
