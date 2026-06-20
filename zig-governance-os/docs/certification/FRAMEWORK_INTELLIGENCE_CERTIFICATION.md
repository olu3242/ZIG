# Framework Intelligence Certification

**Date:** 2026-06-20
**Scope:** Phase 11B — build the compliance intelligence layer (coverage, gaps, mappings,
roadmaps, evidence reuse) over the framework schema that already exists in the database
but had almost no application-layer wiring.

## Audit performed before writing any code

Per the user's 8-step audit rule, an Explore agent inventoried the schema/types/
repositories/services before any table/service/route was created. Findings:

- `frameworks`, `framework_versions`, `framework_domains`, `framework_controls`,
  `framework_requirements`, `framework_mappings`, `framework_crosswalks`,
  `control_mappings`, `project_frameworks`, `gap_assessments`, `control_evidence`,
  `evidence_reviews` all already exist as tables with RLS + `updated_at` triggers applied
  (`202606180005_batch_*.sql`).
- Of these, only `frameworks`, `control_mappings`, `project_frameworks`,
  `control_evidence`, `evidence_reviews` had TypeScript interfaces, record types, and
  registered repositories. `framework_domains`, `framework_controls`,
  `framework_requirements`, `framework_mappings`, `framework_crosswalks` had **zero**
  TypeScript bindings — the tables existed only as unused schema.
- `GovernanceService.calculateScore` already computes one coarse `frameworkCoverage`
  input (% of a project's controls assigned to its framework), and
  `GovernanceService.runHealthAdvisor` already turns governance-score gaps into persisted
  `Recommendation` rows. Neither reads the framework_controls catalogue at the
  per-control level.
- No table named exactly `framework_coverage`, `framework_gaps`, `framework_roadmaps`, or
  `evidence_framework_links` exists, and none should be created: per the same
  compute-at-read-time precedent set by `CertificationEligibilityService` and
  `GovernanceService.calculateScore` itself, coverage/gaps/roadmaps/evidence-reuse are
  views over existing data, not new facts that need persisting.

## What this closes

Wires the five already-existing-but-unused framework catalogue tables into the
application layer, then adds a derived intelligence layer on top — without creating a
single new table, and without duplicating `ControlService.findMappings`,
`EvidenceService.findLinksForControl`/`findReviews`, or
`GovernanceService.calculateScore`'s existing aggregate input.

## Code changes

- **`packages/types/src/index.ts`** — added `FrameworkDomain`, `FrameworkControl`,
  `FrameworkRequirement`, `FrameworkMapping`, `FrameworkCrosswalk` interfaces, matching the
  existing migration's column shapes exactly.
- **`packages/data-access/src/records.ts`** / **`repositories.ts`** — added the matching
  Record types and registered `frameworkDomains`, `frameworkControls`,
  `frameworkRequirements`, `frameworkMappings`, `frameworkCrosswalks` as
  `TenantRepository` entries against both adapters. No migration needed — every table and
  its RLS/trigger already existed.
- **`packages/services/src/frameworkIntelligence.ts`** (new) — a shared pure-function
  module (mirroring `certificationEligibility.ts`'s pattern, since this codebase never
  composes services):
  - `computeFrameworkCoverage` — matches each `framework_controls` row to a project
    `Control` by `controlCode`/`controlId`, classifies it implemented / partial / missing
    based on status + approved `control_evidence`/`evidence_reviews` links.
  - `computeFrameworkGaps` — turns non-implemented coverage rows into an explainable gap
    list (kind, severity, a concrete recommendation referencing the control code).
  - `computeCrosswalk` — looks up `framework_mappings` rows from one source control to
    every mapped target control across frameworks.
  - `computeRoadmap` — for a target framework, marks which controls are already reachable
    via a mapping from an already-implemented control in the current framework
    (near-zero effort) vs. which need net-new implementation (heuristic effort hours).
  - `computeEvidenceReuse` — for each `control_evidence` link, finds every other
    framework control the same evidence could satisfy via `framework_mappings`.
- **Five new services**, each reading its own repositories directly (no service-to-service
  injection, consistent with every other entry in `factory.ts`):
  `FrameworkCoverageService`, `FrameworkGapService`, `FrameworkMappingService`,
  `FrameworkRoadmapService`, `EvidenceReuseService`.
- **`packages/services/src/CoachService.ts`** — extended, not duplicated: added
  `frameworkControlRepository`/`controlEvidenceRepository`/`evidenceReviewRepository` to
  the existing constructor and one new private method,
  `tryGenerateFrameworkGapReply`, called from the existing `generateReply` pipeline as a
  4th branch (after the existing open-risk and control-coverage branches, before the
  healthy fallback). It reuses `computeFrameworkCoverage`/`computeFrameworkGaps` from the
  same shared module the standalone services call — no second agent architecture.
- **`packages/services/src/factory.ts`** / **`index.ts`** — registered the five new
  services and the extended `CoachService` constructor; exported the new module and
  services (also exported `AssessmentService`/`PortfolioService`/`CoachService`, which
  were missing from `index.ts` since the Portfolio/Coach phases).
- **UI**: `apps/web/app/projects/[id]/page.tsx` gained a "Framework Intelligence" section
  (coverage %, health score, reusable-evidence count, and a gap table with
  recommendations) below the existing Health Advisor/Score History sections — extending
  the existing Project Detail page rather than adding a new module.

## Verification performed

- **`npm run typecheck` (data-access, services workspaces)** — PASS, zero errors.
- **`npm run build` (root)** — PASS for `web` and `admin`.
- **Unit test added:**
  `packages/services/src/tests/framework-intelligence-workflow.test.ts`. Exercises: a
  project with 2 ISO 27001 framework controls, one implemented + evidence-approved (counts
  as `implemented`), one implemented but with no evidence link (counts as `partial`) —
  asserts 50% coverage; asserts the partial control surfaces as exactly 1 gap with a
  recommendation naming its control code; asserts a crosswalk from the evidenced ISO
  control to a mapped SOC 2 control; asserts a roadmap to SOC 2 shows that mapped control
  as already reachable (0 remaining); asserts the linked evidence's reuse count and
  reusable target list; asserts the AI Coach's own welcome reply (not a separate gap
  endpoint) surfaces the framework gap when risk/control health is otherwise clean; asserts
  tenant isolation. Run via
  `npx tsx src/tests/framework-intelligence-workflow.test.ts` — **exited 0**.
- **Regression check:** all 16 prior workflow tests in `packages/services/src/tests/`
  re-run — all **exited 0**.

## Success criteria status

| Criterion | Status |
|---|---|
| Coverage Operational | Met — per-control breakdown, not just GovernanceService's aggregate |
| Gap Analysis Operational | Met — explainable, computed, not persisted as a new fact |
| Mappings/Crosswalks Operational | Met — over the existing `framework_mappings` table |
| Roadmaps Operational | Met — computed view, no new table |
| Evidence Reuse Operational | Met — computed view over `control_evidence` |
| AI Guidance Operational | Met — extended `CoachService`, no duplicate agent |
| Typecheck Pass | Met |
| Build Pass | Met |
| Tests Pass | Met |

## What is honestly NOT closed in this pass

- **No seed data exists for the framework_controls/framework_domains/framework_mappings
  catalogue beyond what this phase's own test creates.** Only 3 of the 11 frameworks the
  user named (ISO 27001, SOC 2, NIST CSF) have any real catalogue rows anywhere in the
  codebase prior to this change, and this phase does not seed COBIT, COSO, CCPA, or the
  rest — populating an accurate, citable control catalogue per framework is a content
  task, not a code task, and is out of scope here.
- **No standalone "Framework Intelligence Dashboard" or export reports** (Coverage Report,
  Gap Analysis Report, Crosswalk Report, Roadmap Report, Evidence Reuse Report as
  separate downloadable artifacts) were built. The Project Detail page surfaces the same
  data inline; `ExportsService` was not extended in this pass.
- **`gap_assessments` remains unwired** — it stores a different, coarser shape
  (`gap_type`/`expected_count`/`missing_count`) from `GapAssessmentEngine` in
  `packages/gaps/src/`, and this phase does not attempt to reconcile or use it, to avoid
  guessing at a relationship that isn't documented anywhere.
