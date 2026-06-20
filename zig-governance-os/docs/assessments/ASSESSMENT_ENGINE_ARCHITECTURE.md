# Assessment Engine Architecture

> Framework-first, per the user's explicit instruction: build the question-bank
> architecture now; the 1000+ actual questions are a separate, later content-authoring
> pass against this structure. No schema is created by this doc — it is a proposal to
> review before any migration is written, per "never implement before documenting."

## Current state (what already exists)

| Table | Fields | Gap |
|---|---|---|
| `assessments` (governance) | `title`, `status`, `score` | Project-level governance assessment, not a learning quiz. Already real, used by `AssessmentRecord`. |
| `learning_assessments` | `assessment_type`, `title`, `passing_score` | No questions, no options, no correct-answer field. Added in `202606180007_learning_os_e2e.sql`, no consuming service yet. |
| `learning_assessment_results` | `score`, `passed`, `remediation_skill_ids` | Records an outcome, but nothing produced that outcome — no item-level data. |
| `Assessment` type (`packages/types`) | `learningModuleId`, `title`, `passingScore` | Same gap — no question content field. |

**Conclusion: no question-bank schema exists anywhere in the codebase today.** This is the
gap this document proposes closing, structurally, before any content is authored.

## Four content tiers

| Tier | Scope | Pass threshold | Maps to |
|---|---|---|---|
| Knowledge Check | 1-2 questions per lesson | Informal, no gate | `docs/learning/lessons/*/NN_*.md` "Knowledge Check" section |
| Module Quiz | 5-10 questions per `learning_module` | 70% | `LearningModule` |
| Track Assessment | 20-30 questions spanning a track's 5 modules | 75% | `LearningPath` |
| Capstone | Scenario-based, scored against a rubric, not multiple choice | Rubric-based, not %-based | `capstone_projects` (already exists) |

## Proposed schema (not yet created)

```sql
-- proposal only
create table question_bank_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learning_module_id uuid references learning_modules(id) on delete cascade,
  tier text not null check (tier in ('knowledge_check','module_quiz','track_assessment')),
  question_type text not null check (question_type in ('multiple_choice','true_false','scenario_short_answer')),
  prompt text not null,
  options jsonb,              -- array of {id, text} for multiple_choice
  correct_option_id text,     -- references options[].id
  rationale text not null,    -- why the correct answer is correct (explainability, matches CLAUDE.md AI rules)
  framework_reference text,   -- optional, e.g. "ISO 27001 Annex A.9.2"
  created_at timestamptz not null default now()
);

create table question_bank_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  learner_user_id uuid not null references users(id) on delete cascade,
  question_id uuid not null references question_bank_items(id) on delete cascade,
  selected_option_id text,
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);
```

`question_bank_items.rationale` is mandatory (not nullable) so every quiz answer is
explainable, consistent with CLAUDE.md's "every AI recommendation must be explainable"
rule extended to assessment feedback.

## Question count target

1000+ questions, distributed roughly by track size (5 modules × ~20 module-quiz questions
+ ~25 track-assessment questions per track × 8 tracks ≈ 1,000). Knowledge checks (1-2 per
lesson × 40 lessons) are authored directly in the lesson docs, not in the bank, since
they're informal and ungated.

## What this wave does NOT do

- Does not create `question_bank_items`/`question_bank_attempts` tables.
- Does not author the 1000+ questions.
- Does not wire any service to read/write these tables.

This is the structural decision to review before either of those starts.
