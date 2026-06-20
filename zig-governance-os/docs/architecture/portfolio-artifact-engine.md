# Portfolio Artifact Engine — Design Doc

## Purpose
Implementation-ready design for Area 3 of `docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md`
(Portfolio Artifact Engine), Tier 1 priority #3. This document specifies the three new
entities the vision doc named (`portfolio_artifacts`, `artifact_templates`,
`artifact_versions`), the service that persists/retrieves them, and how they connect to
work already documented in `docs/runtime/LEARNING_RUNTIME_ARTIFACT_BUILDER.md`,
`docs/learning/TABLE_LIBRARY.md`, and `docs/learning/WORKFLOW_LIBRARY.md`.

This document does **not** redefine `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`'s per-artifact-type
data-source mapping table. That table (Risk Register → `RiskService`, Asset Register →
`AssetService`, Control Matrix → `ControlService`, Audit Plan → gap, Vendor Assessment →
`AssetService` stand-in, BIA → gap/template-only, Board Report → `GovernanceService` +
reads) is the single source of truth for "where does artifact content come from." This
document's job starts one step later: once that content has been assembled, where does it
get **persisted** so a learner has a portfolio over time, and how does re-generation work.

## Why this entity set exists (not a parallel chain)
`docs/CLAUDE.md`'s hard rule: "never create a disconnected workflow or an orphaned entity
outside the Universal Governance Model" (`Organization → Project → Asset → Risk → Control
→ Framework Requirement → Evidence → Task → Report`).

`portfolio_artifacts` is not a new link in that chain — it is a **learner-side output
record** that *references* real chain data, the same way `GovernanceScoreRecord` and
`RecommendationRecord` already reference chain data without becoming new chain links:

```
Organization → Project → Asset → Risk → Control → Evidence  (the real governance chain)
                              ↑        ↑        ↑        ↑
                              |        |        |        |
                portfolio_artifacts (learnerId, projectId, sourceArtifactType)
```

A `portfolio_artifacts` row always carries a `projectId` (real `ProjectRecord`) and a
`learnerId` (real `UserRecord.id`). It has no children that are themselves chain entities —
it is a leaf, exactly like a generated report. This mirrors how `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`
already treats artifacts as "a rendered view over an existing service's reads," not a new
data source. Persisting that rendered view does not change what produced it.

## Entity definitions

All three follow the existing `*Record` pattern: a TypeScript domain interface in
`packages/types/src/index.ts` extended with `tenantId`/`createdAt`/`updatedAt` to form the
`*Record` type in `packages/data-access/src/records.ts`, exactly as `RiskRecord`,
`ControlRecord`, etc. are defined today (`export type XRecord = X & { createdAt: Date;
updatedAt: Date }`, with `tenantId` added only where the base domain interface doesn't
already declare it).

### `portfolio_artifacts`

```typescript
// packages/types/src/index.ts
export type PortfolioArtifactType =
  | "riskRegister"
  | "assetRegister"
  | "controlMatrix"
  | "auditPlan"
  | "vendorAssessment"
  | "bia"
  | "boardReport";

export type PortfolioArtifactExportFormat = "pdf" | "excel" | "markdown";

export type PortfolioArtifactStatus = "draft" | "generated" | "exported" | "archived";

export interface PortfolioArtifact {
  id: string;
  tenantId: string;
  learnerId: string;          // references User.id (the learner who owns this portfolio item)
  projectId: string;          // references Project.id — the real/scenario project the artifact was generated from
  scenarioRunId?: string;     // references ScenarioRun.id when generated from a scenario rather than a live project
  artifactType: PortfolioArtifactType;
  templateId?: string;        // references ArtifactTemplate.id, if a template was used to structure the output
  currentVersionId: string;   // references ArtifactVersion.id — the version currently considered "the" artifact
  exportFormat: PortfolioArtifactExportFormat;
  status: PortfolioArtifactStatus;
  title: string;              // learner-facing label, e.g. "Risk Register — CloudPay SOC 2 Readiness"
  createdAt: Date;
  updatedAt: Date;
}
```

### `artifact_versions`

```typescript
export interface ArtifactVersion {
  id: string;
  tenantId: string;
  portfolioArtifactId: string; // references PortfolioArtifact.id — every version belongs to exactly one artifact
  versionNumber: number;       // monotonically increasing per portfolioArtifactId, starting at 1
  content: Record<string, unknown>; // the typed artifact data object (per LEARNING_RUNTIME_ARTIFACT_BUILDER.md's
                                     // "single typed object per artifactType, independent of export format")
  contentRef?: string;          // storage pointer (e.g. object storage key) when content is too large to inline;
                                 // exactly one of `content` / `contentRef` is populated
  sourceSnapshot: {
    projectId: string;
    capturedAt: Date;
    recordCounts: Record<string, number>; // e.g. { risks: 12, controls: 8 } — what was read to build this version
  };
  generationReason: "initial" | "regeneration" | "feedback_revision" | "manual_edit";
  feedbackNoteRef?: string;     // free-text or link to coach/instructor feedback that prompted this version, if any
  exportFormat: PortfolioArtifactExportFormat;
  createdByUserId?: string;     // usually the learner; may be a coach/system process for AI-assisted regeneration
  createdAt: Date;
  updatedAt: Date;
}
```

### `artifact_templates`

```typescript
export interface ArtifactTemplate {
  id: string;
  tenantId: string;
  artifactType: PortfolioArtifactType;
  name: string;
  description: string;
  sectionSchema: Array<{
    key: string;            // e.g. "executiveSummary", "riskTable", "treatmentPlan"
    label: string;
    contentSource: "static" | "service_read" | "learner_input"; // see "Relationship to existing libraries" below
    staticContentRef?: string; // path into docs/learning content (TABLE_LIBRARY.md / WORKFLOW_LIBRARY.md entry id)
                                 // when contentSource is "static"
  }>;
  isDefault: boolean;       // exactly one default template per artifactType
  createdAt: Date;
  updatedAt: Date;
}
```

`ArtifactTemplate` has **no** `learnerId` or `projectId` — templates are tenant-level
(or system-level, `tenantId` nullable at the platform tier) configuration, not learner
output. This is the same shape distinction already drawn elsewhere in the codebase between
`FrameworkRecord` (shared, tenant-or-system-level) and `RiskRecord` (project/learner-level).

### `*Record` additions (`packages/data-access/src/records.ts`)

```typescript
export type PortfolioArtifactRecord = PortfolioArtifact & { createdAt: Date; updatedAt: Date };
export type ArtifactVersionRecord = ArtifactVersion & { createdAt: Date; updatedAt: Date };
export type ArtifactTemplateRecord = ArtifactTemplate & { createdAt: Date; updatedAt: Date };
```

(`tenantId` is already declared on the base interfaces above, matching how `ControlRecord`/
`RiskRecord` declare `tenantId` directly on `Control`/`Risk` rather than adding it via the
record alias — see `packages/types/src/index.ts` lines 139–180.)

### Repository wiring (`packages/data-access/src/repositories.ts`)

```typescript
portfolioArtifacts: TenantRepository<PortfolioArtifactRecord>;
artifactVersions: TenantRepository<ArtifactVersionRecord>;
artifactTemplates: TenantRepository<ArtifactTemplateRecord>;
```

Constructed identically to every existing entry in `ZigRepositories` — `new
TenantRepository("portfolio_artifacts", new SupabaseRestAdapter<PortfolioArtifactRecord>(config),
auditEvents)` (and the `InMemoryDatabaseAdapter` equivalent for tests/dev), table names
`portfolio_artifacts`, `artifact_versions`, `artifact_templates`.

## Versioning model

One `portfolio_artifacts` row per (learner, project, artifactType) — a learner does not get
a new `portfolio_artifacts` row each time they regenerate their Risk Register for the same
project; they get a new `artifact_versions` row, and `portfolio_artifacts.currentVersionId`
is repointed.

```
portfolio_artifacts (id: pa_1, learnerId: u_42, projectId: p_7, artifactType: "riskRegister",
                      currentVersionId: av_3)
        │
        ├── artifact_versions (id: av_1, versionNumber: 1, generationReason: "initial")
        ├── artifact_versions (id: av_2, versionNumber: 2, generationReason: "feedback_revision")
        └── artifact_versions (id: av_3, versionNumber: 3, generationReason: "regeneration")  ← current
```

Rules:
- `versionNumber` is assigned by the service, not the caller, as `max(existing) + 1` scoped
  to `portfolioArtifactId`.
- Creating a new version never deletes a prior version — full history is retained so a
  learner (or an instructor reviewing their portfolio) can see improvement over time, which
  is the explicit motivating case from the vision doc ("a learner improves their Risk
  Register after feedback").
- `portfolio_artifacts.status` transitions independently of version count: `draft` (no
  version yet / mid-generation), `generated` (has at least one version), `exported` (learner
  downloaded a version in `exportFormat`), `archived` (learner or instructor closed it out,
  e.g. after certification).
- A second `portfolio_artifacts` row is created (not a new version) if the learner generates
  the *same* artifact type from a *different* project or scenario run — versions track
  iteration on one piece of work, not a learner's entire history of that artifact type.

## `PortfolioArtifactService` spec

Follows the exact constructor/method pattern of `RiskService` and `ControlService`: extend
`BaseService<PortfolioArtifactRecord>` for the primary CRUD surface (inherited `create`,
`update`, `delete`, `findById`, `findMany`, `search`), inject the version repository the
same way `RiskService` injects `assessmentRepository` and `ControlService` injects
`mappingRepository`, and inject the existing per-artifact-type services so generation can
delegate to them rather than re-reading the database directly.

```typescript
// packages/services/src/PortfolioArtifactService.ts
import { BaseService } from "./BaseService";
import type {
  ArtifactTemplateRecord,
  ArtifactVersionRecord,
  PortfolioArtifactRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";
import type { AssetService } from "./AssetService";
import type { AuditService } from "./AuditService";
import type { ControlService } from "./ControlService";
import type { EvidenceService } from "./EvidenceService";
import type { GovernanceService } from "./GovernanceService";
import type { RiskService } from "./RiskService";

export class PortfolioArtifactService extends BaseService<PortfolioArtifactRecord> {
  constructor(
    portfolioArtifactRepository: TenantRepository<PortfolioArtifactRecord>,
    private readonly versionRepository: TenantRepository<ArtifactVersionRecord>,
    private readonly templateRepository: TenantRepository<ArtifactTemplateRecord>,
    // delegated reads — per-artifact-type source is LEARNING_RUNTIME_ARTIFACT_BUILDER.md's
    // mapping table, not redefined here
    private readonly riskService: RiskService,
    private readonly controlService: ControlService,
    private readonly assetService: AssetService,
    private readonly evidenceService: EvidenceService,
    private readonly auditService: AuditService,
    private readonly governanceService: GovernanceService,
  ) {
    super(portfolioArtifactRepository);
  }

  /**
   * Creates a portfolio_artifacts row plus its first artifact_versions row, by delegating
   * the content read to whichever service LEARNING_RUNTIME_ARTIFACT_BUILDER.md's mapping
   * table names for this artifactType (e.g. riskRegister -> riskService.findMany +
   * riskService.findAssessments per-risk). Does not contain artifact-type-specific
   * assembly logic itself — that logic is a separate, smaller per-type builder function
   * documented in LEARNING_RUNTIME_ARTIFACT_BUILDER.md and implemented alongside this
   * service, not duplicated here.
   */
  createFromProject(
    context: TenantContext,
    params: {
      learnerId: string;
      projectId: string;
      scenarioRunId?: string;
      artifactType: PortfolioArtifactRecord["artifactType"];
      exportFormat: PortfolioArtifactRecord["exportFormat"];
      templateId?: string;
    },
  ): Promise<{ artifact: PortfolioArtifactRecord; version: ArtifactVersionRecord }>;

  /** All artifacts belonging to one learner, optionally filtered by project or type. */
  listForLearner(
    context: TenantContext,
    learnerId: string,
    filters?: { projectId?: string; artifactType?: PortfolioArtifactRecord["artifactType"] },
  ): Promise<PortfolioArtifactRecord[]>;

  /** All versions of one artifact, newest first. */
  listVersions(context: TenantContext, portfolioArtifactId: string): Promise<ArtifactVersionRecord[]>;

  /**
   * Re-runs the same data-source reads used by createFromProject against current project
   * state, writes a new artifact_versions row with versionNumber = max+1, repoints
   * portfolio_artifacts.currentVersionId, and sets generationReason. Does not touch
   * earlier versions.
   */
  createNewVersion(
    context: TenantContext,
    portfolioArtifactId: string,
    params: {
      generationReason: ArtifactVersionRecord["generationReason"];
      feedbackNoteRef?: string;
      createdByUserId?: string;
    },
  ): Promise<ArtifactVersionRecord>;

  /** Marks a version as the artifact's current version without creating a new one
   *  (e.g. a learner reverts to an earlier draft). */
  setCurrentVersion(
    context: TenantContext,
    portfolioArtifactId: string,
    versionId: string,
  ): Promise<PortfolioArtifactRecord | null>;

  /** Looks up the applicable template for an artifactType, defaulting to the tenant's
   *  isDefault template when templateId is not given. */
  resolveTemplate(
    context: TenantContext,
    artifactType: PortfolioArtifactRecord["artifactType"],
    templateId?: string,
  ): Promise<ArtifactTemplateRecord | null>;
}
```

Notes consistent with existing service conventions:
- Every method takes `TenantContext` first, exactly like `BaseService`/`RiskService`/
  `ControlService` — tenant isolation is enforced by `TenantRepository<T>` underneath, this
  service adds no bypass.
- `learnerId` is **not** the tenant boundary — it is an additional application-level filter
  applied via `repository.findMany(context, { filters: { learnerId } })`, the same way
  `RiskService.findAssessments` filters by `riskId` on top of tenant scoping. A learner's
  artifacts are still tenant-scoped rows; `learnerId` narrows further within the tenant.
- This service does not call `AuditService.recordAction` itself in this design pass — same
  open question as every other service; out of scope here, not decided.

## Relationship to `artifact_templates`, `TABLE_LIBRARY.md`, `WORKFLOW_LIBRARY.md`, and `docs/learning/assets/*`

`artifact_templates` is **not** a new content library and does not duplicate
`TABLE_LIBRARY.md` / `WORKFLOW_LIBRARY.md`. Those two files catalog static teaching content
(tables and workflows used *inside lesson pages*, per `VISUAL_LEARNING_STANDARD.md`) — they
are content, not runtime structure, and this design doc does not touch them.

`artifact_templates` is a **runtime-facing wrapper**: it tells the
`PortfolioArtifactService` which sections a given `artifactType` should have and, for any
section that should reuse already-documented static content (e.g. a Board Report's
narrative framing borrowing the structure of the "Board Reporting Flow" workflow in
`WORKFLOW_LIBRARY.md`, or a BIA artifact's section layout following the "BIA Workflow"
steps already documented there), points at that existing entry via `staticContentRef`
rather than re-authoring it. A template's `sectionSchema` entry is one of:

| `contentSource` | Meaning | Example |
|---|---|---|
| `static` | Section content is pulled from existing `docs/learning/` content via `staticContentRef`, not generated per-learner | BIA section ordering pulled from `WORKFLOW_LIBRARY.md`'s "BIA Workflow" steps |
| `service_read` | Section content comes from a live service read, per `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`'s mapping table | Risk Register's risk table from `RiskService.findMany` |
| `learner_input` | Section has no backing data source (the documented gaps: Audit Plan, BIA detail fields) and is filled in manually by the learner | BIA RTO/RPO values, per the documented gap in `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` |

This keeps the gap analysis already done in `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` (Audit
Plan and BIA have no real backing service) intact and visible at the template level instead
of silently inventing fake data sources for them.

`docs/learning/assets/*` does not exist yet in this repo (`docs/learning/assets/bcm/
BIA_WORKFLOW.md`, referenced by `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`, is itself a forward
reference to content not yet written) — `artifact_templates.sectionSchema[].staticContentRef`
is defined to point there once it exists, but this design doc does not create that content
and does not block on it; `service_read` and `learner_input` sections work independently of
whether `static` sections have a resolved target yet.

## How this avoids orphan entities — summary

| Entity | Anchors to real chain via | Not a new chain link because |
|---|---|---|
| `portfolio_artifacts` | `projectId` → `Project`, `learnerId` → `User` | Leaf output record, same category as `GovernanceScoreRecord`/`RecommendationRecord` |
| `artifact_versions` | `portfolioArtifactId` → `portfolio_artifacts` only | Strictly subordinate to one artifact; never referenced by chain entities |
| `artifact_templates` | `artifactType` (enum, not a foreign key into the chain) | Tenant/system-level configuration, analogous to `FrameworkRecord` — describes structure, holds no learner or project data |

No chain entity (`Asset`, `Risk`, `Control`, `Evidence`, `Task`) gains a foreign key pointing
*into* these three tables. Data flows one direction only: chain → artifact content → stored
version. This matches the precedent `GovernanceScoreRecord` and `RecommendationRecord`
already set in `packages/data-access/src/records.ts`.

## What this wave does NOT do
- Does not implement `PortfolioArtifactService`, the repositories, or the Supabase schema —
  this is a design document only, per "never implement before documenting."
- Does not redefine or modify `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`'s per-artifact-type
  data-source mapping table; this doc only adds where the output of that mapping gets
  persisted.
- Does not resolve the Audit Plan or BIA data-source gaps already flagged in
  `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` — those remain `learner_input`-only sections until
  an audit-engagement model or BIA data model is documented elsewhere.
- Does not build or populate `docs/learning/assets/bcm/BIA_WORKFLOW.md` or any other
  `staticContentRef` target — those are referenced, not authored, here.
- Does not implement export rendering (PDF/Excel/Markdown generation) — `exportFormat` is
  stored as metadata on both `portfolio_artifacts` and `artifact_versions`; which library
  renders it is explicitly out of scope, same deferral `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`
  already made.
- Does not wire this engine into the AI Learning Coach, competency scoring, or
  certification gating (#1, #7, #14 in the vision doc's gap table) — those are separate,
  later Tier 1/Tier 2 items that will *read* `portfolio_artifacts` once it exists, not
  something this document needs to design now.
- Does not decide whether `PortfolioArtifactService` calls `AuditService.recordAction` for
  activity logging — left open, consistent with how other services currently handle it.
