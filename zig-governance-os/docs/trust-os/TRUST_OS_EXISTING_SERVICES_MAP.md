# Trust OS — Existing Services Map

> Batch 1. Full inventory of `packages/services/src/` (the canonical, factory-assembled
> service layer) plus the adjacent "engine" packages a Trust OS build might be tempted to
> reuse under a similar name. Every entry is read directly from source, not inferred.

## Canonical service layer — `packages/services/src/factory.ts`

`createServices(repositories)` (`packages/services/src/factory.ts:15-39`) returns one
`ZigServices` object with exactly these members:

| Key | Class | File | Constructor dependencies |
|---|---|---|---|
| `tenants` | `TenantService` | `TenantService.ts:11` | `tenants`, `users` repositories |
| `users` | `UserService` | `UserService.ts:14` | `users` repository |
| `audit` | `AuditService` | `AuditService.ts:3` | `auditEvents` sink |
| `frameworks` | `FrameworkService` | `FrameworkService.ts:4` | `frameworks` repository |
| `projects` | `ProjectService` | `ProjectService.ts:12` | `projects`, `projectFrameworks` repositories |
| `assets` | `AssetService` | `AssetService.ts:4` | `assets` repository (no extra methods — pure `BaseService`) |
| `risks` | `RiskService` | `RiskService.ts:4` | `risks`, `riskAssessments` repositories |
| `controls` | `ControlService` | `ControlService.ts:4` | `controls`, `controlMappings` repositories |
| `evidence` | `EvidenceService` | `EvidenceService.ts:4` | `evidence` repository |
| `learning` | `LearningService` | `LearningService.ts:4` | `learningPaths`, `learningModules` repositories |
| `scenarios` | `ScenarioService` | `ScenarioService.ts:4` | `scenarios`, `scenarioRuns` repositories |
| `governance` | `GovernanceService` | `GovernanceService.ts:4` | `governanceScores`, `recommendations` repositories |

Every service except `AuditService` and `AssetService` extends a shared
`BaseService<T>` (`packages/services/src/BaseService.ts:3`), which provides
`create`, `update`, `delete`, `findById`, `findMany`, `search` — all tenant-scoped through
a mandatory `TenantContext` first argument. This is the pattern any new Trust OS service
(e.g. a future `QuestionnaireService` or `VendorService`) must follow to avoid introducing
a second service architecture.

**There is no `assessments` key, no `vendors` key, and no `policies` key in `ZigServices`**
— confirming that AssessmentService and VendorService genuinely do not exist at the service
layer, even though their underlying tables do (`assessments`, `risk_assessments`, `vendors`,
`policies`).

## Method-level detail relevant to Trust OS reuse

- `GovernanceService.findRecommendations(context, projectId)` (`GovernanceService.ts:11-13`)
  already returns project-scoped `RecommendationRecord[]`. Trust Score "what would improve
  this" guidance (Batch 9) should call through this method rather than building a parallel
  recommendation feed.
- `EvidenceService.findByControl(context, controlId)` (`EvidenceService.ts:6-8`) is the
  existing query path from a control to its evidence. An Evidence Vault (Batch 2/4) should
  extend this service (e.g. add `findByFramework`, `findExpiring`) rather than create a
  second evidence repository.
- `ControlService.findMappings(context, sourceControlId)` (`ControlService.ts:10-12`) reads
  `ControlMappingRecord[]` — the existing cross-framework control mapping mechanism. Any
  Trust OS framework-coverage view should read through this, consistent with CLAUDE.md's
  rule that "frameworks are metadata, never hardcoded per-module logic"
  (`zig-governance-os/CLAUDE.md:107-109`).
- `RiskService.findAssessments(context, riskId)` (`RiskService.ts:10-12`) — note this
  `RiskAssessmentRecord` is the governance-assessment sense of "assessment" (a risk's
  assessment history), distinct from the learning-assessment sense described below. Trust
  OS must keep this distinction explicit (see `TRUST_OS_CAPABILITY_AUDIT.md`, naming
  collision note).

## Non-canonical "engine" packages (exist, but outside the service factory)

These packages export classes/types but are **not** wired into `createServices()` and have
no repository, no tenant context, and (for two of them) no persistence at all:

| Package | File | What it actually is |
|---|---|---|
| `packages/assessment-engine/src/index.ts` | `index.ts:1-13` | `AssessmentEngine.grade()` — stateless quiz/exam grader for the Learning OS (`AssessmentType` includes `quiz`, `exam`, `capstone_grading`). Not governance-assessment logic. |
| `packages/assessment-os/src/index.ts` | `index.ts:1-12` | `AssessmentOS.composite()` — averages five learner-competency sub-scores into one number. Not governance-assessment logic. |
| `packages/ai-governance/src/index.ts` | `index.ts:1-14` | `AiGovernanceLayer.canExecute(policy)` — single boolean gate over an `AiGovernancePolicy` object. No persistence, no asset registry. |
| `packages/knowledge-graph/src/index.ts` | `index.ts:1-12` | `KnowledgeGraph.edge()` — a pure factory function returning `{from, relationship, to}`. No storage, no traversal, no query API. |

A Trust OS implementation phase (outside the scope of this docs-only exercise) would extend
`packages/ai-governance` and `packages/knowledge-graph` in place rather than create
`packages/trust-ai-governance` or `packages/trust-knowledge-graph` as parallel packages,
since the names and intended domain already match.

## Services that look governance-related by directory name but were not found to contain
## governance logic (audited and ruled out as Trust OS substitutes)

`packages/governance-engine/src/`, `packages/risks/src/`, `packages/controls/src/`,
`packages/evidence/src/`, `packages/audits/src/`, `packages/frameworks/src/`,
`packages/policies/src/`, `packages/gaps/src/`, `packages/continuous-compliance/src/`,
`packages/compliance-network/src/`, and `packages/compliance-protocol/src/` all exist as
directories with an `src/`, but the **only code paths that are wired into the live
application** (via `packages/services/src/factory.ts` and `apps/web/app/`) are the ones
listed in the canonical table above. Any of these other packages that contain real logic
should be reconciled into the canonical service layer before Trust OS adds anything new to
avoid a second, parallel "governance engine."
