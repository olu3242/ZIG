# Learning Runtime: Portfolio Runtime (Wave 7)

## Purpose
Specifies `<PortfolioViewer />`, the read-only aggregation view that assembles a learner's
Projects, Artifacts, Skills, Certifications, and Career Readiness into a single portfolio
surface. Per `LEARNING_RUNTIME_STATE_MODEL.md`, Portfolio "fits" with no new state model —
it is a view, not a stored entity. This document defines what it reads, from where, and how
each section behaves when its backing data is partial or absent, consistent with the
"zero empty states... unless honestly documented as a gap" pattern used throughout this
repo.

## Backing services — confirmed inventory
Per `packages/services/src/*.ts`, the only services that exist are: `AssetService`,
`AuditService`, `ControlService`, `EvidenceService`, `FrameworkService`,
`GovernanceService`, `LearningService`, `ProjectService`, `RiskService`,
`ScenarioService`, `TenantService`, `UserService`. There is no `PortfolioService`,
`CertificationService`, `CoachService`, or `AnalyticsService`. `<PortfolioViewer />` is
implemented entirely as a client-side/BFF aggregation over the services above — it does not
require, and must not introduce, a new service.

## Component contract

```typescript
interface PortfolioViewerProps {
  learnerId: string;
  tenantId: string;
  sections?: PortfolioSectionKey[]; // defaults to all five, in display order below
}

type PortfolioSectionKey =
  | "projects"
  | "artifacts"
  | "skills"
  | "certifications"
  | "careerReadiness";

interface PortfolioViewModel {
  learnerId: string;
  generatedAt: string; // ISO timestamp, computed at read time — not persisted
  projects: PortfolioProjectsSection;
  artifacts: PortfolioArtifactsSection;
  skills: PortfolioSkillsSection;
  certifications: PortfolioCertificationsSection;
  careerReadiness: PortfolioCareerReadinessSection;
}
```

`<PortfolioViewer />` calls a single aggregation read (`getPortfolio(learnerId, tenantId)`)
that internally fans out to the services below in parallel. No section blocks another —
each resolves independently and reports its own status.

## Section 1 — Projects

**Status: fully backed.** `ProjectService` already models projects scoped to a tenant.

```typescript
interface PortfolioProjectsSection {
  status: "ready";
  projects: Array<{
    projectId: string;
    name: string;
    createdAt: string;
    frameworkIds: string[]; // via ProjectFrameworkRecord
    lastActivityAt: string;
  }>;
}
```

**Data source:** `ProjectService.findByLearner` (or equivalent tenant-scoped list call) —
reads `ProjectRecord` rows owned by or assigned to `learnerId` within `tenantId`. No
derivation logic beyond a straight list — same shape a live Zig user's project list already
returns.

## Section 2 — Artifacts

**Status: fully backed, defined elsewhere.** Per `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`
(Wave 6, written in parallel with this document), `<ArtifactBuilder />` already defines the
artifact list shape, generation services (`RiskService`, `ControlService`, `AssetService`,
`AuditService`, `EvidenceService`), and export metadata. This document does not redefine
that shape — `<PortfolioViewer />` simply requests the same learner's artifact list from
whatever read function `LEARNING_RUNTIME_ARTIFACT_BUILDER.md` exposes for listing
previously-generated artifacts, and renders it under the "Artifacts" section unchanged.

```typescript
interface PortfolioArtifactsSection {
  status: "ready";
  artifacts: ArtifactSummary[]; // ArtifactSummary type defined in LEARNING_RUNTIME_ARTIFACT_BUILDER.md
}
```

If `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`'s artifact list read is itself unavailable (e.g.
no artifacts generated yet), this section's `status` becomes `"empty"` with a documented
empty-state action ("Generate your first artifact" → links into `<ArtifactBuilder />`), not
a blank panel — this is the demo-data/next-step pattern CLAUDE.md's "Zero empty states"
rule requires, and it is a legitimate empty state (no data yet), not a gap (missing
backend).

## Section 3 — Skills

**Status: fully backed, derived.** No `SkillRecord` or skills table exists anywhere in this
codebase. Skills are **derived**, not stored — computed at read time from
`LearningService`'s completed `LearningPathRecord`/`LearningModuleRecord` nodes.

### Derivation rule
Each `LearningModuleRecord` (per `docs/learning/MASTER_CURRICULUM_MAP.md`'s track/module
structure) is tagged, in its static curriculum metadata, with one or more skill labels (e.g.
a Risk Track module on RTO/RPO derivation tags `"Business Impact Analysis"`). The skill
derivation rule is:

```
For each learner:
  1. Read all LearningModuleRecord rows the learner has completed, via LearningService,
     across every LearningPathRecord (track) the learner has started.
  2. For each completed module, look up its static skill-tag list (curriculum metadata —
     not stored on the record itself; resolved against docs/learning/<track>.md's module
     definitions, the same way Wave 2 components resolve asset references).
  3. A skill appears in the Skills section once that skill's tag has been earned by at
     least one completed module. A skill's "depth" (Introduced / Practiced / Demonstrated)
     is the count of distinct completed modules tagging that skill, bucketed:
       1 module   → Introduced
       2-3 modules → Practiced
       4+ modules  → Demonstrated
  4. No partial credit for an in-progress (not-completed) module — only `completed` nodes
     count, per the state model's existing `started`/`completed` fields on
     LearningPathRecord.
```

```typescript
interface PortfolioSkillsSection {
  status: "ready" | "empty";
  skills: Array<{
    skillTag: string;
    depth: "Introduced" | "Practiced" | "Demonstrated";
    earnedFromModules: string[]; // LearningModuleRecord ids contributing to this skill
  }>;
}
```

This is a pure derivation over existing `LearningService` data — no new service, no new
stored field. The skill-tag-to-module mapping is a curriculum metadata concern (lives beside
the curriculum docs in `docs/learning/`), not a runtime data model change.

## Section 4 — Certifications

**Status: gap, partial.** Per `LEARNING_RUNTIME_STATE_MODEL.md`, there is no certificate
persistence layer (`issuedAt`, `certificateId`, `trackId`, `competencyScores` per learner —
"None" exists). `<PortfolioViewer />` cannot show issued certificates today because none can
be issued or stored.

```typescript
interface PortfolioCertificationsSection {
  status: "gap";
  gapReason:
    "No certificate persistence layer exists. See LEARNING_RUNTIME_CERTIFICATION_ENGINE.md " +
    "(Wave 10) for the blocked Certificate Issuance design.";
  certifications: []; // always empty today — not a "no certifications yet" empty state,
                       // a documented backend gap
}
```

This section must render an honest, labeled gap message ("Certifications are not yet
available — certificate issuance requires a persistence layer that does not exist yet"),
distinct in tone and content from a normal empty state ("You haven't earned a certificate
yet — start a track"). Per the repo's "zero empty states... unless honestly documented as a
gap" pattern, this is the documented-gap branch, not the empty-state branch.

## Section 5 — Career Readiness

**Status: gap, partial.** Career Readiness depends on `<CareerMode />`
(`LEARNING_RUNTIME_CAREER_OS.md`, Wave 9), which has no backing service or data model at
all today — it is pre-PRD-justification per CLAUDE.md's module-addition rule. There is no
`CareerService`/`PortfolioService`/`AnalyticsService` to compute a readiness score against
roles.

```typescript
interface PortfolioCareerReadinessSection {
  status: "gap";
  gapReason:
    "No CareerMode service or data model exists. See LEARNING_RUNTIME_CAREER_OS.md " +
    "(Wave 9) — pre-PRD-justification design only.";
  readiness: null;
}
```

### What Career Readiness *could* read once unblocked (forward note only)
If `<CareerMode />` is ever PRD-justified and built, Career Readiness here would likely
combine: Skills (Section 3, already derivable), Certification competency scores (Section 4,
blocked), and role-specific benchmarks (defined only inside `LEARNING_RUNTIME_CAREER_OS.md`
if that wave is approved). This document does not define that combination — it only notes
that Sections 3 and 4 are the dependencies Career Readiness would draw from, so the next
session doesn't have to re-derive that linkage from scratch.

## Rendering rule summary

| Section | Status today | Behavior |
|---|---|---|
| Projects | ready | Render list from `ProjectService` |
| Artifacts | ready/empty | Render from `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`'s list read; empty state if none generated |
| Skills | ready/empty | Derive from completed `LearningService` modules per the rule above |
| Certifications | gap | Render labeled gap message, not an empty state |
| Career Readiness | gap | Render labeled gap message, not an empty state |

`<PortfolioViewer />` must never render a blank panel for any section — every section
renders exactly one of: real data, a legitimate empty state with a next-step action, or a
labeled gap message naming the blocking document.

## What this wave does NOT do
Does not implement `<PortfolioViewer />` or any aggregation read function. Does not create
`PortfolioService`, `CertificationService`, `CoachService`, or `CareerService` — confirmed
none exist and none are created here. Does not define the skill-tag taxonomy itself (which
tags belong to which curriculum modules) — that is curriculum-authoring work in
`docs/learning/`, out of scope for this runtime spec. Does not resolve the Certifications or
Career Readiness gaps — both remain explicitly blocked pending Wave 9 and Wave 10
decisions.
