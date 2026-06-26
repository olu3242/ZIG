# Questionnaire OS — Entity Relationship Diagram

> Batch 12. Relationship map for the entities defined in `QUESTIONNAIRE_DATA_MODEL.md`,
> anchored against the existing Universal Governance Model spine
> (`Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence → Task
> → Report`, `CLAUDE.md:95`) so Questionnaire OS introduces no orphaned entity.

```
tenants (existing)
  └─ projects (existing)
       └─ questionnaires (NEW)
            ├─ vendor_id ──────────────► vendors (existing, optional)
            └─ questions (NEW)
                 ├─ responses (NEW)
                 │    └─ evidence_references (NEW join)
                 │         └─ evidence_id ──► evidence (existing)
                 │                              └─ control_id ──► controls (existing)
                 └─ control_references (NEW join)
                      └─ control_id ──► controls (existing)
                           └─ control_mappings (existing, via ControlService.findMappings)
                                └─ frameworks (existing)
                                     └─ framework_requirements (existing)
                      (denormalized into) framework_references (NEW)

questionnaires (NEW)
  └─ trust_reviews (NEW)      stage: compliance | security | legal
  └─ approvals (NEW)          final sign-off, gated on all trust_reviews = approved
```

## Cardinality

| Relationship | Cardinality |
|---|---|
| Questionnaire → Question | 1 → many |
| Question → Response | 1 → many (a question may be answered more than once across revisions; the response engine, Batch 16, treats the latest non-superseded response as current) |
| Question → ControlReference | 1 → many (a question can map to more than one control, e.g. an MFA question maps to both an Access Control and an Identity Management control) |
| Response → EvidenceReference | 1 → many |
| EvidenceReference → `evidence` (existing) | many → 1 |
| ControlReference → `controls` (existing) | many → 1 |
| ControlReference → FrameworkReference | 1 → many (one control can satisfy multiple framework requirements, mirroring the existing `control_mappings` crosswalk) |
| Questionnaire → TrustReview | 1 → many (one row per review stage) |
| Questionnaire → Approval | 1 → 1 (final approval is a single record once all review stages clear) |

## How this connects to the Universal Governance Model

CLAUDE.md's invariant (`CLAUDE.md:95`, restated in the methodology skill) requires every
entity to sit on the `Organization → Project → Asset → Risk → Control → Framework
Requirement → Evidence → Task → Report` chain — no orphans. Questionnaire OS entities attach
as follows:

- `Questionnaire` hangs off `Project` (and optionally `Vendor`, itself a tenant-scoped
  record), not off nothing — it is never a tenant-root entity.
- `Question` → `ControlReference` → `controls` is the questionnaire-specific entry point onto
  the existing `Control` node of the chain.
- `EvidenceReference` → `evidence` is the entry point onto the existing `Evidence` node.
- `FrameworkReference` → `framework_requirements` is the entry point onto the existing
  `Framework Requirement` node.
- The chain's `Risk` and `Asset` nodes are intentionally **not** directly referenced by
  Questionnaire OS v1 — a question maps to a control, and that control may itself be mapped
  to assets/risks through the existing `ControlService`/`RiskService` relationships, so
  Questionnaire OS reaches Risk/Asset transitively rather than duplicating those joins.
- `Task` and `Report` are reached through the Export model (Batch 19) and the Trust Review
  workflow (Batch 18) respectively — an approved, exported questionnaire response package is
  itself a Report-shaped artifact in the spirit of the chain's terminal node, without writing
  into the existing `reports` table (which is scoped to Executive Reporting, a different
  module per `CLAUDE.md:85`).
