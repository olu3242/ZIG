# Learning Runtime: Assessment Runtime (`<AssessmentEngine />`)

## BLOCKED — read this before anything else below

**This entire component is blocked pending an `AssessmentService` decision.** Per
`docs/runtime/LEARNING_RUNTIME_STATE_MODEL.md`'s Assessment row: no `AssessmentService`
exists anywhere in `packages/services/src/*.ts` (confirmed by direct inspection of every
file in that directory — the only services that exist are `AssetService`, `AuditService`,
`ControlService`, `EvidenceService`, `FrameworkService`, `GovernanceService`,
`LearningService`, `ProjectService`, `RiskService`, `ScenarioService`, `TenantService`,
`UserService`). There is no record shape for `attempts`, `score`, `passed`, or `answers`
per learner per assessment.

This document specifies the full UI/component contract for `<AssessmentEngine />` as
implementation-ready, because the rendering and scoring-rule logic do not themselves require
a backend — they are pure functions over question data and learner input. **Every
capability that touches persistence is explicitly marked `requires AssessmentService (not
yet built)` below and must not be wired to a real backend call until that service exists.**
No fake or stand-in `AssessmentService` is invented in this document, in code, or in any
other file as part of this wave.

## Scope: four assessment types

| Type | Where defined | Question count (typical) | Pass threshold |
|---|---|---|---|
| Knowledge Check | End of each lesson, `docs/learning/lessons/<track>/*` | 3-5 | Informational — no hard gate |
| Quiz | End of each module, `docs/assessments/` | 8-12 | Track-defined, typically 70-80% |
| Practical Exercise | Mid-track, scenario-grounded | 1-3 multi-part tasks | Rubric-graded, not percentage |
| Capstone | End of track | Full mixed-type assessment | Track-defined, typically 80% |

(Per `ZARA_PERSONA.md`, the Instructor persona is invoked specifically on "Module quiz
failure, knowledge check miss" — `<AssessmentEngine />`'s failure state is the trigger point
for that persona; this is a static checklist today, same caveat as in
`LEARNING_RUNTIME_LAB_RUNTIME.md`'s AI Review section, not live-generated coaching.)

## Component sections

### Question-type rendering

| Question type | Render shape | Scoring rule |
|---|---|---|
| Multiple choice (single answer) | Radio group | Exact match against `correctOptionId` |
| Multiple choice (multi-select) | Checkbox group | Exact set match (no partial credit by default; partial-credit mode is a per-question flag) |
| True/False | Two-button toggle | Exact match |
| Short answer | Single-line text input | Case-insensitive match against an `acceptedAnswers: string[]` array (no NLP grading — exact/fuzzy string match only, since no grading service exists) |
| Matching | Drag-pair or dropdown-per-item | Per-pair exact match; score = pairs correct / total pairs |
| Practical exercise (structured) | Multi-field form (same template mechanism as `LabWorkspace`'s Templates section) | Rubric-graded: each criterion binary or graded, score = criteria met / total criteria — **identical scoring shape to Lab scoring in `LEARNING_RUNTIME_LAB_RUNTIME.md`**, which is exactly why `LEARNING_RUNTIME_STATE_MODEL.md` recommends labs and assessments share one service if approved |
| Capstone | Sequenced combination of the above question types in one session | Weighted sum across constituent questions/sections, weights defined per capstone spec |

### Scoring rules — detail

```typescript
type ScoringRule =
  | { kind: "exact_match"; correctOptionId: string }
  | { kind: "exact_set_match"; correctOptionIds: string[] }
  | { kind: "fuzzy_text_match"; acceptedAnswers: string[]; caseSensitive: false }
  | { kind: "pair_match"; correctPairs: [string, string][] }
  | { kind: "rubric_graded"; criteria: { id: string; description: string; weight: number }[] };

function computeQuestionScore(rule: ScoringRule, learnerAnswer: unknown): number {
  // pure function — 0 to 1 — no backend call required to compute this.
  // Implementation detail only; see rule-specific matching logic above.
  throw new Error("spec-only — not implemented in this wave");
}
```

All scoring computation above is **pure and client-computable** — it does not require
`AssessmentService` to *calculate* a score in the moment. What requires `AssessmentService`
is *remembering* that the learner took the assessment, what they answered, what they
scored, and whether they passed, across sessions and for reporting/certification purposes.

### Capabilities and their persistence dependency

| Capability | Persistence dependency |
|---|---|
| Render a question of any type above | None — pure UI, works today |
| Compute a single question's score | None — pure function, works today |
| Compute an assessment's total score in the current session | None — pure function, works today |
| Show pass/fail in the current session | None — pure function, works today |
| Remember a learner has already attempted this assessment | **requires AssessmentService (not yet built)** |
| Enforce attempt limits (e.g. max 3 attempts) | **requires AssessmentService (not yet built)** |
| Store per-question answers for review/audit | **requires AssessmentService (not yet built)** |
| Show score history / trend across attempts | **requires AssessmentService (not yet built)** |
| Gate progression to next module on quiz pass | **requires AssessmentService (not yet built)** (today the gate, if shown at all, is a session-local flag that resets on reload — must be labeled as such, not presented as enforced) |
| Feed `competencyScores` into certification eligibility | **requires AssessmentService (not yet built)** — also depends on the separate Certification gap named in `LEARNING_RUNTIME_STATE_MODEL.md` |
| Trigger Instructor-persona static checklist on a knowledge-check miss | None for the static checklist itself — same caveat as `ZARA_PERSONA.md`: no live generated coaching without a `CoachService` |

## Props / interface

```typescript
interface AssessmentEngineProps {
  assessmentId: string;
  assessmentType: "knowledge_check" | "quiz" | "practical_exercise" | "capstone";
  questions: AssessmentQuestion[];
  passThreshold?: number;          // percentage; undefined for informational knowledge checks

  // Session-local only. No assessmentId-scoped history is loaded or saved —
  // requires AssessmentService (not yet built).
  session: {
    answers: Record<string /* questionId */, unknown>;
    onAnswer: (questionId: string, answer: unknown) => void;
    onSubmit: () => AssessmentResult;   // pure, client-computed, not persisted
  };

  // Always reflects "no persisted history" until AssessmentService exists.
  history: {
    available: false;               // hardcoded false — requires AssessmentService (not yet built)
    priorAttempts: never[];         // always empty
  };

  onInstructorTrigger?: (missedQuestionIds: string[]) => void; // static checklist hook, see ZARA_PERSONA.md
}

interface AssessmentQuestion {
  id: string;
  type: "single_choice" | "multi_choice" | "true_false" | "short_answer" | "matching" | "practical";
  prompt: string;
  options?: { id: string; label: string }[];
  scoringRule: ScoringRule;
}

interface AssessmentResult {
  totalScore: number;        // 0-100
  passed: boolean | null;    // null if passThreshold is undefined (informational)
  perQuestion: { questionId: string; score: number }[];
  persisted: false;          // always false until AssessmentService exists
}
```

## What this wave does NOT do
Does not create `AssessmentService` or any persistence layer for assessment attempts,
answers, scores, attempt limits, or certification eligibility. Does not invent a fake or
stand-in service to make persistence appear to work. Does not implement live AI-generated
instructor feedback — only the question rendering, pure client-side scoring, and the static
ZARA-checklist trigger hook are real in this wave. Does not resolve the
labs/assessments-shared-state question from `LEARNING_RUNTIME_STATE_MODEL.md` — it is named
here as the reason Practical Exercise scoring intentionally mirrors Lab scoring, not
resolved.
