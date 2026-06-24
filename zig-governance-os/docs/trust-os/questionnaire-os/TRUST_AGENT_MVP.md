# Questionnaire OS — Trust Agent MVP

> Batch 20. MVP scope for the Questionnaire OS user-facing surface. This is a DESIGN
> SPEC ONLY — no route, component, or table described here is implemented in this PR. No
> `apps/web/app/trust/` directory exists today (re-verified in Batch 11); this defines what
> should exist there once an implementation phase begins, per CLAUDE.md's "never implement
> before documenting" rule.

## MVP scope (minimum to prove the loop end to end)

1. Upload one questionnaire (CSV or simple structured doc).
2. Parse into `Questionnaire` + `Question` rows.
3. Classify each question (Batch 13).
4. Map each question to candidate controls (Batch 14).
5. Find candidate evidence (Batch 15).
6. Draft an AI answer per question (Batch 16), each carrying a Confidence Score (Batch 17).
7. Route through Trust Review (Batch 18) — MVP may collapse this to a single "Review" stage
   rather than the full three-stage matrix, explicitly flagged here as an MVP simplification,
   not a redefinition of the full model in `TRUST_REVIEW_WORKFLOW.md`.
8. Export as Excel (MVP supports one format first; CSV/PDF/Word follow).

## Explicit non-goals for MVP

- No SharePoint/Confluence/Google Drive integration (that is Evidence OS's future-state
  discovery sources, Batch 26, not in scope for Questionnaire OS v1 at all).
- No multi-stage Compliance/Security/Legal review gating — single reviewer sign-off only.
- No bulk questionnaire upload (one at a time).
- No custom question domain/type taxonomy editing — the nine domains and five question types
  defined in Batches 13 are fixed for MVP.

## Build sequence dependency

This MVP cannot start implementation until: `EvidenceService`, `ControlService`,
`FrameworkService` (all already exist and are reused, per Batch 11) remain unchanged, and the
net-new tables in `QUESTIONNAIRE_DATA_MODEL.md` (`questionnaires`, `questions`, `responses`,
and the three reference join tables) are created via a migration — none of which is performed
in this docs-only PR.
