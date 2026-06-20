# Convergence Plan

**Date:** 2026-06-20
**Status:** Documentation only. No table, route, or production code was created or modified
to produce this plan, per the audit's constraint.

## 1. Target architecture (current → OS mapping)

```
Current real component                          → Target "OS"
─────────────────────────────────────────────────────────────────────
LearningService (learning_paths/modules/progress) → Learning OS
AssessmentService (assessments/results)           → Assessment OS
ScenarioService — scenario/run methods            → Simulation OS
ScenarioService — lab task/artifact methods        → Lab OS   (same class/tables as above —
                                                                 see DUPLICATION_REPORT.md;
                                                                 split at the page layer only,
                                                                 never split the service)
PortfolioService (learner_portfolios/capstones)   → Portfolio OS
LearningService.getCareerReadiness +
  CoachService career branch +
  PortfolioService.generateCareerMaterials         → Career OS  (AI Command Center
                                                                  sub-feature, per the
                                                                  standing product decision —
                                                                  not a top-level OS nav item)
CertificationEligibility/Progress/AwardService    → Certification OS
```

No new service classes are required to stand up these seven "OS" groupings — every one of
them already has a real owning service. "Building the OS" is a **composition/labeling
exercise at the page layer**, not a new backend build. This mirrors how Trust Center (Phase
11.5) composed `GovernanceService` + `RiskService` + `TrustAnalyticsService` outputs at
`apps/web/app/lib/data.ts` without inventing a new calculation.

## 2. Migration plan

No data migration is required. Every table these seven OS groupings need already exists and
is already RLS-backed (`packages/data-access` + `supabase/migrations/`). The only schema
work identified by this audit is **content**, not structure: seeding real
`learning_paths`/`learning_modules`/`learning_assessments`/`learning_assessment_questions`
rows so a new tenant has something to enroll in (`GAP_ANALYSIS.md` §1). That is additive seed
data, not a migration that touches existing rows or columns.

## 3. Implementation batches (if/when each OS is greenlit for real build-out)

Ordered by dependency, mirroring the merge order in the original request:

1. **Learning OS content** — seed real curriculum (courses/modules/lessons/quiz questions).
   No new code; unblocks every downstream OS's demo data.
2. **Assessment OS** — already functionally complete (`AssessmentService`); no batch needed
   beyond content depending on it.
3. **Lab OS / Simulation OS** — already functionally complete (`ScenarioService`); if the
   product wants them presented as two distinct pages/nav entries instead of one, that's a
   page-layer change only.
4. **Portfolio OS** — already functionally complete (`PortfolioService`, extended Phase 12).
5. **Career OS** — already functionally complete as an AI Command Center sub-feature
   (Phase 12). Remaining named-but-unbuilt pieces (Interview Engine, real job/employer
   matching) are tracked in `GAP_ANALYSIS.md` as Phase 13+ candidates, each requiring a new
   table and a PRD-style gap justification before any code, per `CLAUDE.md`.
6. **Certification OS** — already functionally complete (three Certification*Service
   classes).
7. **Cross-cutting cleanup** — delete the 23 zero-consumer decorative packages identified in
   `COMPONENT_REUSE_MATRIX.md`. Zero blast radius (no import sites), purely a housekeeping
   batch, can run independently of the above at any time.

## 4. Git / branch strategy — recommendation, adapted to how this repo actually works

The originally proposed strategy (`release/production`, `release/zig-learning-os-
convergence`, one `feature/*` branch per OS, merged in sequence) assumes a multi-branch
release workflow. **This repository does not currently use one** — every phase so far
(Phase 11.5 Trust Center, Phase 12 Career OS) has been developed directly on a single
long-lived feature branch (`claude/hopeful-bardeen-93edl1`) and shipped through one open PR
(#1) against `main`. Introducing 7 parallel `feature/*` branches now, with no batches of new
code actually queued behind them (per §3, six of the seven OS groupings need **zero** new
code — only documentation/labeling), would itself create the kind of process overhead this
audit exists to avoid.

**Recommendation:**
- Do **not** create the proposed branch tree yet. There is nothing uncommitted to isolate
  per-OS — the underlying services already exist, already passed their own typecheck/test/
  build cycles, and are already on `claude/hopeful-bardeen-93edl1`.
- If/when a genuinely new, multi-file batch of work is greenlit (e.g., seeding real
  curriculum content, or building the Interview Engine), branch it individually off `main`
  (or off the current feature branch, if it's still the active integration branch) with a
  descriptive name at that time — one branch per actual unit of work, not one per
  conceptual "OS" that has no pending code.
- Keep `main` as the only long-lived branch beyond the current active feature branch. Do not
  pre-create `release/production` until there is an actual release-cut event to protect
  against.
- This is a process recommendation, not an instruction — if the standing preference is to
  pre-create the branch structure regardless, that's a one-command follow-up
  (`git checkout -b <name>` per branch) and can be done on request.

## 5. What is explicitly NOT done by this plan

Per the audit's constraint, no table was created, no route was created or removed (the
Phase 12 `/learning/career` redirect predates this audit), and no production code in
`packages/services` or `apps/web` was touched while producing these six documents.
