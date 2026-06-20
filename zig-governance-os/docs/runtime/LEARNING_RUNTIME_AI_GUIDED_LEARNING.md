# Learning Runtime: AI-Guided Learning (Wave 8)

## Status today — read this before anything else
ZARA's coaching content today is **documentation only**: the five static personas and the
"Visual integration" capability contract defined in `docs/coaching/ZARA_PERSONA.md`. There
is no `CoachService` and no live AI generation pipeline anywhere in this codebase — confirmed
against `packages/services/src/*.ts`, which contains exactly `AssetService`, `AuditService`,
`ControlService`, `EvidenceService`, `FrameworkService`, `GovernanceService`,
`LearningService`, `ProjectService`, `RiskService`, `ScenarioService`, `TenantService`,
`UserService`. None of these is a coaching/AI-generation service.

This document specifies `<ZaraCoach />`'s **component contract** — its props, modes, and
capability interface — on the assumption that a future coaching backend will exist. It does
not pick, design, or imply an implementation for that backend (model choice, prompt
pipeline, inference hosting). That decision is explicitly named here as the prerequisite
gap, the same way `LEARNING_RUNTIME_PREPARATION.md` names the charting/diagramming library
choice as out of scope for its wave. Building `<ZaraCoach />` against this contract before
that backend exists would violate "never implement before documenting" — this spec exists
so that whenever the backend is built, the component contract it must satisfy is already
fixed.

## Mode-to-persona mapping
`ZARA_PERSONA.md` defines five personas: Instructor, Reviewer, Auditor, Hiring Manager,
Mentor. The task names six `<ZaraCoach />` modes. This section maps each of the six modes
onto the existing five personas — no new persona behavior is invented; "Tutor" and
"Interviewer"/"Career Coach" are renamings/compositions of personas that already exist
conceptually in `ZARA_PERSONA.md`.

| `<ZaraCoach />` mode | Maps to `ZARA_PERSONA.md` persona | When invoked (per `ZARA_PERSONA.md`) |
|---|---|---|
| Tutor | Instructor | Module quiz failure, knowledge check miss |
| Mentor | Mentor | Always present alongside another persona's critique |
| Auditor | Auditor | Lab submission involving a score, mapping, or target |
| Reviewer | Reviewer | Lab submission (structure vs. scoring rubric) |
| Interviewer | Hiring Manager | Executive Leadership lab delivery, mock interviews |
| Career Coach | Hiring Manager + Mentor (composed) | Mock interviews / career-readiness review — composes Hiring Manager's scoring with Mentor's constructive reframing, per `ZARA_PERSONA.md`'s rule that "Mentor is the one persona that may co-occur with any other" |

No mode introduces behavior beyond what `ZARA_PERSONA.md` already defines for its mapped
persona(s). "Career Coach" is the only composed mode, and it is composed using the explicit
co-occurrence rule already stated in `ZARA_PERSONA.md`, not a new rule invented here.

## Component contract

```typescript
type ZaraCoachMode =
  | "tutor"
  | "mentor"
  | "auditor"
  | "reviewer"
  | "interviewer"
  | "careerCoach";

interface ZaraCoachProps {
  mode: ZaraCoachMode;
  learnerId: string;
  tenantId: string;
  context: ZaraCoachContext;
  onFeedback?: (feedback: ZaraFeedback) => void;
}

// What ZARA is reviewing — mirrors ZARA_PERSONA.md's "Reviews" field per persona
type ZaraCoachContext =
  | { kind: "knowledgeCheck"; learningModuleId: string; attemptRef: string }
  | { kind: "labDeliverable"; scenarioId: string; submissionRef: string }
  | { kind: "scoredEntity"; entityType: "RiskAssessment" | "ControlMapping" | "BIA"; entityId: string }
  | { kind: "boardReportDelivery"; artifactId: string }
  | { kind: "mockInterview"; transcriptRef: string };
```

`ZaraCoachContext` is intentionally a discriminated union over entities that already exist
in confirmed services (`RiskService`, `ControlService`, `ScenarioService`, the artifact
shapes from `LEARNING_RUNTIME_ARTIFACT_BUILDER.md`) — per `ZARA_PERSONA.md`'s "Backing
service" section, ZARA reviews "the same entities ZARA reviews," never a separate
AI-generated record. This union is closed to those entity kinds; it does not introduce a new
storage shape.

## Capabilities

The task names six capabilities. Each maps directly onto a "Visual integration" capability
already defined in `ZARA_PERSONA.md`, or onto a persona's base review behavior. None are new.

| `<ZaraCoach />` capability | Source in `ZARA_PERSONA.md` |
|---|---|
| Explain diagrams | "Visual integration" → Explain diagrams |
| Walk workflows | "Visual integration" → Walk users through workflows |
| Review artifacts | Reviewer persona's base behavior ("Checks a deliverable's structure... against the lab's scoring rubric") + "Review matrices" visual capability |
| Provide feedback | All personas' base behavior, structured per `FEEDBACK_MODEL.md` (reason, supporting_data, confidence) |
| Generate hints | Instructor/Tutor persona's base behavior ("Teaches a concept the learner is missing, before re-attempting a task") |
| Conduct mock interviews | Hiring Manager persona's base behavior ("mock interviews") |

```typescript
interface ZaraFeedback {
  mode: ZaraCoachMode;
  reason: string;            // required per CLAUDE.md's explainability rule
  supportingData: {
    entityRef: string;       // the reviewed entity (RiskAssessment id, artifact id, etc.)
    visualAssetRef?: string; // named library asset, per ZARA_PERSONA.md "Visual integration"
                              // e.g. "HEATMAP_LIBRARY.md#risk-heatmap"
    learnerSubmissionRef?: string;
  };
  confidence: "low" | "medium" | "high"; // required, per CLAUDE.md's AI explainability rule
  recommendedAction?: string; // e.g. "Add a Risk Heatmap before resubmitting"
}
```

This shape is a direct restatement of `ZARA_PERSONA.md`'s explainability requirement
("every piece of ZARA feedback carries a reason, the supporting data it used, and... a
confidence level") and the "Generate visual recommendations" capability (naming a specific
library asset as the defect, not just describing it in prose).

## The prerequisite gap — `CoachService`

`<ZaraCoach />` cannot render real, dynamically-generated feedback until a backend exists
that can:
1. Accept a `ZaraCoachContext` and resolve it against the real entity (via the existing
   confirmed services).
2. Generate `ZaraFeedback` (reason, supporting data, confidence, recommended action) —
   whether via a hosted LLM call, a rules engine, or some other mechanism.
3. Persist or not persist that feedback — undecided, not specified here.

This document deliberately does **not** choose an implementation for step 2 (no model
choice, no prompt design, no inference architecture) — that decision is out of scope here,
exactly as `LEARNING_RUNTIME_PREPARATION.md` left the charting library choice out of scope
for Wave 2. The component contract above (`ZaraCoachProps`, `ZaraCoachContext`,
`ZaraFeedback`) is what that future `CoachService` must satisfy as its output contract,
regardless of which implementation is eventually chosen.

## What `<ZaraCoach />` can do today (static-only fallback)
Until `CoachService` exists, `<ZaraCoach />` may render statically from `ZARA_PERSONA.md`'s
persona definitions only: e.g. showing the persona's name, role description, and a
non-personalized walkthrough of a named diagram/workflow asset (pure rendering of static
`DIAGRAM_LIBRARY.md`/`WORKFLOW_LIBRARY.md` content, no learner-specific generation). This is
a legitimate non-empty state — it is real content (the persona definitions and library
assets already exist) — but it is not "AI-guided" in the generative sense implied by modes
like Auditor or Reviewer, which require evaluating the learner's specific submission. Any UI
surfacing this fallback must label it as static guidance, not live coaching, so the gap
remains honest rather than papered over.

## What this wave does NOT do
Does not implement `<ZaraCoach />` or any AI generation pipeline. Does not create
`CoachService`. Does not choose an LLM, inference architecture, or prompt design for the
coaching backend — named as the explicit prerequisite gap, deliberately left as an open
decision for whoever scopes that backend. Does not invent new persona behavior beyond what
`ZARA_PERSONA.md` already defines for its five personas.
