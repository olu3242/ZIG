# Questionnaire OS — Capability Audit

> Batch 11. Fresh audit of `packages/services/src/`, `packages/*/src/`, and
> `supabase/migrations/*.sql` for anything a Questionnaire OS could reuse. Every claim below
> was re-verified in this session by reading source directly — see file:line citations. This
> document does not assume the findings of `TRUST_OS_EXISTING_SERVICES_MAP.md` (Batch 1) are
> still accurate; it re-derives them for the questionnaire-specific question being asked here.

## Question being answered

Questionnaire OS needs: a place to store questionnaires/questions/responses, a way to map a
question to a control, a way to find evidence for a question, a way to read framework
mappings, and a way to read/write a governance-relevant score. Does any of that exist today?

## Service-by-service verdict

| Service | File | What it actually does (re-verified) | Questionnaire OS reuse verdict |
|---|---|---|---|
| `AssessmentService` | **does not exist** | No file named `AssessmentService.ts` anywhere under `packages/services/src/`. `packages/services/src/factory.ts:15-39`'s `ZigServices` object has no `assessments` key. The two packages with "assessment" in the name — `packages/assessment-engine/src/index.ts` (`AssessmentEngine.grade()`, a stateless quiz/exam grader for the Learning OS) and `packages/assessment-os/src/index.ts` (`AssessmentOS.composite()`, averages five learner-competency sub-scores) — are both Learning OS constructs with no relationship to governance questionnaires, controls, or evidence. | **Build.** There is no governance-assessment service to extend. A new `QuestionnaireService` (or similarly named) must be built from scratch following the `BaseService<T>` pattern. |
| `FrameworkService` | `packages/services/src/FrameworkService.ts:1-8` | Extends `BaseService<FrameworkRecord>`, adds one method: `findAvailableFrameworks(context)` returning active frameworks (`FrameworkService.ts:5-7`). No question-to-framework mapping logic of any kind. | **Reuse** for reading the list of frameworks a tenant has active; **Build** the question→framework mapping itself (Questionnaire OS-specific, does not exist anywhere). |
| `ControlService` | `packages/services/src/ControlService.ts:1-15` | Extends `BaseService<ControlRecord>`, adds `findMappings(context, sourceControlId)` reading `ControlMappingRecord[]` from a `controlMappings` repository (`ControlService.ts:12-14`) — this is cross-framework control-to-control crosswalk, not question-to-control mapping. | **Reuse** as the read path for control records and cross-framework control mappings once a question has been mapped to a control ID; **Build** the question→control mapping layer itself. |
| `EvidenceService` | `packages/services/src/EvidenceService.ts:1-8` | Extends `BaseService<EvidenceRecord>`, adds exactly one method: `findByControl(context, controlId)` (`EvidenceService.ts:5-7`), a tenant-scoped query filtering the `evidence` repository by `controlId`. No `findByFramework`, no `findByQuestion`, no text/semantic search. | **Reuse** directly: once a question resolves to a `controlId`, `findByControl` is the existing call to fetch candidate evidence. This is the single most reusable piece of the entire chain for Questionnaire OS. **Extend** is needed if/when text-similarity evidence matching (Batch 15) requires more than an exact `controlId` filter — but that extension belongs to Evidence OS (see `evidence-os/EVIDENCE_OS_AUDIT.md`), not to a new parallel service. |
| `RiskService` | `packages/services/src/RiskService.ts:1-15` | Extends `BaseService<RiskRecord>`, adds `findAssessments(context, riskId)` reading `RiskAssessmentRecord[]` (`RiskService.ts:12-14`) — this is risk-assessment history (a risk's own review timeline), unrelated to questionnaire responses despite the shared word "assessment." | **Reuse** is not applicable to the question→control→evidence chain. Note the naming collision explicitly: a Questionnaire OS "Response" must never be conflated with a `RiskAssessmentRecord` row — they are different entities in different tables. Not reused, not extended; documented only to prevent confusion. |
| `GovernanceService` | `packages/services/src/GovernanceService.ts:1-15` | Extends `BaseService<GovernanceScoreRecord>`, adds `findRecommendations(context, projectId)` (`GovernanceService.ts:12-14`). Reads/writes `governance_scores` rows: `score`, `controls_implemented`, `evidence_coverage`, `risk_treatment`, `assessment_completion`, `explanation` (verified directly against `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`). No question or response columns of any kind. | **Reuse** the existing recommendation feed pattern (`findRecommendations`) as the template for "what would raise this questionnaire's confidence score" guidance (Batch 17/18), rather than building a second recommendation mechanism. **Build** any new score type — Questionnaire OS produces a *response-level* Confidence Score (Batch 17), which is a different concept from the *program-level* Governance Score and must not write into `governance_scores`. |

## Data layer re-verification

- `vendors.questionnaire jsonb not null default '[]'::jsonb`
  (`supabase/migrations/202606190002_mvp_convergence_schema.sql:93`) is the **entire** current
  questionnaire data model in this codebase. It is an unstructured JSON array on the vendor
  row, with no dedicated `questionnaires`, `questions`, or `responses` tables anywhere in the
  17 migration files under `supabase/migrations/`. Confirmed by grep: no migration creates a
  table named `questionnaires`, `questions`, or `responses` (the response-to-a-question
  sense; `risk_assessments`, `evidence_reviews`, `control_reviews` etc. are not this).
- No `AssessmentService`, `VendorService`, or `QuestionnaireService` exists anywhere under
  `packages/*/src/` (grep for these three names across `packages/` returns zero matches in
  this session).
- `apps/web/app/vendors/` and `apps/web/app/vendors/[id]/` exist as UI routes, but there is no
  `apps/web/app/trust/` directory of any kind — `/trust/questionnaires` (Batch 20) is wholly
  new UI surface, not an extension of an existing route.

## Verdict summary

| Component | Verdict |
|---|---|
| Questionnaire/Question/Response storage | **Build** — only a single jsonb column exists today (`vendors.questionnaire`), and it cannot hold the structured entities this OS requires (see `QUESTIONNAIRE_DATA_MODEL.md` for the reconciliation decision) |
| Question→Control mapping | **Build** — no existing table or service does this |
| Control→Evidence lookup | **Reuse** — `EvidenceService.findByControl` already does exactly this |
| Control→Framework mapping | **Reuse** — `ControlService.findMappings` already does this |
| Framework list | **Reuse** — `FrameworkService.findAvailableFrameworks` |
| Confidence/response scoring | **Build** — distinct from, and must not overwrite, `GovernanceService`'s `governance_scores` |
| Trust Review workflow / Approval | **Build** — no approval state machine exists for questionnaire responses anywhere in the codebase |
| `/trust/questionnaires` UI | **Build** — no `apps/web/app/trust/` directory exists at all |

This audit's conclusion drives `QUESTIONNAIRE_REUSE_MATRIX.md` below and is the basis for the
data-model reconciliation in `QUESTIONNAIRE_DATA_MODEL.md` (Batch 12).
