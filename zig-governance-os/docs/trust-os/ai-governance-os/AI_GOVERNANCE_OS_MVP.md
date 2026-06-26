# AI Governance OS — MVP (Batch 50)

## User flow

```
Register AI System → Assess Risk → Apply Controls → Map Evidence → Score → Monitor → Review/Retire
```

| Step | Maps to | Detail |
|---|---|---|
| Register AI System | `AI_INVENTORY_DATA_MODEL.md`, `AI_REGISTRY_LIFECYCLE_MODEL.md` | User submits a Request; MVP collapses Request→Review→Approve into a single GRC Manager sign-off rather than the full three-stage queue, an MVP simplification explicitly flagged here, not a redefinition of the full lifecycle |
| Assess Risk | `AI_RISK_ENGINE_MODEL.md` | AI Risk Engine scores all 8 domains on first Register; MVP may start with manual likelihood/impact entry per domain rather than automated signal collection, with automated scoring as a fast-follow |
| Apply Controls | `AI_GOVERNANCE_CONTROLS_LIBRARY.md` | User marks each of the 7 control domains `not_implemented`/`planned`/`implemented`/`verified`; MVP ships with SOC 2 and ISO 27001 framework references only (the only two frameworks actually seeded in this repo) — NIST AI RMF and ISO 42001 references remain `null` until those frameworks exist anywhere in the platform |
| Map Evidence | `AI_EVIDENCE_MAPPING_MODEL.md` | User attaches existing `evidence` rows to AI Controls via the new join table; MVP reuses the Evidence Center's existing upload/link UI rather than building a new uploader |
| Score | `AI_TRUST_SCORE_MODEL.md` | AI Trust Score computed and shown per AI System, decomposed by component |
| Monitor | `AI_REGISTRY_LIFECYCLE_MODEL.md` | Periodic re-assessment cadence (MVP: manual "Re-assess now" action; automated cadence scheduling is a fast-follow, not MVP) |
| Review/Retire | `AI_REGISTRY_LIFECYCLE_MODEL.md` | Owner or GRC Manager retires an AI System; row preserved, never deleted |

## Screen inventory

| Screen | Section (per `AI_GOVERNANCE_DASHBOARD_MODEL.md`) | MVP scope |
|---|---|---|
| AI Inventory list/detail | AI Inventory | Full CRUD on AI System; filters by department, provider, risk_level, status |
| Register AI System form | AI Policy & Oversight | Single form covering AI System fields + initial Request |
| AI Risk breakdown | AI Risk | Per-system 8-domain table with likelihood/impact entry, aggregate risk_level display |
| AI Controls checklist | AI Controls | Per-system 7-domain checklist with status + framework reference display (SOC 2/ISO 27001 only, MVP) |
| AI Evidence linker | AI Evidence | Attach existing evidence rows to AI Controls |
| AI Trust Score detail | AI Trust Score | Per-system score breakdown by component, portfolio rollup |
| AI Decision log (read-only list) | AI Decision Registry | MVP ships as a read-only table seeded by manual entry or a future system integration — automated decision capture from live AI Systems is explicitly out of scope for MVP |
| Approval queue | AI Policy & Oversight | List of AI Systems in `under_review`/`approved`, with Approve/Reject actions |

## Explicit non-goals for MVP

- No automated decision capture from live third-party AI systems (ChatGPT/Claude/Copilot
  API hooks) — the AI Decision Registry ships as a manually-populated log first.
- No automated, scheduled re-assessment cadence — manual "Re-assess now" only.
- No NIST AI RMF or ISO 42001 seed content — both remain `null` framework references until
  a future framework-seeding batch adds them platform-wide (flagged, not solved, per
  `AI_GOVERNANCE_OS_AUDIT.md` Finding 5).
- No `departments` normalized table — `department` ships as free text on AI System, per
  `AI_INVENTORY_DATA_MODEL.md`.

## Non-duplication note — the still-open "12th module" question

`CLAUDE.md` enumerates exactly 11 product-surface modules and states: "Do not add
additional modules unless a clear gap is documented and justified in `docs/product/prd.md`
first." Whether AI Governance OS (and, before it, Questionnaire OS, Evidence OS, and Trust
Center OS) constitutes a new, twelfth module or is better understood as composing under
existing modules and Trust Center OS's `/trust` surface is **a question this batch does not
resolve**, consistent with how Batches 11-20, 21-30, and 31-40 each left the same question
open rather than deciding it unilaterally in a docs-only PR. `/trust/ai-governance`
(`AI_GOVERNANCE_DASHBOARD_MODEL.md`) is specified to compose under Trust Center OS's
information architecture specifically so that, whichever way the 12th-module question is
eventually resolved, this batch's design does not pre-empt or complicate that decision — it
neither claims a new top-level module slot nor assumes one will never be needed.

## Build sequence dependency

This MVP cannot start implementation until: the net-new tables (`ai_systems`,
`ai_providers`, `ai_models`, `ai_risks`, `ai_controls`, `ai_evidence_mappings`,
`ai_decisions`) are created via a migration, and `EvidenceService` (already exists, per
Batch 21's audit) is extended with a thin method for the `ai_evidence_mappings` join —
none of which is performed in this docs-only PR. The highest-leverage build order, per
`AI_GOVERNANCE_REUSE_MATRIX.md`: `ai_systems` first (every other table FKs into it), reuse
`agent_risk_register`'s and `agent_audit_traces`' column shapes for `ai_risks` and
`ai_decisions` respectively, and wire the AI Evidence join against the existing `evidence`
table last, since it depends on `ai_controls` already existing.
