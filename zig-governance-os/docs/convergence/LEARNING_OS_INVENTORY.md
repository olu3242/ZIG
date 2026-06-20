# Learning OS Inventory

**Date:** 2026-06-20
**Method:** Direct repository read (`packages/*/src/index.ts`, `packages/services/src/*.ts`,
`packages/data-access/src/records.ts`, `apps/web/app/**`). No code was built, no schema or
route was added or changed to produce this document.

This repo's Learning-OS-adjacent surface splits cleanly into two layers that must not be
confused with each other:

1. **Real, persisted, tenant-scoped logic** — lives in `packages/services/src/*Service.ts`,
   backed by real tables in `packages/data-access/src/records.ts`, wired through
   `packages/services/src/factory.ts`, called from `apps/web/app/lib/data.ts` /
   `actions.ts`.
2. **Decorative "operating model" stub packages** — ~45 tiny packages (6-20 lines each)
   under `packages/`, each exporting one class with a method that returns a hardcoded
   literal array or a one-line deterministic formula over caller-supplied numbers. None of
   them perform DB I/O. They exist purely to render taxonomy lists / labels on pages — they
   are not engines, services, or workflows, despite names like `LearningOrchestrator`,
   `AssessmentEngine`, `WorkforceAnalytics`.

Conflating these two layers is the root cause of the duplication already found and fixed
once (Career OS, see `DUPLICATION_REPORT.md`) and is the main risk this audit exists to
prevent from recurring.

## Layer 1 — Real services (the only layer that owns data)

| Service | File | Tables it owns/reads | Real methods |
|---|---|---|---|
| `LearningService` | `packages/services/src/LearningService.ts` | `learning_paths`, `learning_modules`, `user_progress`, `student_twins` | `enroll`, `completeLesson`, `findModules`, `getProgressSummary`, `getCareerReadiness` |
| `AssessmentService` | `AssessmentService.ts` | `learning_assessments`, `learning_assessment_results`, `student_twins` | `findAssessment`, `submitAttempt`, `getLearnerAssessmentSummary` |
| `ScenarioService` | `ScenarioService.ts` | `scenarios`, `scenario_runs`, `lab_tasks`, `lab_task_submissions`, `lab_artifacts`, `student_twins` | `findTasks`, `launchLab`, `completeTask`, `scoreAndComplete`, `getLearnerLabSummary` |
| `PortfolioService` | `PortfolioService.ts` | `learner_portfolios`, `capstone_projects`, `student_twins` (writes `portfolioScore`) | `computePortfolioScore`, `getPortfolio`, `generateCareerMaterials` (added Phase 12) |
| `CertificationEligibilityService` | `CertificationEligibilityService.ts` | reads `student_twins`, `user_progress`, `learning_modules`, `capstone_projects` | `evaluateEligibility` |
| `CertificationProgressService` | `CertificationProgressService.ts` | same as above | `getProgress` |
| `CertificationAwardService` | `CertificationAwardService.ts` | `certification_awards` + writes `student_twins.certificationScore` | `awardCertification`, `getAwards` |
| `CoachService` | `CoachService.ts` | `coach_conversations`, `coach_messages`, reads risks/controls/student_twins/framework/trust/learner_portfolios | `startConversation`, `sendMessage`, `tryGenerateCareerCoachReply` (added Phase 12), `tryGenerateTrustAdvisorReply`, `tryGenerateFrameworkGapReply` |
| `GovernanceService` | `GovernanceService.ts` | `governance_scores`, `recommendations` | `calculateScore`, `runHealthAdvisor` |

Supporting pure-function packages genuinely consumed by the above (no DB I/O of their own,
but real algorithms, not literal stubs):

- `@zig/progress-engine` (`ProgressEngine.computePathCompletion`) — used by `LearningService`.
- `@zig/completion-engine` (`CompletionEngine.deriveLearningSignal`) — used by
  `LearningService`, itself composes `@zig/progress-engine`.

## Layer 2 — Decorative stub packages (no DB I/O, static/deterministic only)

Every package below exports exactly one class whose methods return either a hardcoded
literal array or a one-line arithmetic formula over arguments the caller passes in. None
holds a repository, none is awaited against a database, none appears in `factory.ts`.

| Package | Class | What it returns | Consuming route (if any) |
|---|---|---|---|
| `learning-os` | `LearningOperatingSystem` | hardcoded `LearningMissionStage[]` | none found |
| `learning-kernel` | `LearningKernel` | hardcoded responsibility list | `app/learning-command-center/page.tsx` |
| `learning-orchestrator` | `LearningOrchestrator` | constant `"mentor_intervention"` | none found |
| `learning-runtime` | `LearningRuntime` | hardcoded e2e stage list | `app/learning/page.tsx` |
| `learning-paths` | `LearningPathGenerator` | hardcoded output-type list | none found |
| `learning-telemetry` | `LearningTelemetry` | hardcoded metric-name list | none found |
| `learning-memory` | `LearningMemorySystem` | string-joins caller-supplied array | none found |
| `learning-agents` | `LearningAgentWorkforce` | hardcoded 8-agent roster | `app/academy/page.tsx` |
| `learning-analytics` | `LearningAnalytics` | average of 6 caller-supplied numbers | `app/learning/page.tsx` |
| `learning-marketplace` | `LearningMarketplace` | hardcoded 3-item catalog | `app/learning/marketplace/page.tsx` |
| `adaptive-learning` | `AdaptiveLearningEngine` | filter/sort over caller-supplied signals | `app/learning/page.tsx` |
| `practice-lab` | `PracticeLabEngine` | constant-maturity company object | none found in current routes |
| `assessment-engine` | `AssessmentEngine` | `score >= 75` pass/fail over caller input | none found (superseded by real `AssessmentService`) |
| `assessment-os` | `AssessmentOS` | average of 5 caller-supplied numbers | none found |
| `capstones` | `CapstoneEngine` | hardcoded deliverable list | none found |
| `certification-journeys` | `CertificationJourneyEngine` | hardcoded journey-name list | none found |
| `certification-readiness` | `CertificationReadinessEngine` | average of 6 caller-supplied numbers | none found (superseded by real Certification*Service) |
| `career-os` | `CareerOS` | average of 4 caller-supplied numbers + string template | **was** `app/learning/career/page.tsx` with hardcoded literal inputs — fixed Phase 12, route now redirects to `/career` |
| `career-readiness` | `CareerReadinessEngine` | average of 7 caller-supplied numbers | none found (superseded by real `LearningService.getCareerReadiness`) |
| `employment` | `EmploymentOS` | hardcoded 8-component list | `app/career/page.tsx` (real route, decorative list only) |
| `employer-matching` | `EmployerMatchingEngine` | string template over real `readiness` input | `app/career/page.tsx` (fed the real readiness score) |
| `employer-cloud` | `EmployerCloud` | hardcoded feature list | `app/employers/page.tsx` |
| `student-twin` | `StudentDigitalTwin` | average over caller-supplied score map | none found (superseded by real `student_twins` table + `LearningService`) |
| `student-lifecycle` | `StudentLifecycleEngine` | hardcoded stage list | none found |
| `digital-twin` | `ExecutiveDigitalTwin` | arithmetic gap/forecast over caller input | `app/digital-twin/page.tsx` |
| `instructor-os` | `InstructorOS` | hardcoded builder-type list | `app/learning/instructor/page.tsx` |
| `mentorship` | `MentorshipPlatform` | hardcoded feature list | none found |
| `mentorship-cloud` | `MentorshipCloud` | hardcoded role list | none found |
| `community` | `CommunityPlatform` | hardcoded feature list | none found |
| `community-os` | `CommunityOS` | hardcoded program list + arithmetic match score | `app/learning/community/page.tsx` |
| `cohorts` | `CohortEngine` | hardcoded feature list | none found |
| `corporate-academies` | `CorporateAcademyPlatform` | hardcoded academy-type list | `app/corporate-academy/page.tsx` |
| `university-platform` | `UniversityPlatform` | hardcoded user-type list | `app/university/page.tsx` |
| `apprenticeship` | `ApprenticeshipEngine` | hardcoded persona/object lists | `app/apprenticeship/page.tsx` |
| `training-cloud` | `TrainingCloud` | hardcoded scope list | none found |
| `training-marketplace` | `TrainingMarketplace` | hardcoded asset/monetization lists | none found |
| `training-partners` | `TrainingPartnerNetwork` | hardcoded partner-type list | none found |
| `workforce-analytics` | `WorkforceAnalytics` | average of 8 caller-supplied numbers | none found |
| `workforce-development` | `WorkforceDevelopmentEngine` | hardcoded output list | none found |
| `credentials` | `CredentialingPlatform` | hardcoded credential-type list | none found |
| `skills-graph` | `SkillsGraph` | average over caller input + hardcoded ISO node list | `app/skills/page.tsx`, `app/learning/page.tsx` |
| `knowledge-graph` | `KnowledgeGraph` | constructs an edge tuple from arguments | `app/executive-assurance/page.tsx` |

**Packages with zero consuming route** (16 of 45): `learning-os`, `learning-orchestrator`,
`learning-paths`, `learning-telemetry`, `learning-memory`, `practice-lab`,
`assessment-engine`, `assessment-os`, `capstones`, `certification-journeys`,
`certification-readiness`, `career-readiness`, `student-twin`, `student-lifecycle`,
`mentorship`, `mentorship-cloud`, `community`, `cohorts`, `training-cloud`,
`training-marketplace`, `training-partners`, `workforce-analytics`,
`workforce-development`, `credentials` — these are pure dead code today: built, typed,
never imported anywhere in `apps/web`.

## Real database tables relevant to Learning/Career/Certification/Portfolio

From `packages/data-access/src/records.ts` (all confirmed real, RLS-backed, with a writer
service above): `learning_paths`, `learning_modules`, `learning_assessments`,
`learning_assessment_questions`, `learning_assessment_results`, `user_progress`,
`student_twins`, `scenarios`, `scenario_runs`, `lab_tasks`, `lab_task_submissions`,
`lab_artifacts`, `capstone_projects`, `learner_portfolios`, `certification_awards`,
`coach_conversations`, `coach_messages`.

No table exists yet for: interview questions/attempts, mentorship sessions, cohorts,
community posts, marketplace listings, employer accounts, job postings/applications. Every
stub package whose name implies one of these (mentorship, community, marketplace,
employer-cloud, training-marketplace, credentials) has no backing table — its route, where
one exists, is decorative only.
