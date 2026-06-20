# Scenario Engine — Architecture Design

Status: design doc, doc-first per `CLAUDE.md`. No schema or service code is created by this
document. Covers Area 2 (Scenario Intelligence) and Area 12 (Scenario Decision Engine) of
`docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md`, Tier 1 priority #2 ("Scenario Engine").

## 1. What already exists (do not duplicate)

The repo already has a working scenario system. This design **extends** it; it does not
replace it.

### 1.1 Existing entities (`packages/types/src/index.ts`)

```ts
export interface Scenario {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  description: string;
  frameworkIds: string[];
}

export interface ScenarioRun {
  id: string;
  tenantId: string;
  projectId: string;
  scenarioId: string;
  status: ScenarioRunStatus;
  scoreDelta: number;
  startedAt: Date;
  completedAt?: Date;
}
```

`ScenarioRecord` / `ScenarioRunRecord` (`packages/data-access/src/records.ts`) are these
interfaces plus `createdAt: Date; updatedAt: Date`.

**What `Scenario`/`ScenarioRun` already do:**
- `Scenario` is a **project-scoped, framework-tagged exercise definition** — it lives under
  a `projectId`, not a learner. It is the operational/project-builder notion of "a scenario
  exists in this project and maps to these frameworks."
- `ScenarioRun` is a **single coarse-grained execution** of a scenario against a project: a
  status, a `scoreDelta`, a start/complete timestamp. There is no concept inside it of
  multiple decision points, branching choices, or per-decision score attribution. It is a
  pass/fail-with-a-number record, consistent with the "content completion" model the vision
  doc calls out as insufficient (gap analysis areas #2 and #12).

### 1.2 Existing service (`packages/services/src/ScenarioService.ts`)

```ts
export class ScenarioService extends BaseService<ScenarioRecord> {
  constructor(
    scenarioRepository: TenantRepository<ScenarioRecord>,
    private readonly runRepository: TenantRepository<ScenarioRunRecord>,
  ) {
    super(scenarioRepository);
  }

  findRuns(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord[]> {
    return this.runRepository.findMany(context, { filters: { scenarioId } });
  }
}
```

`BaseService<T>` (`packages/services/src/BaseService.ts`) supplies `create`, `update`,
`delete`, `findById`, `findMany`, `search` against a single `TenantRepository<T>`.
`ScenarioService` follows the established two-repository pattern also used by
`GovernanceService` (primary repo via `super()`, secondary repo as a private constructor
field with one read method).

### 1.3 Existing repository wiring (`packages/data-access/src/repositories.ts`)

`ZigRepositories` registers `scenarios: TenantRepository<ScenarioRecord>` and
`scenarioRuns: TenantRepository<ScenarioRunRecord>`, each backed by a Supabase table
(`scenarios`, `scenario_runs`) or an in-memory adapter for tests, with every read/write going
through `TenantContext` (`{ tenantId, actorUserId? }`) so tenant isolation is structural, not
optional. `TenantScopedRecord` requires `id`, `tenantId`, optional `createdAt`/`updatedAt`.
`CreateRecord<T>` strips `tenantId`/`createdAt`/`updatedAt` (server sets them);
`UpdateRecord<T>` additionally strips `id`. Every new table below follows this exact contract.

### 1.4 What is new in this design

| Existing today | Gap this doc closes |
|---|---|
| `Scenario` = a project-scoped exercise definition | No **template/library** concept independent of a project — a scenario like "Vendor Breach" should be authorable once and instantiated per learner, per project, many times |
| `ScenarioRun` = one coarse run with a single `scoreDelta` | No **attempt** record scoped to a learner (`learnerId`), no **decision-by-decision** trail, no **typed outcome** record separate from the run shell |
| No branching logic anywhere | No **Scenario Decision Engine**: decision points, options, the option chosen, and the score deltas each option produces (Area 12) |
| `GovernanceService` scores are project-level, recalculated from asset/risk/control/evidence/assessment coverage | No defined **write path** from a learner's in-scenario decision into a `GovernanceScoreRecord`-shaped delta |

`scenario_templates`, `scenario_attempts`, `scenario_decisions`, `scenario_outcomes` are
**new, additive** tables. `Scenario` and `ScenarioRun` are **not modified, not deprecated**.
A `scenario_template` is the authored content a `Scenario` row can point at (via
`templateId`, added as an optional field — see §2.5); a `scenario_attempt` is the
learner-scoped, decision-tracked execution that a `ScenarioRun` row summarizes when the
attempt completes (see §2.6).

## 2. New entities

All four follow the `*Record` pattern: a `@zig/types` interface plus
`{ createdAt: Date; updatedAt: Date }`, registered in `packages/data-access/src/records.ts`
and `ZigRepositories`, exactly like `ScenarioRecord`/`ScenarioRunRecord` today.

### 2.1 `scenario_templates`

The authored, reusable definition of a scenario — the seed-data layer for CloudPay,
HealthBridge, RetailNova, ManufacturX, GovSec (see §5). One template can back many
`Scenario` instances across many tenants/projects.

```ts
export interface ScenarioTemplate {
  id: string;
  tenantId: string;              // null/shared-tenant convention for Zig-authored library
                                  // content is decided in docs/data/database-schema.md,
                                  // not here — this doc assumes tenant-scoped rows
  key: string;                   // stable slug, e.g. "cloudpay-vendor-breach"
  name: string;                  // "Vendor Breach Response"
  simulatedCompany: string;      // "CloudPay" | "HealthBridge" | "RetailNova" |
                                  // "ManufacturX" | "GovSec"
  description: string;
  frameworkIds: string[];        // mirrors Scenario.frameworkIds
  competencyIds: string[];       // FK -> competencies (#1), e.g. Vendor Risk, Risk Assessment
  difficulty: "foundation" | "intermediate" | "advanced";
  decisionPointIds: string[];    // ordered list of decision point keys (see 2.3)
  startingScores: {              // baseline scores the attempt forks from
    riskScore: number;
    healthScore: number;
    readinessScore: number;
  };
  status: "draft" | "published" | "retired";
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 `scenario_attempts`

Learner-scoped, replaces "a single `ScenarioRun`" with a richer execution that has a
decision trail. One `scenario_attempt` is created per learner playthrough; on completion it
writes a summarizing `ScenarioRun` row (see §2.6) so existing run-history consumers (e.g.
`findRuns`) keep working unchanged.

```ts
export interface ScenarioAttempt {
  id: string;
  tenantId: string;
  projectId: string;             // matches Scenario.projectId for the instantiated scenario
  scenarioId: string;            // FK -> scenarios.id (the project-scoped instance)
  templateId: string;            // FK -> scenario_templates.id
  learnerId: string;             // FK -> users.id (the User entity, packages/types)
  status: "in_progress" | "completed" | "abandoned";
  currentDecisionPointId: string | null; // null once completed/abandoned
  riskScore: number;             // running score, starts at template.startingScores.riskScore
  healthScore: number;
  readinessScore: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 `scenario_decisions`

One row per decision point *resolved* within an attempt — the Area 12 branching record.

```ts
export interface ScenarioDecision {
  id: string;
  tenantId: string;
  attemptId: string;             // FK -> scenario_attempts.id
  decisionPointId: string;       // stable key within the template, e.g.
                                  // "cloudpay-vendor-breach-step-2"
  prompt: string;                // "A vendor notifies you of a data breach affecting..."
  optionsPresented: ScenarioDecisionOption[];
  optionChosen: string;          // matches one optionsPresented[].id
  scoreDeltas: {
    riskScore: number;           // can be positive or negative
    healthScore: number;
    readinessScore: number;
  };
  rationale: string;             // explainability text shown to the learner after choosing
                                  // (mirrors the explainability requirement in CLAUDE.md's
                                  // AI Command Center section: reason + data + confidence)
  decidedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioDecisionOption {
  id: string;                    // "ignore" | "accept" | "investigate" | "escalate"
  label: string;
  scoreDeltas: {
    riskScore: number;
    healthScore: number;
    readinessScore: number;
  };
}
```

`optionsPresented` is denormalized onto the decision row (not just referenced by ID) so the
attempt's history is self-contained and auditable even if the template's options are edited
later — the same reasoning `AuditRepository` already applies to audit events.

### 2.4 `scenario_outcomes`

One row per *completed* attempt — the typed result that replaces a bare `scoreDelta` number,
and the thing portfolio/career-readiness (Areas 3, 9) and the Learning↔Operational Bridge
(Area 13) read from.

```ts
export interface ScenarioOutcome {
  id: string;
  tenantId: string;
  attemptId: string;             // FK -> scenario_attempts.id, 1:1
  learnerId: string;
  scenarioId: string;
  templateId: string;
  finalRiskScore: number;
  finalHealthScore: number;
  readinessScoreDelta: number;   // net change vs template.startingScores.readinessScore
  decisionsCount: number;
  competenciesDemonstrated: string[]; // FK -> competencies, derived from decisions taken
  grade: "strong" | "adequate" | "weak"; // coarse rubric placeholder; Area 10 owns the
                                          // real weighted-rubric model — this is not that
  summary: string;               // human-readable recap, AI-generated or templated
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.5 Linking new entities to the existing `Scenario`

`Scenario.templateId?: string` is the one additive field proposed on the *existing*
interface (optional, backward compatible — existing rows with no template keep working as
ad hoc project scenarios exactly as today). It points a project-scoped `Scenario` instance
at the `scenario_templates` row it was instantiated from.

### 2.6 Linking new entities to the existing `ScenarioRun`

`ScenarioRun` is not changed. When a `scenario_attempt` transitions to `completed`, the
service creates a `ScenarioRun` row (`scenarioId`, `projectId`, `tenantId`, `status:
"completed"`, `scoreDelta: outcome.readinessScoreDelta`, `startedAt`, `completedAt`) so every
existing consumer of `findRuns()` continues to see one summarizing row per attempt, with no
breaking change. The richer trail lives in `scenario_attempts`/`scenario_decisions`/
`scenario_outcomes`; `ScenarioRun` stays the coarse historical ledger it already is.

## 3. Scenario Decision Engine (Area 12)

### 3.1 Worked example: CloudPay — "Vendor Breach"

A `scenario_template` (`key: "cloudpay-vendor-breach"`) defines one decision point:

```json
{
  "decisionPointId": "cloudpay-vendor-breach-step-1",
  "prompt": "A payment-rail vendor notifies CloudPay of a breach exposing transaction metadata (not cardholder PII). What do you do?",
  "options": [
    { "id": "ignore",      "label": "Ignore — vendor says it's contained",          "scoreDeltas": { "riskScore": +15, "healthScore": -10, "readinessScore": -10 } },
    { "id": "accept",      "label": "Accept the vendor's risk acceptance memo",     "scoreDeltas": { "riskScore": +8,  "healthScore": -4,  "readinessScore": -4  } },
    { "id": "investigate", "label": "Open an internal investigation + risk entry",  "scoreDeltas": { "riskScore": -5,  "healthScore": +6,  "readinessScore": +5  } },
    { "id": "escalate",    "label": "Escalate to CISO, open incident + vendor risk reassessment", "scoreDeltas": { "riskScore": -12, "healthScore": +10, "readinessScore": +12 } }
  ]
}
```

Higher `riskScore` deltas here represent *increased* unaddressed risk (worse); negative
deltas represent risk reduction. This sign convention must match whatever
`docs/architecture/governance-scoring-engine.md` ultimately defines for `RiskRecord`-derived
scoring — this doc does not redefine governance scoring, it consumes it (see §3.2).

A learner choosing `"escalate"` produces a `scenario_decisions` row with
`optionChosen: "escalate"`, `scoreDeltas: { riskScore: -12, healthScore: +10,
readinessScore: +12 }`, and a `rationale` such as: *"Escalating immediately and reopening
the vendor risk assessment is the SOC 2 CC9.2/ISO 27001 A.5.21-aligned response — this
mirrors how a real vendor-risk incident should be handled and is reflected in your Risk and
Health scores."*

### 3.2 Read/write relationship to `GovernanceService`

`GovernanceService` (`packages/services/src/GovernanceService.ts`) today is:

```ts
export class GovernanceService extends BaseService<GovernanceScoreRecord> {
  constructor(
    governanceScoreRepository: TenantRepository<GovernanceScoreRecord>,
    private readonly recommendationRepository: TenantRepository<RecommendationRecord>,
  ) {
    super(governanceScoreRepository);
  }

  findRecommendations(context: TenantContext, projectId: string): Promise<RecommendationRecord[]> {
    return this.recommendationRepository.findMany(context, { filters: { projectId } });
  }
}
```

`GovernanceScoreRecord` (`GovernanceScore & { id, createdAt, updatedAt }`) has fields
`tenantId, projectId, score, controlsImplemented, evidenceCoverage, riskTreatment,
assessmentCompletion, explanation, calculatedAt` — it is a **project-level, recalculated
composite score**, not a learner score and not directly writable field-by-field from a
scenario decision.

This design draws a clean boundary instead of overloading that record:

- **Read path**: `ScenarioAttemptService` (§4) may call
  `governanceService.findById(context, scoreId)` for the attempt's `projectId` to seed
  `startingScores`/contextualize a decision prompt with the project's *real* current
  governance posture (e.g. "this project's `riskTreatment` is already low — escalating
  matters more here"). This is read-only; the scenario engine never mutates
  `GovernanceScoreRecord` fields directly, because that record is owned and recalculated by
  the governance scoring engine from real assets/risks/controls/evidence, not from
  hypothetical learner choices.
- **Write path**: a decision's `scoreDeltas` accumulate only onto `scenario_attempts.riskScore
  / healthScore / readinessScore` — fields that live entirely inside the scenario engine's
  own tables. They never write into `governance_scores`.
- **Bridge (deferred to Area 13)**: the vision doc's gap analysis area #13
  (Learning↔Operational Bridge) is explicit that importing a completed scenario's
  risks/controls into real `RiskService`/`ControlService` records (which *would* eventually
  move the real `GovernanceScoreRecord`) is "the biggest architectural bridge, not a new
  table," and Tier 1 in the priority list does not include it. This doc does not build that
  bridge. `scenario_outcomes.competenciesDemonstrated` is the only hook intentionally left
  for Area 13 to attach to later.

## 4. `ScenarioAttemptService`

### 4.1 New service vs. extending `ScenarioService` — decision

**New service: `ScenarioAttemptService`.** Justification against "do not create duplicate
architecture":

- `ScenarioService` extends `BaseService<ScenarioRecord>` — its primary repository is
  `scenarios`, a project-scoped definition table. Bolting attempt/decision/outcome logic
  onto it would make one service own two unrelated primary entities (`ScenarioRecord` and
  `ScenarioAttemptRecord`), breaking the established `BaseService<T>` one-primary-repository
  convention every other service (`GovernanceService`, presumably `RiskService`/
  `ControlService`) follows.
  - `ScenarioAttemptService` extends `BaseService<ScenarioAttemptRecord>` — same shape as
  `ScenarioService extends BaseService<ScenarioRecord>` — and takes `scenarioDecisions` and
  `scenarioOutcomes` repositories as secondary constructor params, exactly mirroring how
  `ScenarioService` takes `runRepository` and `GovernanceService` takes
  `recommendationRepository`. This is the *same* pattern, applied to a sibling entity, not a
  parallel architecture.
- `ScenarioAttemptService` depends on `ScenarioService` (composition, not inheritance) for
  the one cross-entity operation it needs — looking up the `Scenario`/template — and depends
  on `GovernanceService` for the read-only score lookup in §3.2. No code is duplicated;
  `ScenarioAttemptService` is additive and delegates.

### 4.2 Spec

```ts
import { BaseService } from "./BaseService";
import { GovernanceService } from "./GovernanceService";
import { ScenarioService } from "./ScenarioService";
import type {
  ScenarioAttemptRecord,
  ScenarioDecisionRecord,
  ScenarioOutcomeRecord,
  ScenarioRunRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export class ScenarioAttemptService extends BaseService<ScenarioAttemptRecord> {
  constructor(
    attemptRepository: TenantRepository<ScenarioAttemptRecord>,
    private readonly decisionRepository: TenantRepository<ScenarioDecisionRecord>,
    private readonly outcomeRepository: TenantRepository<ScenarioOutcomeRecord>,
    private readonly runRepository: TenantRepository<ScenarioRunRecord>,
    private readonly scenarioService: ScenarioService,
    private readonly governanceService: GovernanceService,
  ) {
    super(attemptRepository);
  }

  /** Start a new attempt for a learner against a project-scoped scenario instance. */
  startAttempt(
    context: TenantContext,
    params: { scenarioId: string; templateId: string; projectId: string; learnerId: string },
  ): Promise<ScenarioAttemptRecord> { /* creates attempt with template.startingScores */ }

  /** Record a resolved decision point and accumulate score deltas onto the attempt. */
  recordDecision(
    context: TenantContext,
    attemptId: string,
    decision: { decisionPointId: string; optionChosen: string },
  ): Promise<ScenarioDecisionRecord> { /* looks up template's option, writes scenario_decisions,
                                            patches scenario_attempts running scores */ }

  /** All decisions made so far within an attempt, in order. */
  findDecisions(context: TenantContext, attemptId: string): Promise<ScenarioDecisionRecord[]> {
    return this.decisionRepository.findMany(context, { filters: { attemptId } });
  }

  /** Close out an attempt: writes scenario_outcomes + a summarizing ScenarioRun row. */
  completeAttempt(context: TenantContext, attemptId: string): Promise<ScenarioOutcomeRecord> {
    /* per §2.6 */
  }

  /** Read-only governance context used to seed/contextualize an attempt (§3.2). */
  private readGovernanceContext(context: TenantContext, projectId: string) {
    return this.governanceService.findMany(context); // filtered to projectId by caller
  }
}
```

All methods take `TenantContext` first, exactly like every method on `BaseService`,
`ScenarioService`, and `GovernanceService` today — no new tenant-isolation mechanism is
introduced.

## 5. Relationship to the existing 5 scenarios

`docs/scenarios/CLOUDPAY.md`, `HEALTHBRIDGE.md`, `RETAILNOVA.md`, `MANUFACTURX.md`,
`GOVSEC.md` already describe these simulated companies in terms of `simulated_companies` /
`simulated_company_objects` (a separate, already-documented schema in
`supabase/migrations/202606180007_learning_os_e2e.sql`, per CLOUDPAY.md's header note).
**Those tables are not touched by this doc.**

The relationship is additive, not replacing:

| Existing | Role in this design |
|---|---|
| `simulated_companies` / `simulated_company_objects` | Stay exactly as-is — the underlying simulated org/asset/risk/control fixture data each scenario narrative references |
| `docs/scenarios/CLOUDPAY.md` etc. (narrative docs) | Become the **content source** for `scenario_templates` rows: one or more templates per simulated company, each with a `simulatedCompany` field matching the doc (`"CloudPay"`, `"HealthBridge"`, `"RetailNova"`, `"ManufacturX"`, `"GovSec"`) |
| The "seed risk"/"seed control" objects each doc calls out (e.g. CloudPay's "Unencrypted Backup Snapshots" risk) | Become natural decision-point subject matter — e.g. a CloudPay vendor-breach or backup-encryption decision template, a RetailNova vendor-tier escalation decision template (RetailNova is explicitly the Vendor Risk track's focus scenario per CLOUDPAY.md) |

Concretely: five `scenario_templates` rows (minimum, one per company) seed from the five
docs, each carrying at least one `decisionPointIds` entry modeled on that company's
documented risk/vendor/org profile. No new simulated-company schema is introduced; this
doc's tables sit one layer above that fixture data.

## 6. What this wave does NOT do

- Does not modify `Scenario`, `ScenarioRun`, `GovernanceScore`, or `Recommendation` beyond
  the one additive optional field (`Scenario.templateId?`).
- Does not implement the Learning↔Operational Bridge (Area 13) — completing a scenario does
  not import risks/controls/evidence into `RiskService`/`ControlService`/`EvidenceService`.
  `scenario_outcomes.competenciesDemonstrated` is left as the future hook only.
- Does not implement the Competency Engine (Area 1) — `competencyIds` /
  `competenciesDemonstrated` fields above are FK placeholders pointing at a `competencies`
  table this doc does not define.
- Does not implement weighted-rubric grading (Area 10) — `scenario_outcomes.grade` is a
  coarse three-value placeholder, not the real rubric model.
- Does not implement the AI Learning Coach (Area 7) — decision `rationale` text is assumed
  templated or AI-generated by a future coaching backend, not specified here.
- Does not implement `simulated_companies` schema changes — that table is read-only context
  for this design.
- Does not write application code, migrations, or modify `ScenarioService.ts`,
  `GovernanceService.ts`, `BaseService.ts`, or `repositories.ts`. Those files were read for
  pattern-fidelity only; this is a design document per "never implement before documenting."
- Does not decide the sign convention or recalculation formula for `riskScore` — that is
  `docs/architecture/governance-scoring-engine.md`'s decision; this doc flags the dependency
  in §3.1 rather than resolving it.
