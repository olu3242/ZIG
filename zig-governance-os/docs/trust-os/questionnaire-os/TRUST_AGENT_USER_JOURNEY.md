# Questionnaire OS — Trust Agent User Journey

> Batch 20. User flow and UI requirements for `/trust/questionnaires`. DESIGN SPEC ONLY — no
> implementation in this PR.

## User flow

```
Upload → Parse → Classify → Map Controls → Find Evidence → Generate Answers → Review → Export
```

| Step | User-visible state | System action |
|---|---|---|
| Upload | User drops a file on `/trust/questionnaires/new` | Creates a `Questionnaire` row, `status='draft'` |
| Parse | Spinner / progress indicator | Extracts question text into `Question` rows |
| Classify | Each question shows a domain badge | Runs `QUESTION_CLASSIFICATION_MODEL.md` pipeline |
| Map Controls | Each question shows 0-N control chips | Runs `CONTROL_MAPPING_ENGINE.md`; unmapped questions visibly flagged, not hidden |
| Find Evidence | Each question shows evidence candidate count | Runs `EVIDENCE_DISCOVERY_MODEL.md` |
| Generate Answers | Draft answer text appears per question, with Confidence Score badge | Runs `QUESTIONNAIRE_RESPONSE_ENGINE.md` |
| Review | Reviewer works through the Review Queue | `TRUST_REVIEW_WORKFLOW.md` |
| Export | User picks format, downloads package | `EXPORT_MODEL.md` |

## `/trust/questionnaires` area — required sections

| Section | Purpose | Primary entities shown |
|---|---|---|
| Uploads | List of in-progress uploads/parses, with parse status per file | `Questionnaire` (status: draft/parsing) |
| Questionnaires | List of all questionnaires, filterable by status/vendor/project | `Questionnaire` |
| Evidence Matches | Per-question candidate evidence with matching tier shown (Tier 1/2/3) | `EvidenceReference`, via `EVIDENCE_MATCHING_RULES.md` |
| AI Responses | Per-question drafted answers with Confidence Score and quality band | `Response`, `RESPONSE_QUALITY_MODEL.md` |
| Review Queue | Pending `TrustReview` rows assigned to the current user's role, per `APPROVAL_MATRIX.md` | `TrustReview`, `Approval` |
| Exports | History of generated export packages, downloadable again | `QuestionnaireResponsePackage` (Batch 19) |

## Zero empty states (CLAUDE.md rule applied here)

Per CLAUDE.md's "zero empty states" rule (`CLAUDE.md:127-128`), every section above must, even
with no data yet, show: a clear "Upload your first questionnaire" call-to-action (Uploads),
example/demo questionnaire data (Questionnaires), an explanation of how evidence matching
works before any match exists (Evidence Matches), a sample drafted answer in a clearly marked
demo state (AI Responses), an explanation of what triggers a review assignment (Review
Queue), and a description of available export formats even before the first export
(Exports).

## Navigation placement

`/trust/questionnaires` sits alongside, not inside, the existing 11 canonical modules listed
in CLAUDE.md (`CLAUDE.md:75-85`). Per the methodology skill's "exactly 11 modules" invariant,
adding a 12th top-level module requires documented justification in `docs/product/prd.md`
before being built — flagged here explicitly as an open question for whoever scopes the
implementation phase, not resolved by this docs-only batch. One reasonable resolution: Trust
OS surfaces (`/trust/*`) are a distinct top-level area outside the 11-module Universal
Governance Model navigation, analogous to how `/academy`, `/learning`, and other already-built
non-canonical-module routes coexist with the 11 modules today (confirmed present in
`apps/web/app/` listing during this audit) — but this document does not unilaterally decide
that; it surfaces the tension for the PRD update that should precede implementation.
