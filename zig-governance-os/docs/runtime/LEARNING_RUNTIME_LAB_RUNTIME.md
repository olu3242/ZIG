# Learning Runtime: Lab Runtime (`<LabWorkspace />`)

## Purpose
Implementation-ready spec for the component that hosts an AI-guided lab end to end:
reading the lab's instructions and scenario, letting the learner build a deliverable from a
template, submitting it, triggering AI review, and surfacing scored feedback. This is the
runtime surface for every `docs/learning/labs/*.md` file.

## Status
The UI/props contract below is fully specified and implementation-ready. **Submission
persistence (started/submitted/score/feedback state) is blocked** on the same decision
`docs/runtime/LEARNING_RUNTIME_STATE_MODEL.md` already flagged: no record shape exists for
a learner's scored attempt against a lab. That document recommends labs share a state shape
with assessments if/when an `AssessmentService` is approved as a new service. This spec does
not re-litigate that decision — it is referenced here as a hard dependency for the
Submission and Scoring sections only. The Instructions, Scenario, Templates, and AI Review
sections have real backing today (static content + `ScenarioService`) and are not blocked.

## Component sections

### 1. Instructions
Static content rendered directly from the lab's markdown file (`docs/learning/labs/*.md`).
No service call — the lab file is the source of truth and is either bundled at build time
or fetched as raw markdown/MDX and parsed client-side.

| Field | Source | Notes |
|---|---|---|
| Title, objective | Lab file frontmatter/H1 | Static |
| Scoring Rubric | Lab file "Scoring Rubric" section | Rendered verbatim; also passed to AI Review (see below) |
| AI Feedback Rules | Lab file "AI Feedback Rules" section | Names which 1-2 ZARA personas apply — drives the AI Review section's persona selection |
| Estimated time, track, prerequisite lessons | Lab file frontmatter | Static |

### 2. Scenario
Backed by `ScenarioService` (`packages/services/src/ScenarioService.ts`). Confirmed real
methods:

```typescript
class ScenarioService extends BaseService<ScenarioRecord> {
  // inherited from BaseService: findById, findMany, create, update, delete (see BaseService.ts)
  findRuns(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord[]>;
}
```

`<LabWorkspace />` resolves the lab's named scenario (each lab file names exactly one
scenario under a "Scenario" or "Simulated Company" heading) to a `ScenarioRecord` via
`ScenarioService.findById`, and — if the learner has attempted this lab/scenario combination
before — fetches prior `ScenarioRunRecord`s via `findRuns(context, scenarioId)` to let the
learner resume or review a past run's scenario state. Note: `ScenarioRunRecord` models a run
of the scenario itself (the simulated company's state), not the learner's lab submission —
do not conflate the two. The scenario's visual sections (org chart, architecture diagram,
risk/compliance maps) render via the existing `<ScenarioViewer />` composite component
(`docs/learning/INTERACTIVE_RENDERING_SPEC.md`), embedded read-only inside `LabWorkspace`.

### 3. Templates
Static, versioned template content per lab — not service-backed. Each lab names its target
artifact type (Risk Register, Control Matrix, BIA, etc. — see
`docs/runtime/LEARNING_RUNTIME_ARTIFACT_BUILDER.md` for the artifact specs themselves). The
template is a blank/skeleton version of that artifact's structure, served as static
JSON/markdown shipped alongside the lab content, pre-filling section headers and field
placeholders but no scenario-derived data (the learner must pull facts from the Scenario
section themselves — this is the pedagogical point of the lab).

| Template field | Type | Required |
|---|---|---|
| `templateId` | string | yes |
| `artifactType` | `"risk_register" \| "control_matrix" \| "bia" \| "audit_plan" \| "vendor_assessment" \| "board_report" \| "asset_register"` | yes |
| `sections` | `{ heading: string; placeholder: string; required: boolean }[]` | yes |

### 4. Submission
**Blocked on persistence decision.** The UI can fully render an editable form/document
surface (rich text or structured fields per template section) and a "Submit" action. What
is blocked is *durably storing* the submission against a learner+lab record, because no
existing service/table models `started`, `submitted`, `score`, `feedback` per learner per
lab (per `LEARNING_RUNTIME_STATE_MODEL.md`'s Lab row). Until that gap is resolved:

- The component can hold submission content in local/session state and call an
  `onSubmit(content)` prop callback.
- It must **not** invent a persistence call to a non-existent service. Any wiring to a real
  backend call is deferred until `AssessmentService` (or equivalent) exists.

### 5. AI Review
Backed by `docs/coaching/ZARA_PERSONA.md`. **No `CoachService` exists today.** This means AI
review is, as of this wave, **static guidance rendered from the persona spec — not live,
generated feedback on the learner's actual submission content.** Concretely:

- `<LabWorkspace />` reads the lab's "AI Feedback Rules" section to determine which 1-2 of
  the five personas (Instructor, Reviewer, Auditor, Hiring Manager, Mentor) apply.
- For each applicable persona, it renders that persona's static review checklist (derived
  from `ZARA_PERSONA.md`'s "Reviews" column and the lab's own Scoring Rubric) as a
  self-check guide the learner reads before/after submitting.
- It does **not** call any AI/LLM service to generate feedback on the submitted content,
  because no `CoachService` exists to do so. This must not be faked with a hardcoded
  "AI-generated" response that is actually static template text presented as if dynamic —
  the UI must visually and textually distinguish "review checklist" from "personalized
  feedback."
- Once a `CoachService` is built (out of scope here), this section upgrades from static
  checklist to live generated review without changing the surrounding component contract —
  the `aiReview` prop slot is designed to accept either.

### 6. Feedback
Tied to AI Review's current static-only state. The Feedback section renders whatever the AI
Review step produced: today, the static per-persona checklist with pass/fail-style
self-assessment checkboxes the learner ticks themselves; in the future (post-`CoachService`),
structured feedback objects per `docs/coaching/FEEDBACK_MODEL.md`'s required shape
(`reason`, `supporting_data`, `confidence`). The props interface below already accepts the
richer future shape so no breaking change is needed later.

### 7. Scoring
**Blocked on persistence decision**, same as Submission. The scoring *rule* (how a
submission maps to a score against the lab's rubric) can be specified now; *recording* a
learner's score cannot, until a record shape exists. Scoring rule:

- Each Scoring Rubric criterion (from the lab file) is binary or graded (lab-specific).
- A computed score is `(criteria met) / (total criteria)`, expressed as a percentage, with
  per-criterion detail retained for feedback (not just an aggregate number) — consistent with
  `FEEDBACK_MODEL.md`'s explainability rule.
- Until persistence exists, `<LabWorkspace />` computes this score client-side from the
  static rubric and the learner's self-assessment checkboxes (see Feedback section) and
  surfaces it for the current session only; it is lost on reload. This limitation must be
  shown in the UI (e.g. "Your progress isn't saved yet") rather than hidden.

## Props / interface

```typescript
interface LabWorkspaceProps {
  labId: string;                      // resolves docs/learning/labs/<LabId>.md content
  scenarioId: string;                 // resolves via ScenarioService.findById
  tenantContext: TenantContext;

  // Section 1: Instructions — static, parsed from lab markdown
  instructions: {
    title: string;
    objective: string;
    estimatedMinutes: number;
    scoringRubric: RubricCriterion[];
    aiFeedbackRules: PersonaName[];   // subset of the five ZARA personas, max 2
  };

  // Section 2: Scenario — ScenarioService-backed
  scenario: {
    record: ScenarioRecord;
    priorRuns?: ScenarioRunRecord[];  // from ScenarioService.findRuns
  };

  // Section 3: Templates — static
  template: LabTemplate;

  // Section 4: Submission — NOT persisted (gap); session-local only
  submission: {
    content: Record<string, string>; // keyed by template section heading
    status: "not_started" | "in_progress" | "submitted";
    onSubmit: (content: Record<string, string>) => void;
  };

  // Section 5/6: AI Review + Feedback — static today, upgradeable shape
  aiReview: {
    mode: "static_checklist" | "generated";   // always "static_checklist" until CoachService exists
    personas: PersonaName[];
    checklist?: ReviewChecklistItem[];          // present when mode === "static_checklist"
    feedback?: GeneratedFeedback[];             // present when mode === "generated" (future)
  };

  // Section 7: Scoring — session-local computation only, not persisted
  scoring: {
    computed: { percentage: number; perCriterion: { criterion: string; met: boolean }[] };
    persisted: false;                 // always false until AssessmentService/equivalent exists
  };
}

interface RubricCriterion {
  id: string;
  description: string;
  graded: boolean;
}

type PersonaName = "Instructor" | "Reviewer" | "Auditor" | "Hiring Manager" | "Mentor";

interface ReviewChecklistItem {
  persona: PersonaName;
  prompt: string;        // self-check question, e.g. "Did you justify every risk score?"
  relatedCriterionId?: string;
}

interface GeneratedFeedback {
  persona: PersonaName;
  reason: string;
  supportingData: string;
  confidence: number;    // 0-1
}

interface LabTemplate {
  templateId: string;
  artifactType:
    | "risk_register" | "control_matrix" | "bia"
    | "audit_plan" | "vendor_assessment" | "board_report" | "asset_register";
  sections: { heading: string; placeholder: string; required: boolean }[];
}
```

## What this wave does NOT do
Does not create `AssessmentService`, `CoachService`, or any persistence for lab attempts,
scores, or feedback. Does not implement live AI-generated review — only the static
ZARA-persona checklist is real today. Does not modify `ScenarioService` or any existing
service. Does not decide the labs/assessments shared-state question raised in
`LEARNING_RUNTIME_STATE_MODEL.md` — it is referenced, not resolved, here.
