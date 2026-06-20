# Competency Engine — Architecture & Design Doc

> STATUS: DESIGN — doc-first artifact for Area 1 (Competency Engine), Tier 1 priority #1
> of `docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md`. This document specifies the
> entities, rubric model, and service contract required before any implementation begins.
> No code in this repository implements anything described here yet (see "What This Wave
> Does NOT Do" at the end).

## 1. Purpose

The Competency Engine tracks whether a learner has *demonstrated* governance capability —
not just completed a course. It introduces three new entities (`competencies`,
`user_competencies`, `competency_assessments`) that sit in the Learning OS subsystem
alongside the existing `LearningPath` / `LearningModule` entities, scoped per-tenant and
per-learner, with no changes to the Universal Governance Model.

## 2. The 8 Governance Competencies

These are the fixed, seedable taxonomy of competencies named in
`docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md`. Each competency is a row in the
`competencies` table (see §3.1) — the list below is the canonical definition of what each
one means and what demonstrates it, used to write rubric criteria in §4.

| # | Competency | Code | What demonstrates it |
|---|---|---|---|
| 1 | Asset Management | `asset_management` | Correctly inventories assets, classifies them by type/criticality, and links them to the owning project without gaps or duplicate records. |
| 2 | Risk Assessment | `risk_assessment` | Identifies relevant risks for a given asset/context, scores likelihood and impact defensibly, and selects a treatment decision (accept/mitigate/transfer/avoid) with sound reasoning. |
| 3 | Control Design | `control_design` | Designs or selects controls that proportionately address an identified risk, specifies control type and operating frequency, and maps the control to the risk it mitigates. |
| 4 | Evidence Management | `evidence_management` | Collects, tags, and attaches evidence artifacts that are sufficient and traceable to the control or requirement they support, and keeps evidence current. |
| 5 | Framework Mapping | `framework_mapping` | Accurately maps assets, risks, or controls to the correct framework requirement(s) (e.g. ISO 27001, SOC 2, NIST CSF) without over- or under-mapping. |
| 6 | Audit Readiness | `audit_readiness` | Assembles a coherent, audit-facing narrative and evidence trail for a requirement or control on demand, with no missing links in the chain. |
| 7 | Vendor Risk | `vendor_risk` | Assesses third-party/vendor risk exposure, applies appropriate due-diligence criteria, and recommends a defensible risk tier or treatment. |
| 8 | Governance Reporting | `governance_reporting` | Produces an executive-ready report that accurately reflects underlying risk/control/evidence data and explains the "why" behind the governance score, not just the number. |

## 3. Entity Definitions

These follow the existing two-layer pattern used throughout the codebase:

- A plain domain interface in `packages/types/src/index.ts` (no `tenantId`/timestamps baked
  in unless the domain genuinely needs them at the type level, mirroring `RiskAssessment`
  vs `Assessment`).
- A `*Record` type in `packages/data-access/src/records.ts` that intersects the domain type
  with persistence fields (`tenantId`, `createdAt`, `updatedAt`, plus any persistence-only
  fields), mirroring `AssessmentRecord`.

All three entities are **tenant-scoped** (`tenantId: string`). `user_competencies` and
`competency_assessments` are additionally **learner-scoped** (`learnerId: string`,
referencing `User.id` — the existing `User` entity in `packages/types/src/index.ts`; field
is named `learnerId` rather than `userId` to make the learning-context relationship
unambiguous at the type level, consistent with this doc's vision-doc terminology).

### 3.1 `competencies`

The fixed taxonomy from §2. Seeded reference data, one row per competency per tenant (a
tenant can disable/customize a competency description without forking the global list, but
the canonical 8 ship as defaults — see seeding note below).

**Domain type — `Competency` (`packages/types/src/index.ts`):**

```ts
export interface Competency {
  id: string;
  tenantId: string;
  code: CompetencyCode; // "asset_management" | "risk_assessment" | "control_design" |
                        // "evidence_management" | "framework_mapping" |
                        // "audit_readiness" | "vendor_risk" | "governance_reporting"
  name: string;
  description: string;
  category: "core" | "specialist"; // core = required for all governance roles; specialist = role-dependent
  isActive: boolean;
  sortOrder: number;
}

export type CompetencyCode =
  | "asset_management"
  | "risk_assessment"
  | "control_design"
  | "evidence_management"
  | "framework_mapping"
  | "audit_readiness"
  | "vendor_risk"
  | "governance_reporting";
```

**Record type — `CompetencyRecord` (`packages/data-access/src/records.ts`):**

```ts
export type CompetencyRecord = Competency & { createdAt: Date; updatedAt: Date };
```

(`Competency` already declares `tenantId`, so the Record type only adds timestamps — same
shape as `RiskRecord`.)

### 3.2 `user_competencies`

The rollup record: one row per (`learnerId`, `competencyId`) pair, tracking a learner's
current proficiency level for a competency, derived from their `competency_assessments`
history. This is the entity the Mission Control / learner dashboard reads to render
progress — it is a denormalized cache, not the source of truth (the assessments are).

**Domain type — `UserCompetency`:**

```ts
export interface UserCompetency {
  id: string;
  tenantId: string;
  learnerId: string;          // FK -> User.id
  competencyId: string;       // FK -> Competency.id
  proficiencyLevel: CompetencyLevel; // "novice" | "developing" | "proficient" | "advanced"
  currentScore: number;        // 0-100, weighted average of latest assessment(s)
  assessmentCount: number;     // total completed competency_assessments contributing to this rollup
  lastAssessedAt: Date | null;
  latestAssessmentId: string | null; // FK -> CompetencyAssessment.id, most recent contributing assessment
}

export type CompetencyLevel = "novice" | "developing" | "proficient" | "advanced";
```

**Record type — `UserCompetencyRecord`:**

```ts
export type UserCompetencyRecord = UserCompetency & { createdAt: Date; updatedAt: Date };
```

A unique constraint on (`tenantId`, `learnerId`, `competencyId`) is required at the
persistence layer to keep this a true rollup (one row per learner per competency, not a
history table — history lives in `competency_assessments`).

### 3.3 `competency_assessments`

The event-level record: one row per scored assessment attempt against a competency,
carrying the full rubric breakdown (§4). This is the append-only source of truth that
`user_competencies` rolls up from.

**Domain type — `CompetencyAssessment`:**

```ts
export interface CompetencyAssessment {
  id: string;
  learnerId: string;              // FK -> User.id
  competencyId: string;           // FK -> Competency.id
  sourceType: CompetencyAssessmentSource; // what produced this assessment
  sourceRefId: string | null;     // FK into the source entity (e.g. LearningModule.id, scenario id) — nullable for manually-recorded assessments
  rubric: CompetencyRubricScore;  // see §4 for shape
  overallScore: number;           // 0-100, computed from rubric.criteria weighted sum
  proficiencyLevel: CompetencyLevel;
  assessedAt: Date;
  assessorType: "system" | "ai_coach" | "instructor";
  assessorId: string | null;      // FK -> User.id when assessorType is "instructor"
  notes: string | null;
}

export type CompetencyAssessmentSource =
  | "learning_module"
  | "scenario"
  | "portfolio_artifact"
  | "manual";
```

**Record type — `CompetencyAssessmentRecord`** (follows the `AssessmentRecord` precedent
of bolting on tenant/project/status fields beyond the lean domain type):

```ts
export type CompetencyAssessmentRecord = CompetencyAssessment & {
  tenantId: string;
  projectId: string | null;   // null when the assessment is learning-context-only, set when tied to real operational work (see §6 Learning↔Operational Bridge)
  status: "draft" | "submitted" | "scored" | "disputed";
  createdAt: Date;
  updatedAt: Date;
};
```

## 4. Rubric Model

Per the vision doc, rubric definitions live on `competency_assessments`, not a separate
table. Each competency has a fixed set of weighted criteria that sum to 100%. The rubric
weights are defined as static configuration (keyed by `CompetencyCode`) and the *scores*
against those criteria are stored per-assessment in the `rubric` field.

### 4.1 Rubric criteria by competency

| Competency | Criterion 1 | Criterion 2 | Criterion 3 | Criterion 4 |
|---|---|---|---|---|
| Risk Assessment | Identification 25% | Analysis 25% | Treatment 25% | Documentation 25% |
| Asset Management | Inventory Accuracy 30% | Classification 25% | Ownership Assignment 25% | Documentation 20% |
| Control Design | Proportionality 30% | Coverage 25% | Specification Quality 25% | Mapping Accuracy 20% |
| Evidence Management | Sufficiency 30% | Traceability 30% | Currency 20% | Tagging Accuracy 20% |
| Framework Mapping | Mapping Accuracy 40% | Coverage Completeness 30% | Justification Quality 30% | — |
| Audit Readiness | Narrative Coherence 30% | Evidence Trail Completeness 35% | Gap Identification 20% | Presentation Quality 15% |
| Vendor Risk | Due Diligence Rigor 30% | Risk Tiering Accuracy 30% | Treatment Recommendation 25% | Documentation 15% |
| Governance Reporting | Data Accuracy 30% | Explainability ("why") 35% | Audience Fit 20% | Clarity 15% |

These weights are illustrative defaults seeded at launch; they are configuration data
(per-tenant overridable), not hardcoded business logic, consistent with the
"frameworks are metadata, not code paths" invariant applied here to rubric weights.

### 4.2 Rubric storage shape — `CompetencyRubricScore`

Stored as a typed JSON object on `CompetencyAssessment.rubric`:

```ts
export interface CompetencyRubricCriterionScore {
  criterionKey: string;   // e.g. "identification", "analysis", "treatment", "documentation"
  label: string;          // e.g. "Identification"
  weight: number;         // 0-1, e.g. 0.25 — must sum to 1.0 across all criteria for the assessment
  rawScore: number;       // 0-100, scorer's rating for this criterion alone
  weightedScore: number;  // rawScore * weight, precomputed for fast aggregation
  feedback: string | null; // free-text rationale, required when assessorType is "instructor" or "ai_coach"
}

export interface CompetencyRubricScore {
  competencyCode: CompetencyCode;
  criteria: CompetencyRubricCriterionScore[]; // length and keys must match the competency's defined rubric
  rubricVersion: string; // e.g. "1.0" — increments if a tenant edits weights, preserves historical comparability
}
```

`CompetencyAssessment.overallScore` is the sum of `criteria[].weightedScore` across the
array; `CompetencyAssessmentRecord` persistence layer should validate
`sum(criteria[].weight) === 1.0` (within floating-point tolerance) before accepting a
`status: "scored"` transition.

## 5. `CompetencyService` Spec

Follows the exact `BaseService<T>` + injected child-repository pattern used by
`RiskService` and `ControlService` (`packages/services/src/RiskService.ts`,
`ControlService.ts`). Primary record (`CompetencyRecord`) is passed to `super()`; the two
per-learner record types are injected as additional constructor dependencies, with finder
methods scoped by `learnerId` / `competencyId`.

```ts
// packages/services/src/CompetencyService.ts  (SPEC ONLY — not implemented this wave)
import { BaseService } from "./BaseService";
import type {
  CompetencyAssessmentRecord,
  CompetencyRecord,
  TenantContext,
  TenantRepository,
  UserCompetencyRecord,
} from "@zig/data-access";

export class CompetencyService extends BaseService<CompetencyRecord> {
  constructor(
    competencyRepository: TenantRepository<CompetencyRecord>,
    private readonly userCompetencyRepository: TenantRepository<UserCompetencyRecord>,
    private readonly assessmentRepository: TenantRepository<CompetencyAssessmentRecord>,
  ) {
    super(competencyRepository);
  }

  /** All rollup rows for a given learner (their full competency profile). */
  findUserCompetencies(context: TenantContext, learnerId: string): Promise<UserCompetencyRecord[]> {
    return this.userCompetencyRepository.findMany(context, { filters: { learnerId } });
  }

  /** Single rollup row for a learner+competency pair, or null if never assessed. */
  findUserCompetency(
    context: TenantContext,
    learnerId: string,
    competencyId: string,
  ): Promise<UserCompetencyRecord | null> {
    return this.userCompetencyRepository
      .findMany(context, { filters: { learnerId, competencyId } })
      .then((rows) => rows[0] ?? null);
  }

  /** Full assessment history for a learner against one competency, newest first. */
  findAssessments(
    context: TenantContext,
    learnerId: string,
    competencyId: string,
  ): Promise<CompetencyAssessmentRecord[]> {
    return this.assessmentRepository.findMany(context, { filters: { learnerId, competencyId } });
  }

  /**
   * Records a new scored assessment and recomputes the learner's rollup
   * (UserCompetencyRecord) from the updated assessment history.
   * Recompute strategy: weighted average of last N assessments, or most-recent-wins —
   * exact aggregation rule to be finalized in implementation-phase doc, not this design doc.
   */
  recordAssessment(
    context: TenantContext,
    assessment: Omit<CompetencyAssessmentRecord, "id" | "tenantId" | "createdAt" | "updatedAt">,
  ): Promise<{ assessment: CompetencyAssessmentRecord; rollup: UserCompetencyRecord }> {
    throw new Error("spec only — not implemented this wave");
  }

  /** All learners at or above a given proficiency level for a competency (e.g. for staffing/audit prep). */
  findProficientLearners(
    context: TenantContext,
    competencyId: string,
    minLevel: "developing" | "proficient" | "advanced",
  ): Promise<UserCompetencyRecord[]> {
    throw new Error("spec only — not implemented this wave");
  }
}
```

Corresponding additions to `ZigRepositories` (`packages/data-access/src/repositories.ts`),
following the existing `risks` / `riskAssessments` pairing convention:

```ts
competencies: TenantRepository<CompetencyRecord>;
userCompetencies: TenantRepository<UserCompetencyRecord>;
competencyAssessments: TenantRepository<CompetencyAssessmentRecord>;
```

wired in both `createSupabaseRepositories` and `createInMemoryRepositories` against tables
`competencies`, `user_competencies`, `competency_assessments` respectively.

## 6. Relationship to the Universal Governance Model

The Universal Governance Model is:

```
Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence → Task → Report
```

The Competency Engine's three entities (`competencies`, `user_competencies`,
`competency_assessments`) **do not insert into this chain** and are not a 12th core module.
This is intentional and does not violate the "no orphan entities" rule, for the same reason
`LearningPath` and `LearningModule` already coexist with the Universal Governance Model
without being orphans:

1. **They belong to a separately-scoped subsystem (Learning OS), not the operational
   chain.** The 11 canonical modules (Mission Control, Project Builder, Scenario Workspace,
   Asset/Risk/Control/Evidence/Task Workspaces, AI Command Center, Health Advisor,
   Executive Reporting) model an organization's *real* governance posture. The Competency
   Engine models a *learner's* skill state. These are different domains by design — an
   orphan would be a stray entity that claims to be part of the operational chain but
   doesn't connect to it; a competency record never claims that.

2. **Tenant isolation is preserved, which is the actual invariant being protected.** Every
   entity here carries `tenantId` and is served through `TenantRepository<T>` /
   `TenantContext` exactly like every operational entity. The "no orphans" rule exists to
   prevent disconnected workflows and isolation gaps — both are satisfied here.

3. **They are explicitly anchored to `User`, an entity that already exists and is shared
   across both the operational and learning sides of the product.** `learnerId` is not a
   dangling reference; it is a foreign key into the same `User`/`UserRecord` that owns
   operational records (assigned risks, completed tasks, authored reports). This is the
   connective tissue, not a gap.

4. **A documented bridge back into the operational chain is anticipated, not assumed.**
   `CompetencyAssessmentRecord.projectId` and `CompetencyAssessment.sourceRefId` are
   nullable hooks for the "Learning↔Operational Bridge" named in the vision doc's gap
   analysis (#13) — when a competency assessment is generated from real operational work
   (e.g. a `RiskAssessment` the learner actually authored), those fields get populated and
   the learning record traces back into the real chain. Until that bridge is built, the
   fields stay null and the assessment is purely learning-context — this is a deliberate,
   documented half of the design, not an accidental dangling reference.

5. **Precedent**: `LearningPath` / `LearningModule` already ship in
   `packages/types/src/index.ts` and `packages/data-access/src/records.ts` under the same
   logic — tenant-scoped, `User`-anchored, outside the 11-module list, not flagged as
   orphans. The Competency Engine extends that same precedent rather than establishing a
   new exception.

If a future wave wants competencies to directly gate operational permissions (e.g. "must be
`proficient` in Risk Assessment to approve a `RiskAssessment` record"), that coupling must
be designed and documented explicitly at that time — it is out of scope here and is not
assumed by this entity design.

## 7. What This Wave Does NOT Do

This is a design document only. Specifically, this wave does **not**:

- Create the `competencies`, `user_competencies`, or `competency_assessments` tables in any
  database (Supabase or otherwise).
- Modify `packages/types/src/index.ts` or `packages/data-access/src/records.ts` to add the
  `Competency`, `UserCompetency`, `CompetencyAssessment`, or `*Record` types shown above.
- Modify `packages/data-access/src/repositories.ts` to add `competencies` /
  `userCompetencies` / `competencyAssessments` to `ZigRepositories` or either factory
  function.
- Implement `CompetencyService` — the class body in §5 is illustrative TypeScript for
  specification purposes and is not committed as a working source file anywhere in this
  repository.
- Implement the AI Coach, Scenario Engine, or Learning↔Operational Bridge integrations
  referenced in the vision doc — those are separate Tier 1 areas with their own design docs.
- Finalize the rollup-recomputation algorithm referenced in `recordAssessment` (§5) or the
  exact proficiency-level thresholds (§3.2/§4) — both are flagged as implementation-phase
  decisions, not settled here.
- Touch any existing file, run any migration, or change any UI.

Implementation may begin only after this doc is reviewed and the corresponding entities are
added to `packages/types/src/index.ts` and `packages/data-access/src/records.ts` as their
own documented step, per the doc-first methodology in `CLAUDE.md`.
