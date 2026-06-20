# Learning OS Implementation Roadmap

> Phased roadmap ordering remaining work by dependency and risk. This is the "Phase 10 —
> Implementation Roadmap" referenced in the task brief. It is a planning document only;
> nothing in this file is implemented by writing it.

## Phase 0 — Blocking decision (must happen before any of the phases below)

**The 11-canonical-module conflict must be resolved by the project owner before further
Learning OS work proceeds**, per `HARMONIZATION_REPORT.md` Section 4 and the independent
confirmation in `docs/certification/WORKFLOW_TRACEABILITY_MATRIX.md`. The choice between
(a) treating Learning/Academy as a separate product surface outside the 11-module list, or
(b) formally adopting it as a 12th module (with the justification `CLAUDE.md` requires in
`docs/product/prd.md`) changes where future Learning OS docs and code are governed. This
roadmap does not assume an answer; every phase below is written so it works under either
resolution, but the decision should not be deferred indefinitely — it blocks, at minimum,
where `docs/product/prd.md` and any future Learning-specific PRD content should live.

This is **not** an agent decision. Flagging it as Phase 0 is a process statement, not a
recommendation to pick (a) or (b).

## Phase 1 — Content seeding (no schema/code changes, lowest risk)

Nothing in the Learning OS has any seed data today — zero rows for `learning_paths`,
`learning_modules`, `learning_assessments`, `learning_assessment_questions`, `scenarios`,
`lab_tasks`, or `simulated_companies` exist in any migration (verified by grep across
`supabase/migrations/`). The entire real, working pipeline (`LearningService`,
`AssessmentService`, `ScenarioService`) is content-starved, not capability-starved.

- Seed the 10 Source B curriculum modules as `learning_paths` rows (per
  `CURRICULUM_CROSSWALK.md`).
- Seed at least one `learning_assessments` + `learning_assessment_questions` set per
  module so `/assessment/[id]` has something to render (today it explicitly shows "no
  questions defined" — `apps/web/app/assessment/[id]/page.tsx` lines 38-40).
- Seed the 5 named scenario companies into `simulated_companies` plus at least one
  `scenarios`/`lab_tasks` set per company (per `SCENARIO_ENGINE_ARCHITECTURE.md`).

This phase requires zero migrations and zero service changes — only INSERT statements
against existing tables. It is the highest-leverage, lowest-risk next step.

## Phase 2 — Visual Learning Standard rollout

`apps/web/app/learning/lesson/[id]/page.tsx` currently renders one static paragraph of
text per lesson (lines 30-35) with no diagram, knowledge check, or distinct completion
section beyond a single button. `VISUAL_LEARNING_STANDARD.md` defines the target lesson
structure (Text/Diagram/Scenario/Knowledge-Check/Completion). This phase:

- Extends `learning_modules` content (likely via a new `content jsonb` or similar field —
  see `VISUAL_LEARNING_STANDARD.md` Section 4 for the exact proposal) to carry structured
  lesson sections instead of relying on hardcoded page copy.
- Adds Mermaid/SVG/React Flow rendering capability to the lesson page for the listed
  framework lifecycles (ISO 27001, SOC2, NIST CSF, Risk/Audit/Vendor/Evidence).

Depends on Phase 1 (no point building rich rendering for lessons that don't exist yet).

## Phase 3 — Portfolio rollup

Implement `PortfolioService` per `PORTFOLIO_ENGINE_ARCHITECTURE.md` — writes
`student_twins.portfolio_score`, `learner_portfolios`, and (if a capstone exists)
`capstone_projects`. Depends on Phase 1 (needs real completion/assessment/lab data to roll
up; rolling up zero rows is not a meaningful milestone).

## Phase 4 — Certification eligibility derivation

Implement the compute-at-read-time eligibility logic per `CERTIFICATION_MODEL.md`. Depends
on Phase 3 (uses the same underlying signals `PortfolioService` reads, and the capstone
requirement check depends on `capstone_projects` having a real writer).

## Phase 5 — AI Coach (highest schema risk, do last)

Implement `coach_conversations`/`coach_messages` and `CoachService` per
`AI_COACH_ARCHITECTURE.md`. This is ordered last because:

- It is the only phase requiring **new tables** (every other phase reuses existing schema).
- It depends on richer learner context being available to make coach responses meaningful
  (Phases 1-4 produce the `student_twins`, assessment, and lab signals a coach response
  would reference).
- It requires an LLM provider integration decision that is explicitly out of scope for this
  documentation set (see `AI_COACH_ARCHITECTURE.md` Section 5).

## Dependency graph

```
Phase 0 (decision, blocking, no dependency)
   │
Phase 1 (seed content) ──┬──► Phase 2 (visual standard)
                          │
                          └──► Phase 3 (portfolio rollup) ──► Phase 4 (certification) ──► Phase 5 (AI coach)
```

Phase 2 and Phase 3 can proceed in parallel once Phase 1 is done; Phase 5 should not start
until Phase 3 produces meaningful learner signal for the coach to reference.

## Risk notes

- **Phase 1 risk: low.** Pure data entry against an already-tested write path (the
  certification docs in `docs/certification/` confirm `LearningService`,
  `AssessmentService`, and `ScenarioService` all have real, working read/write logic
  today — the only missing piece is rows to operate on).
- **Phase 2 risk: medium.** Requires a content-model decision (how structured lesson
  sections are stored) that has a few reasonable options not yet narrowed down — see
  `VISUAL_LEARNING_STANDARD.md` Section 4.
- **Phase 3 risk: low-medium.** Logic is additive (new service, no schema change) but the
  weighting formula in `PORTFOLIO_ENGINE_ARCHITECTURE.md` Section 3 is a starting
  specification, not a validated formula — expect product iteration.
- **Phase 4 risk: low.** Pure derivation logic over data Phase 3 already aggregates.
- **Phase 5 risk: high.** New tables, new package, an external LLM dependency, and the
  unresolved question of secrets/cost management. This phase should not be started
  casually — it is the one place in this roadmap where "documentation first" most clearly
  applies, since `AI_COACH_ARCHITECTURE.md` deliberately leaves provider selection and
  several integration questions open pending a dedicated decision.
