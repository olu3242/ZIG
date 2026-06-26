# Questionnaire OS — Question/Control Relationships

> Batch 14. Multiplicity and lifecycle rules for the `ControlReference` join defined in
> `QUESTIONNAIRE_DATA_MODEL.md`.

## Multiplicity rules

- One question may map to **zero, one, or many** controls. Zero is valid and explicit (see
  `CONTROL_MAPPING_ENGINE.md`'s "when mapping fails" section) — never forced to one.
- One control may be the target of **many** questions, across many questionnaires and many
  tenants. `ControlReference` is per-tenant (carries `tenant_id`) so no cross-tenant leakage
  is possible even though the same conceptual control name ("MFA — Privileged Access") may
  recur across tenants' independently-created control libraries (consistent with
  `CLAUDE.md:98-103`'s mandatory tenant isolation).
- Mapping happens at the **Question** level, not the Response level
  (`QUESTIONNAIRE_DATA_MODEL.md`'s `ControlReference.question_id` FK) — every response to the
  same question reuses the same mapping rather than re-deriving it, which keeps the mapping
  stable and auditable across questionnaire revisions.

## Lifecycle

| Event | Effect on `ControlReference` |
|---|---|
| Question created/uploaded | No mapping yet (`status: unmapped`, implicit — no row exists) |
| AI mapping run | Inserts `ControlReference` row(s) with a confidence note (ties to explainability rule) |
| Human review accepts mapping | No change to the table; mapping is now "confirmed" via the question's own `review_status`, not a separate confirmation column — avoids a second parallel review-state field |
| Human review rejects/edits mapping | Existing `ControlReference` row(s) deleted/replaced; the AI's original guess is not preserved in this table (only the final, human-confirmed state) — full audit history of the AI's reasoning lives in the response engine's drafting log (Batch 16), not duplicated here |
| Control deleted from control library | `ControlReference.control_id` FK constraint (`on delete cascade` or `on delete set null`, an implementation decision) determines whether the mapping disappears or is flagged orphaned — flagged here as a decision for the implementation phase, not resolved in this docs-only batch |

## Relationship to Evidence and Framework references

`ControlReference` is the pivot: `EvidenceReference` (Batch 12) is keyed off `response_id`,
not directly off `ControlReference`, because the candidate evidence depends on which control
the response cites — but `FrameworkReference` is keyed off `control_reference_id` directly,
because framework mapping is a property of the control itself (via the existing
`control_mappings` table), independent of any particular response.
