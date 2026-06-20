# Governance Competency Operating System — Vision & Gap Analysis

## Purpose
Captures a strategic redirection raised mid-Batch-51-70: the Learning OS as currently
documented (Lesson → Lab → Assessment → Artifact → Portfolio → Certification, content-
completion tracking) is not sufficient for Zig's actual value proposition. This document
is the vision/roadmap record for that redirection — written before any schema or service
work, per "never implement before documenting." It does not implement anything.

## The reframe
Most learning platforms track: `Course → Lesson → Quiz → Certificate` (content completion).
Zig's proposition requires: `Learn → Practice → Simulate → Build → Validate → Portfolio →
Career` (demonstrated governance capability). The shift this document drives: every
learning-related design decision going forward should ask "does this prove the learner can
do governance work," not "did the learner finish the content."

## Gap analysis (15 areas)

| # | Area | Current state | Gap | New entities implied |
|---|---|---|---|---|
| 1 | Competency Tracking | Tracks course/lesson/assessment completion | Doesn't track competency acquisition (Asset Mgmt, Risk Assessment, Control Design, Evidence Mgmt, Framework Mapping, Audit Readiness, Vendor Risk, Governance Reporting) | `competencies`, `user_competencies`, `competency_assessments` |
| 2 | Scenario Intelligence | Labs and lessons only | No persistent scenario lifecycle (attempt → decisions → outcomes → score) | `scenario_templates`, `scenario_attempts`, `scenario_decisions`, `scenario_outcomes` |
| 3 | Portfolio Engine | Learning ends at completion | No generated evidence of capability (Risk Register, Control Matrix, Asset Inventory, Gap Assessment, Readiness Report, Audit Report) | `portfolio_artifacts`, `artifact_templates`, `artifact_versions` |
| 4 | Framework Learning | Frameworks exist as content | Not woven into exercises (Framework → Requirement → Control → Evidence → Scenario chain) | None new — wiring/content gap, not a schema gap |
| 5 | Governance Maturity Progression | No governance journey | No Level 1 (Foundation) → Level 5 (Optimized) progression | `maturity_levels`, `maturity_scores`, `maturity_history` |
| 6 | Learning Analytics | Progress bars only | No insight (strongest/weakest competency, framework readiness, scenario performance, assessment trends) | None new — reads off #1, #2, #5 |
| 7 | AI Learning Coach | None | No intelligence layer (explain concepts, recommend lessons/scenarios, identify weaknesses, generate study plans/practice labs) | Depends on a future coaching backend (same gap already flagged for `<ZaraCoach />` in `docs/runtime/LEARNING_RUNTIME_AI_GUIDED_LEARNING.md`) |
| 8 | Adaptive Learning Paths | Everyone follows the same path | No path variation by assessment/scenario/competency results or career goal | Reads off #1, #2, #9 — no new entity, a routing-logic gap |
| 9 | Career Readiness Engine | No link between learning and employment | No competency→role mapping (Risk Analyst, Compliance Analyst, Internal Auditor, GRC Manager, CISO Track) | `career_paths`, `career_requirements`, `career_progress` |
| 10 | Rubric-Based Assessment | Pass/fail only | Governance work isn't binary — needs weighted rubrics (e.g. Risk Assessment: Identification 25%/Analysis 25%/Treatment 25%/Documentation 25%) | Rubric definition lives on `competency_assessments` (#1), not a separate table |
| 11 | Governance Labs | Simple exercises | Not tied to real governance workflows — should produce an Asset/Risk/Control/Evidence/Report | Reads off #3 (portfolio artifacts) — a lab's output *is* a portfolio artifact |
| 12 | Scenario Decision Engine | None | No branching decisions with consequences (e.g. Vendor Breach: Ignore/Accept/Investigate/Escalate, each changing Risk/Health/Readiness score) | `scenario_decisions` (#2) |
| 13 | Learning ↔ Operational Bridge | Learning and operations are separate | Completing a scenario (e.g. SOC 2 Readiness) doesn't import its risks/controls/artifacts into a real project | Cross-cutting: scenario completion needs a defined import path into `RiskService`/`ControlService`/`EvidenceService` records — biggest architectural bridge, not a new table |
| 14 | Evidence-Based Certification | Watched video → passed quiz → certificate | Should require built artifacts (Risk Register, Controls, Evidence, Report) before certifying | Reads off #1, #3 — certification becomes a computed gate, not a new entity |
| 15 | Trust Center Learning | Not present in current vision | Modern GRC teams spend significant time on vendor assessments, security questionnaires, customer assurance, control narratives — not yet a learning surface | New content track, not a schema gap |

## Priority tiers (as proposed)

**Tier 1 — MVP must-have**: Competency Engine, Scenario Engine, Portfolio Artifact Engine,
AI Learning Coach, Rubric-Based Assessments, Learning↔Operational Bridge.

**Tier 2**: Governance Maturity Engine, Career Readiness Engine, Adaptive Learning Paths,
Scenario Decision Engine.

**Tier 3**: Trust Center Learning, Certification Engine, Community Scenarios, Peer Reviews.

## Relationship to prior runtime work (Batch 51-70, `docs/runtime/`)
This reframing supersedes, rather than discards, the prior runtime specs:
- The `learning_progress` table proposed in `LEARNING_RUNTIME_STATE_MODEL.md` (pending
  approval as of this document) is now better understood as a subset of `user_competencies`
  / `scenario_attempts` (#1, #2) — building the narrow table first would create exactly the
  kind of entity that has to be migrated or duplicated once the competency model lands.
  **Recommendation: hold the `learning_progress` table decision until Tier 1's schema is
  scoped, rather than build it in isolation.**
- `<AssessmentEngine />` (Wave 5) and `<CertificationCenter />` (Wave 10) specs remain valid
  as component-level UI contracts, but their backing data model changes from "assessment
  attempt" to "competency assessment" (#1, #10) — rubric-based, not pass/fail.
- `<ArtifactBuilder />` (Wave 6) is the direct ancestor of the Portfolio Artifact Engine
  (#3) — its per-artifact-type data-source table in `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`
  is reusable as-is once `portfolio_artifacts` exists to persist the output.

## What this document does NOT do
Does not create any of the new entities listed above. Does not pick a Tier 1 item to start
with — that's the next decision. Does not modify `LearningService.ts` or any other service.
Does not resolve the `learning_progress` table question raised earlier in this session —
explicitly recommends deferring it until Tier 1 scoping happens, rather than building it now
and likely needing to undo it.
