# Visual Learning Standard — "Learning Experience Standard"

> Defines the required structure for every lesson: Text, Diagram, Scenario, Knowledge
> Check, and Completion sections, with diagram support for ISO 27001, SOC2, NIST CSF, and
> Risk/Audit/Vendor/Evidence lifecycles. Grounded in exactly what the real lesson page
> renders today.

## 1. What the lesson page renders today (verified, full file read)

`apps/web/app/learning/lesson/[id]/page.tsx` (57 lines total) renders, in order:

1. A `PageHeader` with the lesson title, a description string built from
   `lesson.title`/`path?.title`/`lesson.durationMinutes`, and a `StatusBadge` showing
   `lesson.moduleType` (lines 23-28).
2. A `Section title="Lesson Content"` containing **exactly one static paragraph**: "This
   lesson is part of the {path title} curriculum. Mark it complete once you have finished
   reviewing the material..." (lines 30-35). This text is the same for every lesson
   regardless of `lesson.id` — it does not render any lesson-specific content field,
   because `learning_modules` has no content column (verified: `title`, `module_type`,
   `duration_minutes` are the only content-relevant columns,
   `202606180001_batch_21_core_data_platform.sql` lines 250-259).
3. A `Section title="Mark Complete"` with a single form posting `completeLessonAction`
   (lines 37-48) — this is real and writes `user_progress`.
4. A `Section title="Navigate"` with a single back-link (lines 50-54).

**There is no diagram, video, image, knowledge-check quiz, or scenario narrative anywhere
on this page today.** The route structure named in the original task brief
(`/learning/[id]/module/[id]/lesson/[id]`) does not exist; the real route is the flatter
`/learning/lesson/[id]` (confirmed via `Glob` across `apps/web/app/learning/`).

## 2. The required standard — five sections per lesson

Every lesson must render, in this order:

1. **Text** — the core instructional explanation (what exists today, but currently
   hardcoded boilerplate instead of real per-lesson content).
2. **Diagram** — a visual representation of the relevant process/lifecycle (see Section 3
   for supported diagram types). Not present today.
3. **Scenario** — a short, concrete applied example showing the concept in a realistic
   governance context (can reference one of the 5 scenario companies from
   `SCENARIO_ENGINE_ARCHITECTURE.md` for narrative consistency, though this is not
   required). Not present today.
4. **Knowledge Check** — a small in-lesson check (distinct from the formal
   `learning_assessments` flow at `/assessment/[id]`; this is a lighter-weight,
   non-scored or low-stakes check embedded in the lesson itself). Not present today.
5. **Completion** — the existing "Mark Complete" form (already real, keep as-is).

## 3. Diagram support requirement

The standard requires Mermaid, SVG, or React Flow diagram rendering capability for the
following lifecycle families, all of which are named in the task brief and all of which
correspond to real concepts already present elsewhere in this codebase (framework names
appear in `scenarios.framework_ids`, `CLAUDE.md`'s supported-frameworks list, and
`docs/release/zig-post-batch-33-roadmap.md`'s Batch 36 lab-type list):

| Lifecycle family | Example diagram content |
|---|---|
| ISO 27001 | ISMS Plan-Do-Check-Act cycle; Annex A control domain map |
| SOC2 | Trust Services Criteria categories; audit period timeline |
| NIST CSF | Identify-Protect-Detect-Respond-Recover function wheel |
| Risk lifecycle | Identify → Assess → Treat → Monitor → Report loop |
| Audit lifecycle | Plan → Fieldwork → Findings → Remediation → Close loop |
| Vendor lifecycle | Onboard → Assess → Monitor → Reassess → Offboard loop |
| Evidence lifecycle | Request → Submit → Review → Approve/Reject loop (mirrors the real `EvidenceStatus` type already defined in `packages/types/src/index.ts` lines 38, 216: `"missing" | "requested" | "submitted" | "approved"` and `"pending_review" | "approved" | "rejected"`) |

No diagram-rendering library is currently imported anywhere in `apps/web/app/learning/`
(verified: no `mermaid`, `reactflow`, or `react-flow` import found in any file read during
this research pass). Adding this capability is new frontend work, not a wiring fix.

## 4. Proposed content model (specification only — not implemented)

To carry five structured sections per lesson, `learning_modules` needs somewhere to store
section content beyond its current four columns (`title`, `module_type`,
`duration_minutes`, plus inherited `learning_path_id`/`tenant_id`/timestamps). Two options:

**Option A — single `content jsonb` column on `learning_modules`.** Minimal schema change
(one nullable column). Shape:
```json
{
  "text": "...",
  "diagram": { "type": "mermaid", "definition": "graph LR; A-->B" },
  "scenario": "...",
  "knowledgeCheck": { "question": "...", "options": ["..."], "correctIndex": 0 },
}
```
Pro: minimal migration, flexible. Con: not independently queryable per-section (e.g.
cannot easily report "how many lessons are missing a diagram" without parsing JSON).

**Option B — a new `lesson_sections` table** (`learning_module_id` FK, `section_type` text
check-constrained to `text|diagram|scenario|knowledge_check`, `content jsonb`,
`order_index`). Pro: queryable per section type, consistent with how `lab_tasks` already
models ordered sub-content under a parent (`lab_tasks.scenario_id` FK +
`order_index` — same shape). Con: a new table, more migration surface.

**Recommendation:** Option A for the Text/Diagram/Scenario fields (rarely queried
independently — they are rendered together, not reported on individually) plus reusing the
**existing** `learning_assessment_questions` shape for the Knowledge Check section rather
than inventing a fourth representation of "a question with options and a correct answer" —
that exact shape (`prompt`, `options jsonb`, `correct_option_index`, `weight`,
`order_index`) already exists and is already proven by `AssessmentService.submitAttempt`'s
real scoring logic. A lesson's "Knowledge Check" could be modeled as a lightweight
`learning_assessments` row (e.g. `assessment_type = 'knowledge_check'`) linked from the
lesson, rather than a new embedded JSON shape — avoiding a duplicate scoring
implementation. This recommendation is not implemented here.

## 5. What this document does not do

- It does not add `content jsonb` or any column to `learning_modules`.
- It does not import or configure Mermaid/SVG/React Flow.
- It does not write any lesson content.
- It does not modify `apps/web/app/learning/lesson/[id]/page.tsx`.
