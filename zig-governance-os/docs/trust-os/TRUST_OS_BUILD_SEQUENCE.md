# Trust OS Build Sequence

> Batch 10. The concrete, file-level build sequence underneath `TRUST_OS_ROADMAP.md`'s
> six phases — what code/schema changes each phase actually requires, expressed against
> real file paths so a future implementation session can pick this up directly. This
> document proposes no code; it specifies what code a later, code-writing session should
> produce, in what order, and against which existing files.

## Pre-flight (must be true before any phase starts)

- [ ] `docs/architecture/governance-scoring-engine.md` is filled in (currently STUB,
      `docs/architecture/governance-scoring-engine.md:1-15`) and references
      `TRUST_SCORE_MODEL.md` for the Vendor/AI Governance extension, per the "never
      implement before documenting" rule (`CLAUDE.md:23-24`).
- [ ] `docs/data/entities.md` is filled in (currently STUB,
      `docs/data/entities.md:1-14`) to include the net-new entities from
      `TRUST_OS_DATA_MODEL.md` so the canonical entity list does not drift from what Trust
      OS actually adds.

## Phase 1 — Questionnaire Agent

1. Migration: add `questionnaires`, `questions`, `responses` tables (schema in
   `TRUST_OS_DATA_MODEL.md`), following the existing migration column conventions seen
   throughout `supabase/migrations/*.sql` (`tenant_id`, `created_at`, `updated_at` on every
   table).
2. `packages/data-access/src/records.ts`: add `QuestionnaireRecord`, `QuestionRecord`,
   `ResponseRecord`, and — the actually-missing type — `VendorRecord` (note: `vendors` table
   exists but has no corresponding type in this file today).
3. `packages/services/src/`: add `QuestionnaireService.ts` and `VendorService.ts`, both
   extending `BaseService<T>` per the pattern in `packages/services/src/BaseService.ts:3`.
4. `packages/services/src/factory.ts`: add `questionnaires` and `vendors` keys to
   `ZigServices` and wire them in `createServices()` (currently absent from both the
   interface at lines 14-26 and the constructor at lines 28-38).
5. `apps/web/app/vendors/`: extend the existing route to read through the new
   `VendorService` instead of being unbacked by a service layer.
6. New route: `apps/web/app/questionnaires/` (or extend `apps/web/app/vendors/[id]/` with a
   questionnaire tab) — routing decision deferred to implementation, not fixed by this doc.

## Phase 2 — Trust Knowledge Graph

1. `packages/knowledge-graph/src/index.ts`: replace the 12-line type sketch with a real
   persisted/queryable graph implementation, adding the Trust Score, Vendor, Questionnaire
   nodes from `TRUST_KNOWLEDGE_GRAPH.md` to the existing node list (`index.ts:1`).
2. No new tables required for the graph itself if it is implemented as a query layer over
   existing tables (the preferred approach, consistent with "no second source of truth" —
   see `TRUST_OS_DATA_MODEL.md`'s Trust Record reframing). If a materialized graph store is
   chosen instead, that decision must be documented in
   `docs/architecture/system-architecture.md` before implementation, per the doc-first rule.

## Phase 3 — Trust Center

1. New route: `apps/web/app/trust/` or `apps/web/app/trust-center/` (naming decision
   deferred to implementation; check for conflicts with `apps/web/app/compliance-command-center/`
   and `apps/web/app/executive-assurance/` first, per `TRUST_OS_EXISTING_ROUTES_MAP.md`).
2. The route reads through `GovernanceService`, `EvidenceService`, `FrameworkService`, the
   new `VendorService` (Phase 1), and `certifications` (with the `certification_type`
   discriminator from Phase 4 below) — no new service is created for the Trust Center
   itself; it is a composition layer only.

## Phase 4 — Evidence Intelligence

1. `packages/services/src/EvidenceService.ts`: add `findExpiring(context, withinDays)` and
   `findByFramework(context, frameworkId)` methods alongside the existing
   `findByControl(context, controlId)` (`EvidenceService.ts:6-8`).
2. Migration: add a `certification_type` column to the existing `certifications` table
   (`supabase/migrations/202606190003_mvp_plus_launch_schema.sql:51-57`) — `text not null
   default 'learner_credential'`, with `compliance_attestation` as the second value — per
   `TRUST_OS_HARMONIZATION_PLAN.md` item 8. Grouped here because evidence freshness and
   certification currency are both "is this trust artifact still valid" concerns.

## Phase 5 — AI Governance

1. Migration: add `ai_assets`, `ai_risks`, `ai_controls`, `ai_decisions` tables (schema in
   `TRUST_OS_DATA_MODEL.md`), modeled on the column conventions already used in
   `governed_agents`/`agent_certifications`
   (`supabase/migrations/202606180009_agent_governance_os.sql:55-94`).
2. `packages/ai-governance/src/index.ts`: extend the existing 14-line file (don't create a
   new package) with persistence-backed asset/risk/control/decision tracking, replacing the
   current single `canExecute(policy)` boolean gate with real CRUD against the new tables.
3. `packages/services/src/`: add `AiGovernanceService.ts`, wired into `factory.ts` the same
   way as Phase 1's services.
4. `governance_scores`: add `vendor_component` and `ai_governance_component` columns (or a
   computed view — implementation decision), per `TRUST_SCORE_MODEL.md`'s formula.

## Phase 6 — Trust Intelligence

1. Extends `docs/convergence/knowledge-graph.md`'s existing Knowledge Object pattern (Gap,
   Signal, Insight, Recommendation, Readiness State — `knowledge-graph.md:23-33`) to surface
   Trust Score trend, questionnaire answer quality, and AI Governance posture as new signal
   types, read from the Phase 2 graph and Phase 1/4/5 data.
2. No new tables — this phase is read/synthesis logic over everything built in Phases 1-5.

## Definition of done for the Trust OS docs phase (this exercise)

This build sequence, and all 15 other files under `docs/trust-os/`, complete the
documentation phase. Per the project's own doc-before-code methodology
(`.claude/skills/zig-fable5-methodology/SKILL.md`), no file listed in this sequence should
be created or modified until this documentation set is reviewed and accepted — that
implementation work is explicitly out of scope for the batch this PR represents.
