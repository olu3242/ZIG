# Resilience Architecture (Detail Spec)

## Purpose
New asset describing a resilience architecture diagram showing the physical/technical
chain from primary system through to recovery site. This is a content spec only — no
rendering implementation.

## Structure

```
┌───────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Primary System │ ──▶ │   Failover    │ ──▶ │    Backup     │ ──▶ │ Recovery Site    │
│ (production)   │     │ (hot/warm     │     │ (data backup, │     │ (DR site / cloud │
│                │     │  standby)     │     │  immutable)   │     │  region)         │
└───────────────┘     └──────────────┘     └──────────────┘     └─────────────────┘
```

| Layer | Role |
|---|---|
| Primary System | Normal production workload |
| Failover | Hot/warm standby that takes over with minimal RTO impact |
| Backup | Point-in-time data backup, supports RPO target |
| Recovery Site | Full alternate site/region for extended outages or disaster declaration |

## Used by
- `bcm_dr/04_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in `DIAGRAM_LIBRARY.md`. It is distinct from
"Dependency Map" (which shows logical dependencies of a single asset) — this diagram shows
the physical/technical resilience chain an organization builds to survive a disruption.
Should be added to `DIAGRAM_LIBRARY.md`'s BCM/DR section as a follow-up; this file does not
edit that library doc.
