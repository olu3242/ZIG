# Component Reuse Matrix

**Date:** 2026-06-20
Classification key: **REUSE** (keep exactly as-is), **REFACTOR** (keep the concept, change
the implementation), **MERGE** (fold into another component, then delete), **REPLACE**
(concept is needed but current implementation must be discarded), **DEPRECATE** (no route
uses it and no planned OS needs it — delete).

## Target OS groupings (per the requested convergence layer)

| Target "OS" | Owning real service(s) | Decorative packages mapped into it |
|---|---|---|
| **Learning OS** | `LearningService` | `learning-os`, `learning-kernel`, `learning-orchestrator`, `learning-runtime`, `learning-paths`, `learning-telemetry`, `learning-memory`, `learning-agents`, `learning-analytics`, `learning-marketplace`, `adaptive-learning`, `skills-graph`, `knowledge-graph` |
| **Assessment OS** | `AssessmentService` | `assessment-engine`, `assessment-os` |
| **Lab OS** | `ScenarioService` (lab task/artifact methods) | `practice-lab` |
| **Simulation OS** | `ScenarioService` (scenario/run methods) | `practice-lab` (overlaps Lab OS — see `DUPLICATION_REPORT.md`) |
| **Portfolio OS** | `PortfolioService` | `student-twin`, `digital-twin` (executive-only, different domain) |
| **Career OS** | `LearningService.getCareerReadiness` + `CoachService` career branch + `PortfolioService.generateCareerMaterials` | `career-os`, `career-readiness`, `employment`, `employer-matching`, `employer-cloud`, `student-lifecycle` |
| **Certification OS** | `CertificationEligibilityService`, `CertificationProgressService`, `CertificationAwardService` | `certification-journeys`, `certification-readiness`, `credentials` |
| *(no real service — orphaned concept)* | none | `instructor-os`, `mentorship`, `mentorship-cloud`, `community`, `community-os`, `cohorts`, `corporate-academies`, `university-platform`, `apprenticeship`, `training-cloud`, `training-marketplace`, `training-partners`, `workforce-analytics`, `workforce-development` |

## Matrix

| Component | Type | Classification | Reasoning |
|---|---|---|---|
| `LearningService` | real service | **REUSE** | Sole owner of `learning_paths`/`learning_modules`/`user_progress`/`student_twins` writes. |
| `AssessmentService` | real service | **REUSE** | Sole owner of assessment tables; no overlapping service exists. |
| `ScenarioService` | real service | **REFACTOR** | Owns both "scenario" (simulation) and "lab task" (lab) concerns in one class/table set. Functionally fine today, but if Lab OS and Simulation OS are formalized as separate product surfaces, this class's two responsibilities should be split into two methods groups (already true) and documented as such — no schema change needed, just an explicit internal boundary. |
| `PortfolioService` | real service | **REUSE** | Sole owner of `learner_portfolios`/`capstone_projects` writes; just extended in Phase 12 with `generateCareerMaterials`. |
| `CertificationEligibilityService` / `CertificationProgressService` / `CertificationAwardService` | real services | **REUSE** | Three classes, but each has a distinct, non-overlapping responsibility (eligibility check vs. progress readout vs. award-issuance side effect) — this is a legitimate split, not duplication. |
| `CoachService` | real service | **REUSE** | Single Coach, fall-through reply branches per intent (risk/control/framework/trust/career) — exactly the "no duplicate agent architecture" pattern the product requires. |
| `@zig/progress-engine`, `@zig/completion-engine` | pure-function packages | **REUSE** | Genuinely real algorithms, already composed correctly by `LearningService`. |
| `career-os` (`CareerOS.readiness`) | decorative stub | **DEPRECATE** | Already superseded in Phase 12 (its only call site was hardcoded fake inputs; route now redirects to `/career`'s real data). No remaining call site. Safe to delete the package; left in place this pass since deletion wasn't required by Phase 12's scope. |
| `career-readiness` (`CareerReadinessEngine`) | decorative stub | **DEPRECATE** | Zero call sites anywhere in `apps/web`. Duplicates the concept `LearningService.getCareerReadiness` already owns with real data. |
| `student-twin` (`StudentDigitalTwin`) | decorative stub | **DEPRECATE** | Zero call sites. The real `student_twins` table + `LearningService`/`PortfolioService`/`CertificationAwardService` already fully own this concept with persisted data; this package is a non-persisted re-imagining of the same idea. |
| `employment` (`EmploymentOS.components()`) | decorative stub | **REUSE (as label list only)** | Used by the real `/career` page purely to render a static "Employment Components" list — harmless as long as no one mistakes it for a real employment engine. Rename its usage context in code comments if confusion risk grows. |
| `employer-matching` (`EmployerMatchingEngine.match`) | decorative stub | **REUSE (as label only)** | Takes the real `readiness` score as input, so its output string is at least driven by real data even though the matching logic itself is a threshold stub. Acceptable until a real employer/job-matching table exists. |
| `employer-cloud`, `instructor-os`, `community-os`, `corporate-academies`, `university-platform`, `apprenticeship`, `digital-twin`, `skills-graph`, `knowledge-graph` | decorative stubs | **REUSE (as label list only)** | Each has exactly one consuming route and renders a static taxonomy; none claims to be a real engine on the page itself. Low risk as-is. |
| `learning-kernel`, `learning-runtime`, `learning-agents`, `learning-analytics`, `learning-marketplace`, `adaptive-learning`, `community-os` | decorative stubs, used | **REUSE (as label list only)**, revisit when their concept gets a real backing service | Each has exactly one consuming route. Not duplicative of each other (each models a distinct narrow concept), but several (`learning-analytics`, `adaptive-learning`) compute an "average"/"recommendation" over caller-supplied numbers that, on their consuming page, are themselves real (`getLearnerAssessmentSummary` etc.) — verify this case-by-case before trusting any number on those pages as fully real. |
| `learning-os`, `learning-orchestrator`, `learning-paths`, `learning-telemetry`, `learning-memory`, `practice-lab`, `assessment-engine`, `assessment-os`, `capstones`, `certification-journeys`, `certification-readiness`, `student-lifecycle`, `mentorship`, `mentorship-cloud`, `community`, `cohorts`, `training-cloud`, `training-marketplace`, `training-partners`, `workforce-analytics`, `workforce-development`, `credentials` | decorative stubs, **zero consuming routes** | **DEPRECATE** | Dead code: built, typed, exported, never imported by any page or service. Each duplicates a concept a real service (or a still-to-be-built one) should own. Safe to delete without touching any live route. |
| Learning/Career/Certification page routes (`app/learning/*`, `app/career`, `app/certifications`, `app/academy`, etc.) | routes | **REUSE**, mostly | All compile and build successfully today; only one real duplication (`/career` vs `/learning/career`) existed and was fixed in Phase 12. |

## Net recommendation

Of the ~45 decorative packages inventoried, **23 have zero consuming routes** and can be
deleted with zero blast radius. The remaining ~20 are each used by exactly one route as a
static label/taxonomy source — keep them, but do not build new real logic inside them; any
new real logic belongs in `packages/services` extending an existing service, per the
established pattern (Phase 11.5 Trust Center, Phase 12 Career OS).
