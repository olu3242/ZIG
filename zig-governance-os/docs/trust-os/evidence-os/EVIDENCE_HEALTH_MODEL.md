# Evidence OS — Health Model

> Batch 25. This document exists specifically to prevent a third, conflicting evidence health
> score. `EVIDENCE_OS_AUDIT.md` found **two existing pure-function health engines** that do
> not share a vocabulary. This document reconciles both explicitly before proposing the
> weighted formula the task requires — it does not invent a conflicting second/third score.

## What actually exists today (re-stated from the audit, with full detail)

### Engine 1 — `EvidenceManagementEngine` (`packages/evidence/src/index.ts`)

```ts
export type EvidenceHealth = "current" | "expired" | "missing" | "pending_review" | "rejected" | "approved";

health(input: { exists: boolean; expiresAt?: Date; reviewStatus: "none"|"pending"|"rejected"|"approved" }, now): EvidenceHealth
```

Precedence (from `index.ts:11-18`, read in order): not-exists → `missing`; pending review →
`pending_review`; rejected → `rejected`; past `expiresAt` → `expired`; approved →
`approved`; otherwise → `current`. **Review status dominates expiry** in this engine — a
pending or rejected item is reported as such even if it would otherwise have expired.

This is the engine actually consumed downstream, by `packages/agent-evidence-review`'s
`recommend()` function (`agent-evidence-review/src/index.ts:76-144`), which is itself wired
into the live `AgentRuntime`/`AgentGovernanceGuard` system. **This is the only evidence
health logic with a real, wired consumer in the codebase today.**

### Engine 2 — `AutonomousEvidenceEngine` (`packages/autonomous-evidence/src/index.ts`)

```ts
export type AutonomousEvidenceHealth = "fresh" | "current" | "expiring" | "expired" | "missing";

health(signal: { source; collectedAt?; expiresAt?; mappedControlIds }, now): AutonomousEvidenceHealth
```

Precedence (from `index.ts:12-20`): no `collectedAt` → `missing`; no `expiresAt` → `fresh`;
days-remaining negative → `expired`; ≤14 days → `expiring`; ≤45 days → `current`; else →
`fresh`. **This engine has no review-status concept at all** — it is purely a freshness
window over collection/expiry dates, designed for autonomously-collected evidence (cloud
sync, integrations) where there is no human review step in the loop by definition. Re-checked
in this session: **no consumer of this package was found anywhere in `packages/*/src/`** — it
is currently unused dead code from the live application's perspective, despite being a
real, non-trivial implementation.

## Why these are not actually in conflict (the reconciling insight)

They answer different questions for different evidence lifecycles:

- `EvidenceManagementEngine` answers "is this evidence acceptable *right now*, accounting for
  whether a human has reviewed it" — appropriate for manually uploaded/reviewed evidence.
- `AutonomousEvidenceEngine` answers "is this evidence still within its freshness window" —
  appropriate for continuously, autonomously collected evidence with no review gate (e.g. a
  nightly cloud-config snapshot that's automatically trusted as long as it's recent).

**Decision: Evidence OS does not pick one engine as canonical and discard the other.** It
defines a single persisted `evidence.health` field whose value is computed by **whichever
engine matches the evidence item's collection mode**:

```
if evidence_source.discovered_via == 'manual_upload' or review is required for this evidence_type:
    health = EvidenceManagementEngine.health({exists, expiresAt, reviewStatus})
else (autonomously collected, e.g. cloud_sync/api_integration with no review step):
    health = AutonomousEvidenceEngine.health({source, collectedAt, expiresAt, mappedControlIds})
```

This is an explicit **extension**, not a supersession: both engines keep their existing
signatures and packages; Evidence OS adds a routing layer (new, thin) that calls the
right one per evidence item, and persists the result onto `evidence.health` (a new column,
per `EVIDENCE_DATA_MODEL.md`). Neither package's existing code changes.

## The task's requested weighted health score — where it fits

The task specifies a *separate* 0-100 weighted Evidence Health Score (Freshness 30, Review
Status 25, Usage 15, Coverage 15, Mapping 15) — this is a different, coarser-grained number
than the two engines' categorical states above, used for dashboard/intelligence purposes
(Batch 29), not for the per-item accept/reject gate the two engines already serve.
**Non-collision statement:** the categorical `evidence.health` (current/expired/fresh/etc.,
computed by the routing layer above) gates whether evidence can be attached to a response or
control at all (a hard gate); the weighted 0-100 score below is a softer, aggregate quality
signal layered on top, never the other way around.

```
EvidenceHealthScore = 0.30 * FreshnessComponent
                    + 0.25 * ReviewStatusComponent
                    + 0.15 * UsageComponent
                    + 0.15 * CoverageComponent
                    + 0.15 * MappingComponent
```

| Component | Weight | Computation |
|---|---|---|
| Freshness | 30 | Derived from the categorical health: `current`/`fresh`/`approved` → 100; `expiring` → 60; `expired`/`missing` → 0 |
| Review Status | 25 | `evidence_reviews.status`: `approved` → 100; `pending_review` → 40; `rejected` → 0; no row → 0 |
| Usage | 15 | Count of `control_evidence` rows referencing this evidence item, normalized (more controls supported → higher, capped at 100) — this is the "is this evidence reused" signal feeding `EVIDENCE_INTELLIGENCE_MODEL.md` (Batch 29) |
| Coverage | 15 | `control_evidence.coverage` value: `'primary'`/`'sufficient'` → 100; `'supporting'` (the existing default) → 60; other/unset → 30 |
| Mapping | 15 | 100 if the evidence's control(s) resolve to at least one framework requirement via `ControlService.findMappings`; 0 otherwise |

This score is computed **per evidence item**, stored nowhere new beyond being a derived
read-time value (or optionally cached on `evidence` as `health_score`, an implementation
choice) — it does not replace the categorical `evidence.health` gate above.

## Explicit non-collision statement (full picture)

| Score/state | Scope | Computed by |
|---|---|---|
| `EvidenceManagementEngine.health()` | per evidence item, review-status-driven | existing, unchanged |
| `AutonomousEvidenceEngine.health()` | per evidence item, freshness-window-driven | existing, unchanged |
| `evidence.health` (categorical) | per evidence item, routed between the two engines above | NEW routing layer |
| `EvidenceHealthScore` (0-100, weighted) | per evidence item, aggregate quality | NEW, this batch |
| `governance_scores.evidence_coverage` | per project | existing, unchanged — may eventually be computed as an aggregate of `EvidenceHealthScore` across a project's evidence, but that wiring is an implementation decision, not performed here |

This extends the existing engines; it does not supersede or replace either one.
