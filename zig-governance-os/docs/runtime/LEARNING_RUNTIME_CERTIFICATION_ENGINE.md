# Learning Runtime: Certification Engine (Wave 10)

## Purpose
Specifies `<CertificationCenter />`: Competency Scoring, Readiness Assessment, Track
Completion, Capstone Evaluation, and Certificate Issuance. Per
`LEARNING_RUNTIME_STATE_MODEL.md`, Certification is a documented **gap** — no
`issuedAt`/`certificateId`/`trackId`/`competencyScores` record shape exists today, "needs an
explicit new-service decision before Wave 10." This document splits the five features into
what is computable today from existing confirmed services, versus what is blocked, and
specifies each precisely rather than glossing over the difference.

## Backing services — confirmed inventory
Only these services exist in `packages/services/src/*.ts`: `AssetService`, `AuditService`,
`ControlService`, `EvidenceService`, `FrameworkService`, `GovernanceService`,
`LearningService`, `ProjectService`, `RiskService`, `ScenarioService`, `TenantService`,
`UserService`. There is no `CertificationService`, no `AssessmentService`. Every feature
below either reads `LearningService` directly, depends on the blocked `AssessmentEngine`
(`LEARNING_RUNTIME_ASSESSMENT_RUNTIME.md`, Wave 5), or is blocked on a persistence decision
of its own.

## Feature status summary

| Feature | Status | Backed by |
|---|---|---|
| Competency Scoring | **Computable today** | `LearningService` completion data |
| Track Completion | **Computable today** | `LearningService` completion data |
| Readiness Assessment | **Computable today, derived** | Composition of the above two |
| Capstone Evaluation | **Blocked** | `AssessmentEngine` (`AssessmentService` — does not exist) |
| Certificate Issuance | **Blocked** | No persistence layer for certificates |

## Component contract

```typescript
interface CertificationCenterProps {
  learnerId: string;
  tenantId: string;
  trackId: string; // one of docs/learning/MASTER_CURRICULUM_MAP.md's tracks
}

interface CertificationCenterViewModel {
  trackId: string;
  competencyScoring: CompetencyScoringResult;   // ready
  trackCompletion: TrackCompletionResult;        // ready
  readinessAssessment: ReadinessAssessmentResult; // ready, derived
  capstoneEvaluation: CapstoneEvaluationResult;   // blocked
  certificateIssuance: CertificateIssuanceResult; // blocked
}
```

## Feature 1 — Competency Scoring (computable today)

Computed entirely from `LearningService`'s completed `LearningModuleRecord` rows for the
given track, using the same skill-tag derivation rule defined in
`LEARNING_RUNTIME_PORTFOLIO_RUNTIME.md` (Section 3, Skills) — reused here rather than
redefined, to avoid two divergent derivation rules for the same underlying data.

```typescript
interface CompetencyScoringResult {
  status: "ready";
  trackId: string;
  scores: Array<{
    skillTag: string;
    score: number; // 0-100
    modulesContributing: string[]; // LearningModuleRecord ids
  }>;
}
```

### Scoring rule
```
For each skill tag associated with this track's modules:
  score = (number of that skill's tagged modules the learner has completed
            / total modules in this track tagged with that skill) * 100
```

This is a straight completion ratio — it does not require any quiz/assessment score (which
would need the blocked `AssessmentService`). It is intentionally coarse: "did the learner
complete the modules that teach this skill," not "how well did they perform." A more
precise, assessment-weighted competency score would require Capstone Evaluation's blocked
dependency (see Feature 4).

## Feature 2 — Track Completion (computable today)

```typescript
interface TrackCompletionResult {
  status: "ready";
  trackId: string;
  totalModules: number;
  completedModules: number;
  percentComplete: number; // completedModules / totalModules * 100
  completedAt: string | null; // set once percentComplete reaches 100
}
```

**Data source:** `LearningService.findModules(context, learningPathId)` for the track's
`LearningPathRecord`, cross-referenced against the learner's per-module `completed` state
(already modeled per `LEARNING_RUNTIME_STATE_MODEL.md`'s Lesson row: "`started`,
`completed`, `lastViewedAt` per learner per lesson node" — "Fits. No change needed."). No new
service, no new field.

## Feature 3 — Readiness Assessment (computable today, derived)

A composition of Features 1 and 2 — not a new data read, a derived view.

```typescript
interface ReadinessAssessmentResult {
  status: "ready";
  trackId: string;
  trackCompletionPercent: number;      // from Feature 2
  averageCompetencyScore: number;      // mean of Feature 1's scores
  readinessLevel: "Not Ready" | "Developing" | "Ready" | "Highly Ready";
  blockingGaps: string[]; // skill tags below a readiness threshold, named explicitly
}
```

### Readiness rule
```
readinessLevel =
  trackCompletionPercent < 50                              → "Not Ready"
  trackCompletionPercent >= 50 AND averageCompetencyScore < 60 → "Developing"
  trackCompletionPercent >= 80 AND averageCompetencyScore >= 60 → "Ready"
  trackCompletionPercent == 100 AND averageCompetencyScore >= 85 → "Highly Ready"
```
`blockingGaps` lists every skill tag from Feature 1 scoring below 60, so the learner sees
exactly which modules to revisit — consistent with CLAUDE.md's explainability rule (every
score states why it exists and how to improve it), applied here even though this is learning
content rather than the core governance score.

This readiness score is explicitly **not** a certification — it tells the learner whether
they are ready to attempt a capstone, not whether they have earned anything. Issuing a
credential still requires Features 4 and 5, both blocked.

## Feature 4 — Capstone Evaluation (blocked)

```typescript
interface CapstoneEvaluationResult {
  status: "blocked";
  gapReason:
    "Capstone Evaluation requires AssessmentEngine, which depends on AssessmentService — " +
    "does not exist. See LEARNING_RUNTIME_ASSESSMENT_RUNTIME.md (Wave 5).";
  evaluation: null;
}
```

Per `LEARNING_RUNTIME_DATA_FLOW.md`: "BLOCKED: no `AssessmentService` exists... only labs
(lab → `ScenarioService`) and lessons (lesson → `LearningService`) have a confirmed path."
A capstone is, by definition, a scored assessment-shaped artifact — it cannot be evaluated
without the same `AssessmentEngine` that Wave 5 already names as blocked. This document does
not redefine `AssessmentEngine`'s scoring logic, attempt model, or grading rules —
`LEARNING_RUNTIME_ASSESSMENT_RUNTIME.md` owns that, and `<CertificationCenter />` simply
calls into it once it exists, the same way it calls into `LearningService` for Features 1-3.

## Feature 5 — Certificate Issuance (blocked, forward design only)

```typescript
interface CertificateIssuanceResult {
  status: "blocked";
  gapReason:
    "No certificate persistence layer exists. Certificate data shape below is a forward " +
    "design, not an implementation — blocked pending a persistence decision (new service " +
    "vs. extension of an existing one, per LEARNING_RUNTIME_STATE_MODEL.md's Certification " +
    "row).";
  certificate: null;
}
```

### Forward certificate data shape (not implemented, not persisted anywhere today)

```typescript
// Forward design only. No service or table backs this today.
interface Certificate {
  certificateId: string;   // generated at issuance time
  learnerId: string;
  trackId: string;
  issuedAt: string;        // ISO timestamp
  competencyScores: Array<{ skillTag: string; score: number }>; // snapshot of Feature 1
                                                                   // at issuance time
}
```

This shape mirrors exactly the fields `LEARNING_RUNTIME_STATE_MODEL.md` already named as
needed for the Certification row (`issuedAt`, `certificateId`, `trackId`,
`competencyScores`) — no new fields invented here, no fields dropped. Issuance would
conceptually require: (1) Capstone Evaluation passing (Feature 4, itself blocked), and (2) a
decision on where `Certificate` rows live — a new `CertificationService`, or an extension of
`LearningService`/`AssessmentService` once the latter exists. This document does not make
that decision; it is named as the explicit blocker, consistent with
`LEARNING_RUNTIME_DATA_FLOW.md`'s reasoning for why this and Capstone Evaluation are marked
BLOCKED rather than speculatively designed further than the data shape itself.

## What this wave does NOT do
Does not implement `<CertificationCenter />`. Does not create `AssessmentService` or any
certificate-persistence service. Does not decide whether certificate storage extends
`LearningService`, extends a future `AssessmentService`, or warrants a new
`CertificationService` — named as the explicit decision the next session must make before
Feature 5 can move past forward design. Does not redefine `AssessmentEngine`'s internals —
owned by `LEARNING_RUNTIME_ASSESSMENT_RUNTIME.md`.
