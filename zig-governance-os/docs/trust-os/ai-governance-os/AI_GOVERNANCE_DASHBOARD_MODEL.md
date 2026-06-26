# AI Governance OS — Dashboard (Batch 49)

> Batch 49. Route `/trust/ai-governance`, 8 named sections. Per `AI_GOVERNANCE_OS_AUDIT.md`
> Finding 6, no `apps/web/app/trust/` directory exists yet anywhere in the codebase — this
> document specifies the route as composing **under Trust Center OS's information
> architecture** (PR #10, `origin/docs/trust-os-batches-31-40`) once that tree is built. It
> is not a competing top-level area, and does not assume `/trust` exists today.

## Composition under Trust Center OS

`TRUST_CENTER_OS_MVP.md` and `TRUST_CENTER_OS_AUDIT.md` (Batch 31) define the customer/
auditor-facing `/trust` portal with six sections: Security Overview, Compliance Center,
Documentation Center, Evidence Center, AI Security Assistant, Customer Assurance Portal.
`/trust/ai-governance` is a **new sub-route within that same `/trust` tree**, sitting
alongside those six — it is the operator-facing AI governance workspace (internal GRC/Risk
roles managing the customer organization's own AI inventory), distinct in audience from
the customer-facing "AI Security Assistant" section (which is itself about *Zig answering
trust questions using AI*, not about governing the customer's AI systems — a second
instance of the same naming-collision risk flagged in `AI_GOVERNANCE_OS_AUDIT.md` Finding
1, worth restating here: "AI Security Assistant" and "AI Governance OS" sound related but
address different subjects, and should not be merged or confused during implementation).

## The 8 named sections

| # | Section | Surfaces |
|---|---|---|
| 1 | **AI Inventory** | List/detail view of all AI Systems (`AI_INVENTORY_DATA_MODEL.md`) — filterable by department, provider, risk_level, status |
| 2 | **AI Risk** | The 8-domain risk breakdown per AI System (`AI_RISK_ENGINE_MODEL.md`), aggregate risk heatmap across the portfolio |
| 3 | **AI Controls** | The 7-domain controls library (`AI_GOVERNANCE_CONTROLS_LIBRARY.md`), implementation status per AI System, framework mapping coverage |
| 4 | **AI Assessments** | History of AI Risk Engine scoring runs per system, trend over time, due/overdue re-assessments per the Monitor lifecycle state |
| 5 | **AI Decision Registry** | Searchable log of logged decisions (`AI_DECISION_REGISTRY_MODEL.md`), filterable by decision_category, approval_status, outcome |
| 6 | **AI Evidence** | Evidence items mapped to AI Controls via the join table (`AI_EVIDENCE_MAPPING_MODEL.md`), reusing the Evidence Center's existing UI patterns rather than a new evidence browser |
| 7 | **AI Trust Score** | Per-system AI Trust Score breakdown (`AI_TRUST_SCORE_MODEL.md`), portfolio-level rollup, and its contribution to the project-level Trust Score's AI Governance dimension |
| 8 | **AI Policy & Oversight** | Registry lifecycle status (`AI_REGISTRY_LIFECYCLE_MODEL.md`) — pending Requests awaiting Review, Approve actions queue, ownership/oversight completeness |

## Why this section list does not duplicate Trust Center OS's sections

| AI Governance OS section | Distinct from Trust Center OS section | Why |
|---|---|---|
| AI Evidence | Evidence Center | AI Evidence is a filtered, AI-Control-scoped *view* over the same `evidence` table the Evidence Center already shows — same underlying data, different lens, not a separate store |
| AI Trust Score | Security Overview | Security Overview (per `TRUST_CENTER_OS_AUDIT.md`) is customer-facing trust posture generally; AI Trust Score is a specific, decomposable per-AI-system metric feeding into the broader org Trust Score, surfaced here for the internal operator audience |
| AI Policy & Oversight | Compliance Center | Compliance Center tracks framework compliance broadly; AI Policy & Oversight tracks the AI-specific registry workflow (Request/Review/Approve queue) which has no analog elsewhere in Trust Center OS |

## Zero empty states

Per `CLAUDE.md:127-128`, no section may render blank. Each of the 8 sections, when an
organization has zero registered AI Systems, must show: an explanation of what the section
will surface once AI Systems are registered, a "Register your first AI System" entry point
into the AI Registry lifecycle's Request state, and at least one illustrative example
record (consistent with the worked examples table in `AI_INVENTORY_DATA_MODEL.md`).
