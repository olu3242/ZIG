# Evidence OS — Mapping Model

> Batch 24. Relationships Evidence → Control → Framework → Assessment → Trust Score, with a
> worked example, built entirely on existing tables per the Batch 22 reconciliation decision.

## Relationship chain

```
Evidence Item (existing `evidence` table)
   │
   ▼ via control_evidence (existing, canonical per EVIDENCE_DATA_MODEL.md)
Control (existing `controls` table)
   │
   ▼ via control_mappings, read through ControlService.findMappings (existing, REUSE)
Framework Requirement (existing `framework_requirements` table)
   │
   ▼ via the existing `assessments` table (no service wraps it — confirmed in EVIDENCE_OS_AUDIT.md)
Assessment
   │
   ▼ feeds governance_scores.evidence_coverage (existing column), read through GovernanceService
Trust Score (TRUST_SCORE_MODEL.md, extends governance_scores)
```

Every node in this chain except "Assessment" (which needs a new `AssessmentService` wrapper,
flagged but not built here) is already backed by a real table and, for the Control and
Framework Requirement steps, a real existing service method.

## Worked example: MFA Screenshot → Access Control → SOC2 CC6 → ISO A.5

| Step | Concrete value | Source |
|---|---|---|
| Evidence Item | "MFA Configuration Screenshot — Okta Admin Console", `evidence.id = e1` | `evidence` table |
| Evidence Mapping | `control_evidence` row: `evidence_id = e1`, `control_id = c1` ("Multi-Factor Authentication — Privileged Access"), `coverage = 'supporting'` | `control_evidence` table |
| Control → Framework | `ControlService.findMappings(context, c1)` returns `control_mappings` rows linking `c1` to SOC 2 CC6 (Logical and Physical Access Controls) and ISO 27001 Annex A.5 (Access Control) | `ControlService.ts:12-14`, `control_mappings` table |
| Assessment | The control's effectiveness is captured in the existing `control_effectiveness` table (`effectiveness_score`, `maturity_score`) tied to the same `control_id = c1` | `control_effectiveness` table, `grc_core_engine.sql:123-135` |
| Trust Score contribution | `c1`'s effectiveness and its evidence's health (Batch 25) roll up into `governance_scores.evidence_coverage` and `governance_scores.controls_implemented` for the project, which are in turn two of the inputs to `TRUST_SCORE_MODEL.md`'s `EvidenceComponent`/`ControlsComponent` (weights 20/20) | `governance_scores` table, `TRUST_SCORE_MODEL.md` |

## What is genuinely new in this chain

Nothing. Every edge in the worked example above is either an existing table relationship or
an existing service method. The "mapping model" Evidence OS needed to define was entirely a
matter of choosing `control_evidence` as canonical (Batch 22's reconciliation) and reading
through `ControlService.findMappings` rather than inventing a parallel crosswalk — this batch
is documentation of an existing capability, not a new build.

## Gap: no AssessmentService

The one missing link is at the "Assessment" step: `assessments` table exists, nothing wraps
it. Until a future `AssessmentService` is built (out of scope here), `governance_scores`'s
`assessment_completion` column must be populated by whatever process currently writes it
(not traced further in this docs-only audit — flagged as an open question for the
implementation phase, consistent with how `TRUST_SCORE_MODEL.md` flagged the same gap for
Trust Score generally).
