# Questionnaire Automation Certification

**Date:** 2026-06-20
**Scope:** Phase 11.5's Security Questionnaire Engine — SIG, SIG Lite, CAIQ, HIPAA Vendor
Review, SOC Questionnaire, and Custom templates, auto-answered from live tenant data
(Controls, Evidence, Framework Coverage, Governance Scores, Vendor Assessments) with full
explainability. See `docs/certification/TRUST_CENTER_CERTIFICATION.md` for the surrounding
Trust Center schema/service/route certification — this document covers the questionnaire
engine specifically.

## Templates are metadata, not a code path per template

`QuestionnaireTemplateRecord.templateType` is a single enum field
(`sig | sig_lite | caiq | hipaa_vendor | soc | custom`) on one `questionnaire_templates`
table. There is no `SigService`, `CaiqService`, etc. — `QuestionnaireService` has exactly
one `createTemplate`/`autoAnswer` code path that branches on data, not on template type.
This directly follows the same convention `CLAUDE.md` requires for frameworks
("frameworks are metadata, not separate modules").

## Auto-answer pipeline — `QuestionnaireService.autoAnswer`

1. Loads the submission and its template.
2. Fetches, in parallel, every input a question could need: `frameworks`,
   `frameworkControls`, this project's `controls`, all `controlEvidenceLinks`,
   `evidenceReviews`, this project's `evidence`, this project's `vendors`,
   `vendorAssessments`, and this project's `governanceScores`.
3. Computes per-framework coverage by calling `computeFrameworkCoverage` (from
   `frameworkIntelligence.ts`) for every framework — the same function
   `FrameworkCoverageService` exposes on the Framework Intelligence dashboard, not a
   re-derivation.
4. Builds one `inputs` object (`frameworkCoverages`, `governanceScore`,
   `evidenceApprovedCount`/`evidenceTotalCount`, `vendorCount`,
   `vendorOpenFindingCount`) and calls `generateQuestionnaireAnswer(question, inputs)`
   once per template question.
5. Persists each answer as a real `questionnaire_answers` row with `aiGenerated: true`,
   `confidence`, and `reasoning` — never silently skips a question.
6. Advances the submission to `status: 'submitted'`.

## `generateQuestionnaireAnswer` — `packages/services/src/trustIntelligence.ts`

A deterministic, keyword-matching heuristic — explicitly documented as such because, per
this repo's existing constraint (the same one `CoachService` documents), no LLM client
exists. It matches question text against:

- A framework code/name mentioned in the question → answers with that framework's real
  `coveragePercent`.
- "vendor" / "third part(y)" → answers with real `vendorCount`/`vendorOpenFindingCount`.
- "evidence" / "audit" / "review" → answers with real
  `evidenceApprovedCount`/`evidenceTotalCount`.
- "governance" / "maturity" / "program" → answers with the real latest `governanceScore`.
- No match → falls back to an explicit "requires manual review" answer with
  `confidence: 0.2`, rather than guessing.

Every branch returns `{ answerText, confidence, reasoning }` — the explainability triad
`CLAUDE.md` requires of every AI recommendation.

## Internal UI — `apps/web/app/trust-center/page.tsx`

"Questionnaire Templates" section creates a template (name, type, newline-delimited
questions). "Questionnaire Submissions" section starts a submission against a project,
lists submissions with status, and exposes "Auto-Answer" (calls `autoAnswerQuestionnaireAction`
→ `services.questionnaires.autoAnswer`) and "Mark Completed" actions, each followed by
`services.audit.recordAction`.

## What is honestly NOT fully closed

1. **No per-answer manual override UI.** `questionnaire_answers` rows are immutable once
   persisted by `autoAnswer` — there is no edit action for a human reviewer to correct an
   AI-generated answer before the submission is marked complete.
2. **No questionnaire export to a downloadable package via the UI** — `ExportsService`
   exposes a live `questionnaire_package` export type (see
   `TRUST_CENTER_CERTIFICATION.md`), but `trust-center/page.tsx` does not yet link to it.
3. **No live Supabase verification** — see the same caveat in
   `TRUST_CENTER_CERTIFICATION.md`.

## Verification performed

- **`npm run typecheck --workspace @zig/services`** — PASS, zero errors.
- **Unit test:** `packages/services/src/tests/trust-center-workflow.test.ts` exercises the
  full pipeline — `createTemplate` → `startSubmission` (asserts `in_progress`) →
  `autoAnswer` (asserts one `aiGenerated: true` answer per question, submission advances to
  `submitted`) → `completeSubmission` (asserts `completed`). Run via
  `npx tsx src/tests/trust-center-workflow.test.ts` — **exited 0**.
- **Regression check:** all 16 prior workflow tests in `packages/services/src/tests/`
  re-run and **exited 0**.
