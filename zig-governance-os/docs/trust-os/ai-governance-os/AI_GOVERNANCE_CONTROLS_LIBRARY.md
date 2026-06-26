# AI Governance OS — AI Controls Library (Batch 45)

> Batch 45. Defines 7 control domains mapped to NIST AI RMF, ISO 42001, SOC 2, and
> ISO 27001. **Explicit gap flag, stated up front per the task brief:** ISO 42001 does not
> exist as a seeded framework anywhere in this codebase or in any prior Trust OS batch
> (`AI_GOVERNANCE_OS_AUDIT.md` Finding 5 — confirmed by grep across `docs/frameworks/` and
> all four prior Trust OS branches). NIST AI RMF is similarly unseeded — only SOC 2 and
> ISO 27001 exist today as actual framework files (`docs/frameworks/soc2.md`,
> `docs/frameworks/iso27001.md`). This document maps the 7 control domains to all four
> named frameworks as the task requires, but does **not** invent ISO 42001 or NIST AI RMF
> clause numbers, control text, or seed data that has no basis in this repository — those
> two columns are explicitly marked as forward-looking framework references pending a
> future framework-seeding batch, not implemented mappings.

## The 7 control domains

| # | Control domain | Mitigates (AI Risk Engine domains, Batch 44) | Example control |
|---|---|---|---|
| 1 | **Human-in-the-loop review** | Hallucination, Safety, Bias | A human reviewer approves AI-generated content before it reaches a customer |
| 2 | **Output filtering & validation** | Hallucination, Copyright, Safety | Automated checks reject outputs containing fabricated citations or copyrighted text matches |
| 3 | **Access & permission scoping** | Security, Privacy | An AI System's tool/data permissions are scoped to least privilege, mirroring `governed_agents.permissions`'s existing pattern |
| 4 | **Data handling & retention** | Privacy, Compliance | PII is redacted from prompts before they reach a third-party model; logs retained per a documented policy |
| 5 | **Model evaluation & monitoring** | Bias, Hallucination, Operational Risk | Periodic bias/accuracy evaluation against a held-out test set; drift alerts on model version changes |
| 6 | **Vendor & provider due diligence** | Compliance, Operational Risk, Security | The AI Provider (Batch 42) has a signed DPA/BAA where required; provider's own security posture reviewed |
| 7 | **Incident response & escalation** | Safety, Security, Operational Risk | A documented path exists for an employee to report a harmful or incorrect AI output, with defined escalation SLAs |

## Framework mapping

| Control domain | SOC 2 | ISO 27001 | NIST AI RMF | ISO 42001 |
|---|---|---|---|---|
| Human-in-the-loop review | CC6 (logical access / change management family, per `docs/frameworks/soc2.md`) | A.5 (per existing mapping precedent in `CONFIDENCE_SCORING_MODEL.md`'s worked example) | *Govern / Manage functions — referenced by name only; not seeded in this repo* | *Not seeded — flagged gap, see header* |
| Output filtering & validation | CC7 (system operations) | A.8 (asset/operations controls) | *Map / Measure functions — referenced by name only* | *Not seeded* |
| Access & permission scoping | CC6 | A.9 (access control) | *Govern function — referenced by name only* | *Not seeded* |
| Data handling & retention | CC6 | A.8, A.18 (compliance/privacy-adjacent) | *Map function — referenced by name only* | *Not seeded* |
| Model evaluation & monitoring | CC7 | A.12 (operations security) | *Measure / Manage functions — referenced by name only* | *Not seeded* |
| Vendor & provider due diligence | CC9 (risk mitigation, vendor management) | A.15 (supplier relationships) | *Govern function — referenced by name only* | *Not seeded* |
| Incident response & escalation | CC7 | A.16 (incident management) | *Manage function — referenced by name only* | *Not seeded* |

SOC 2 and ISO 27001 clause references above follow the same precedent set in
`CONFIDENCE_SCORING_MODEL.md`'s worked example (mapping to "ISO 27001 A.5 and SOC 2 CC6")
and are illustrative groupings consistent with the existing framework docs' structure, not
verbatim seeded control IDs — `docs/frameworks/soc2.md` and `docs/frameworks/iso27001.md`
should be the source of truth once exact clause/control IDs are seeded at the framework
engine layer (`docs/architecture/framework-engine.md`, itself currently a stub per
`CLAUDE.md`'s status table).

## Data shape

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `tenant_id` | uuid | tenant-scoped |
| `ai_system_id` | uuid | FK to AI System |
| `control_domain` | text | one of the 7 domains above |
| `description` | text | what specifically this control implementation does |
| `status` | text | enum: `not_implemented`, `planned`, `implemented`, `verified` |
| `framework_refs` | jsonb | `{ "soc2": [...], "iso27001": [...], "nist_ai_rmf": null, "iso42001": null }` — frameworks with no seeded mapping are stored as `null`, never a fabricated value, per the same "never silently default to a misleading number" rule used in `TRUST_SCORE_MODEL.md` |
| `mitigated_risk_ids` | uuid[] | FK array back to `ai_risks` rows (Batch 44) this control addresses |

## Relationship to the existing Control entity

This is intentionally a **new, AI-specific control type** (`ai_controls`), not a reuse of
the platform's general-purpose `controls` table, because AI Controls need an
`ai_system_id` FK and `mitigated_risk_ids` pointing at `ai_risks` specifically — neither
of which the general Control Workspace's schema has reason to carry. This follows the same
reasoning `TRUST_KNOWLEDGE_GRAPH.md` (Batch 5) already gave for AI Control as "a typed
specialization" of Control, mirroring the existing Asset→Risk→Control spine node-for-node
rather than inventing a disconnected parallel ontology (`CLAUDE.md:107-109`).
