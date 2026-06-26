# Learning Runtime Data Flow

## Purpose
Traces how data moves through the Lesson → Lab → Assessment → Artifact → Portfolio →
Certification lifecycle, naming the real service call at each step so no step is left
implicit.

## Flow

```
Learner opens a lesson
  → LearningService reads the LearningPathRecord node for that lesson
  → Lesson content (text, Required Diagram/Workflow/Table/Visual Exercise) renders via
    Wave 2 components, each resolving its named asset against the relevant
    docs/learning/*_LIBRARY.md entry (static content, no service call)
  → LearningService marks the node `completed` on learner action
       emits LESSON_COMPLETED (see LEARNING_RUNTIME_EVENTS.md)

Learner enters a lab (scenario-backed exercise)
  → ScenarioService reads the simulated company's objects (assets, risks, controls,
    vendors — per company, per docs/scenarios/*.md)
  → <LabWorkspace /> renders Instructions/Scenario/Templates sections from this data
  → Learner submission is scored — scoring logic location is a Wave 4 decision, not
    resolved here
       emits LAB_COMPLETED

Learner takes an assessment
  → BLOCKED: no AssessmentService exists. Until this gap is resolved (Wave 5), this step
    has no real data flow — only labs (lab → ScenarioService) and lessons (lesson →
    LearningService) have a confirmed path.

Learner builds an artifact
  → <ArtifactBuilder /> reads the learner's own project data through the same services a
    live Zig user already calls: RiskService (Risk Register), ControlService (Control
    Matrix), AssetService (Asset Register), AuditService (Audit Plan), EvidenceService
    (evidence attached to controls)
  → Exported as PDF/Excel/Markdown — export mechanism is a Wave 6 implementation decision
       emits ARTIFACT_CREATED

Portfolio aggregates
  → <PortfolioViewer /> performs read-only fan-out across LearningService (completed
    lessons), ScenarioService (completed labs), the artifact list above, and (once it
    exists) AssessmentService
       emits PORTFOLIO_UPDATED

Certification computed
  → BLOCKED: no persistence layer exists for issued certificates. <CertificationCenter />
    can compute a *readiness score* today by reading the same data PortfolioViewer reads,
    but cannot issue or persist a certificate until this gap is resolved (Wave 10).
```

## Why two steps are marked BLOCKED instead of speculatively designed
Assessment scoring and certificate issuance both need durable, queryable state
(`AssessmentService`-backed records; certificate records). Inventing a shape for either
without confirming whether it extends `LearningService` or warrants a genuinely new
service would risk the same kind of duplicate-architecture problem this batch's hard
constraints exist to prevent. Both are named precisely as decisions for the next
documentation pass, not glossed over.

## What this wave does NOT do
Does not implement any of these flows in code. Does not decide whether `AssessmentService`
should be a new service or an extension of `LearningService` — flagged for explicit
decision before Wave 5 begins.
