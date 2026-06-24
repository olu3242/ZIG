# Questionnaire OS — Export Model

> Batch 19. Export formats and contents for an approved questionnaire.

## Formats

| Format | Use case |
|---|---|
| Excel (.xlsx) | Most common vendor/customer requested format — one row per question, columns for Answer/Supporting Controls/Supporting Evidence/Framework Mapping/Confidence Score |
| CSV | Programmatic ingestion by the requesting party's own GRC tooling |
| PDF | Formal submission artifact, includes a cover page with Questionnaire metadata and aggregate quality score (`RESPONSE_QUALITY_MODEL.md`) |
| Word (.docx) | Editable submission format some enterprise security teams require |

## Existing export infrastructure — re-verified

`packages/services/src/exports/index.ts` exists as a directory under the canonical service
package. In this session it was confirmed to exist as a path but its specific export-format
support was not exhaustively traced beyond confirming the directory and entry file are
present — `IMPORT_EXPORT_PLATFORM_SPEC.md` (a pre-existing repo doc, not part of Trust OS)
describes import/export platform scope at a different level. **This document does not assert
that `exports/index.ts` already supports questionnaire export** — that determination is an
implementation-time task. If it already supports generic tabular export (Excel/CSV), the
questionnaire exporter should call through it rather than duplicating format-generation code;
if it does not, a questionnaire-specific exporter is net-new, consistent with
`QUESTIONNAIRE_REUSE_MATRIX.md`'s flagged uncertainty on this exact point.

## Export contents (all formats)

Per the task's spec, every export includes, per question:

1. Answer (`Response.answer_text`)
2. Evidence references (`EvidenceReference` rows, with `relevance_note`)
3. Control references (`ControlReference` rows)
4. Framework mapping (`FrameworkReference` rows)
5. Confidence Score (`Response.confidence_score`)

Plus questionnaire-level metadata: name, status, aggregate quality score, Trust Review
history (`TrustReview` rows, stage + status + reviewer), and final `Approval` record.

## Export gating

A questionnaire can only be exported once `Questionnaire.status = 'approved'` (per
`TRUST_REVIEW_WORKFLOW.md`'s gate). Exporting a `draft`/`in_progress`/`in_review`
questionnaire is permitted only as an explicitly labeled "Draft — Not Final" watermark export,
never silently presented as final.

See `QUESTIONNAIRE_RESPONSE_PACKAGE.md` for the exact package schema.
