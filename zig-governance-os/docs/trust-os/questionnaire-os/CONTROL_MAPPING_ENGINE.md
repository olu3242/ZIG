# Questionnaire OS — Control Mapping Engine

> Batch 14. Defines the Question → Control → Evidence → Framework workflow and a worked
> example, grounded in the real existing services confirmed in Batch 11.

## Workflow

```
Question (classified, Batch 13)
   │
   ▼
Control Mapping Engine (NEW logic)
   │  resolves question.domain + question text → candidate control_id(s)
   ▼
ControlReference rows (NEW table, QUESTIONNAIRE_DATA_MODEL.md)
   │
   ├──► ControlService.findById(context, controlId)        [REUSE — packages/services/src/ControlService.ts]
   │
   ├──► ControlService.findMappings(context, controlId)     [REUSE — ControlService.ts:12-14]
   │       └─► control_mappings (existing table) → cross-framework crosswalk
   │
   └──► EvidenceService.findByControl(context, controlId)   [REUSE — packages/services/src/EvidenceService.ts:5-7]
           └─► evidence (existing table) → candidate evidence rows
                   │
                   ▼
           EvidenceReference rows (NEW join table)
```

The only genuinely new logic in this entire chain is the first arrow: text/domain →
candidate `control_id`. Every step after that calls an existing, already-verified service
method unchanged.

## Worked example: "Do you enforce MFA for all privileged access?"

| Step | Result | Source |
|---|---|---|
| 1. Classify | Domain = Security, Type = boolean | `QUESTION_CLASSIFICATION_MODEL.md` |
| 2. Map to control | Control: "Multi-Factor Authentication — Privileged Access" (an Access Control-category control) | NEW mapping logic — matches against `controls.name`/`controls.category` in the tenant's control library |
| 3. Find evidence | `EvidenceService.findByControl(context, controlId)` returns evidence rows with `control_id` = that control's id, e.g. an MFA configuration screenshot or an IdP policy export | REUSE, `EvidenceService.ts:5-7` |
| 4. Map to framework | `ControlService.findMappings(context, controlId)` returns `control_mappings` rows linking this control to: ISO 27001 Annex A.5 (Access Control) and SOC 2 CC6 (Logical and Physical Access Controls) | REUSE, `ControlService.ts:12-14` |
| 5. Compose response | Answer: "Yes — MFA is enforced for all privileged access via [IdP]." Supporting Controls: 1. Supporting Evidence: 1 (the screenshot). Framework Mapping: ISO 27001 A.5, SOC 2 CC6. | `QUESTIONNAIRE_RESPONSE_ENGINE.md` (Batch 16) |

## When mapping fails (no control exists)

For the two domains identified in `QUESTION_DOMAIN_LIBRARY.md` as having no control source
today (Business Continuity, customer-facing AI Governance), the Control Mapping Engine must
explicitly return "no control mapping available" rather than guessing a loosely related
control. The question then routes directly to Evidence Discovery (Batch 15) as an
`evidence_request`-type question with `ControlReference` left empty — this is a deliberate,
documented design choice, not an unhandled edge case, consistent with CLAUDE.md's "zero
empty states... but never a fabricated number/mapping" pattern already established for Trust
Score (`TRUST_SCORE_MODEL.md`'s null/excluded-dimension handling).

## Question → Control Relationship cardinality

See `QUESTION_CONTROL_RELATIONSHIPS.md` for the full relationship and multiplicity rules.
