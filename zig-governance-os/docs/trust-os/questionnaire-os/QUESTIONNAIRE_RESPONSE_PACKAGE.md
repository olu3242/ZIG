# Questionnaire OS — Response Package Schema

> Batch 19. The canonical structure exported in every format in `EXPORT_MODEL.md`.

```
QuestionnaireResponsePackage
├── questionnaire
│   ├── id, name, status, vendor_id (nullable), project_id
│   ├── aggregate_quality_score   (mean of all Response.confidence_score, RESPONSE_QUALITY_MODEL.md)
│   └── approval
│       ├── status, approver, decided_at
│       └── trust_reviews[]       (stage, reviewer, status, notes, reviewed_at)
└── responses[]
     ├── question
     │    ├── text, domain, classification
     ├── answer_text
     ├── confidence_score, quality_label
     ├── supporting_controls[]    (control name, category, from ControlReference → controls)
     ├── supporting_evidence[]    (evidence title, source_uri, relevance_note, matching tier)
     └── framework_mapping[]      (framework name, requirement id/name)
```

## Field provenance (every field traceable to a real source)

| Package field | Source |
|---|---|
| `questionnaire.*` | `questionnaires` table (new) |
| `aggregate_quality_score` | computed, not stored — derived at export time from `responses[].confidence_score` |
| `approval.*` | `approvals`, `trust_reviews` tables (new) |
| `responses[].question.*` | `questions` table (new) |
| `responses[].answer_text` | `responses.answer_text` (new) |
| `responses[].confidence_score` | `responses.confidence_score` (new), per `CONFIDENCE_SCORING_MODEL.md` |
| `supporting_controls[]` | `control_references` (new) joined to existing `controls` table |
| `supporting_evidence[]` | `evidence_references` (new) joined to existing `evidence` table |
| `framework_mapping[]` | `framework_references` (new) joined to existing `frameworks`/`framework_requirements` |

No field in this package is fabricated at export time — every value is either a stored
column or a deterministic aggregate (mean) of stored columns, consistent with the
explainability and no-hallucination rules established in `QUESTIONNAIRE_RESPONSE_ENGINE.md`.
