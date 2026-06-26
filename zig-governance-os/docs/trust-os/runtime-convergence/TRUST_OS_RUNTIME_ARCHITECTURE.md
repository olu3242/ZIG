# Trust OS Runtime Architecture (Batches 61-70 — Runtime Convergence)

STATUS: Design document. Documentation only. No application code, no migrations, no
routes are introduced by this batch. This is the final harmonization wave: it reconciles
the six independently-produced Trust OS doc sets (PRs #7, #8, #9, #10, #12, #11 — see
"Source PRs" below) into one coherent runtime picture, grounded in fresh reads of all six
branches and fresh greps/reads of the current codebase on `main`.

## Source PRs reconciled by this document

| PR | Branch | Subsystem |
|---|---|---|
| #7 | `docs/trust-os-batches-1-10` | Trust OS harmonization (Trust Score Model, Trust Knowledge Graph, Trust Taxonomy, Trust Maturity Model) |
| #8 | `docs/trust-os-batches-11-20` | Questionnaire OS (Confidence Score) |
| #9 | `docs/trust-os-batches-21-30` | Evidence OS (Evidence Health Score) |
| #10 | `docs/trust-os-batches-31-40` | Trust Center OS (`/trust` portal, ZARA Trust, 9-section IA) |
| #12 | `docs/trust-os-batches-41-50` | AI Governance OS (AI Trust Score, customer AI inventory) |
| #11 | `docs/trust-os-batches-51-60` | Trust Intelligence OS (`/trust/intelligence`, predictive risk, Trust Certification) |

All six remain open/draft/unmerged on `origin`. This document does not merge them; it
describes the single runtime that would exist if all six were implemented as designed,
and is explicit everywhere about what is real code today versus documented-but-unbuilt.

## 1. The end-to-end flow

A single illustrative path through the system — a sales prospect requesting evidence of a
vendor's SOC 2 posture — touches every one of the six batches in this order:

```
External prospect opens /trust (Trust Center OS, PR #10)
        |
        v
Security Overview renders an externally-safe projection of the Trust Score
(read-only projection over governance_scores; PR #7's TRUST_SCORE_MODEL.md formula)
        |
        v
Prospect asks ZARA Trust a question ("are you SOC 2 certified, and how do you handle
encryption at rest?") -> AI Security Assistant (PR #10) reuses the Questionnaire
Response Engine's citation rule (PR #8) against an externally-safe evidence/control
corpus (PR #9's evidence taxonomy, exposure-classified)
        |
        v
If the prospect needs more than the public answer, they file an Access Request
(Customer Assurance Portal, PR #10) -> internally, this looks structurally like the
existing Evidence Request Workflow (PR #9's evidence_requests table design) but is a
distinct AccessRequest entity because the requester is external, not a tenant user
        |
        v
Internally, a tenant analyst answers a structured questionnaire about the same control
(Questionnaire OS, PR #8) -> QuestionnaireResponseEngine resolves question -> control ->
evidence via the REAL EvidenceService.findByControl(context, controlId)
(packages/services/src/EvidenceService.ts:5-7) and REAL ControlService.findMappings
(packages/services/src/ControlService.ts:12-14)
        |
        v
The response's Confidence Score (PR #8) is computed independently of, and does not
write into, governance_scores (PR #7's program-level Trust Score input)
        |
        v
Evidence backing the response is health-scored by one of two REAL, non-interoperable
engines (PR #9 audit finding, reconciled in TRUST_OS_DATABASE_ALIGNMENT.md of this
batch): EvidenceManagementEngine.health() (packages/evidence/src/index.ts:10-18,
review-status-driven, 6 states) or AutonomousEvidenceEngine.health()
(packages/autonomous-evidence/src/index.ts:12-20, freshness-window-driven, 5 states)
        |
        v
If the asset in question is an AI system the customer uses (not Zig's own agents),
AI Governance OS (PR #12) would track it as an AI Asset -> AI Risk -> AI Control ->
AI Evidence chain mirroring the Universal Governance Model, feeding a reserved-but-
unscored 10-point AI Governance weight in the Trust Score formula (PR #7,
TRUST_SCORE_MODEL.md) -- documented only; no ai_assets/ai_risks/ai_controls table
exists yet (PR #12 audit, Finding 2)
        |
        v
Trust Intelligence OS (PR #11) trends all of the above over time: Trust Analytics
(score trend), Predictive Trust Risk (drift/expiration before incident), Continuous
Assurance (ranked gap-by-impact), and the Recommendation Engine (ranked next action) --
all read-only consumers of the scores above, none of them redefine or recompute a score
        |
        v
If the org's sustained Trust Score band + Trust Maturity Model level qualifies, Trust
Certification Engine (PR #11, Batch 58) issues a Bronze/Silver/Gold/Platinum/Continuous
Trust badge -- explicitly disambiguated from the unrelated learner-level
certification-journeys/certification-readiness packages (see "Carried-forward
disambiguation" below)
        |
        v
Executive Intelligence (PR #11) and Compliance Center (PR #10) surface the certification
badge and Trust Score band back to the prospect and to the tenant's own executives
```

## 2. Real running code vs. documented-but-unbuilt — by subsystem

| Subsystem | Real code today | Documented-but-unbuilt |
|---|---|---|
| Governance/Trust scoring | `GovernanceScoreEngine.calculateScore()` (`packages/governance-engine/src/GovernanceScoreEngine.ts:27-41`), `governance_scores` table | Trust Score's full formula (Risk/Controls/Evidence/Audit/Vendor/AI Governance composite, PR #7) is a documented superset; only the Governance Score sub-component runs in code today |
| Evidence | `EvidenceService.findByControl()` (`packages/services/src/EvidenceService.ts:5-7`), `evidence`, `control_evidence`, `evidence_reviews`, `evidence_collections`, `evidence_jobs` tables, `EvidenceManagementEngine.health()`, `AutonomousEvidenceEngine.health()`, `agent-evidence-review` (real recommend-only agent) | Evidence health reconciliation (one canonical vocabulary), expiration alerting, evidence intelligence/discovery, exposure classification for external sharing |
| RBAC | `RbacEngine`/`can()`/`canView`/`canCreate`/`canEdit`/`canDelete`/`canApprove` (`packages/governance-engine/src/rbac/RbacEngine.ts`), 13 internal roles, tenant-session-only RLS pattern | External/anonymous-viewer RLS variant, signed-token access pattern, NDA gating — all needed by Trust Center OS and not yet modeled in `RbacEngine` |
| Framework intelligence | `FrameworkRegistry` (`packages/framework-engine/src/FrameworkRegistry.ts`, 6 seeded frameworks: ISO 27001, NIST CSF, SOC 2, HIPAA, PCI DSS, CIS Controls), `FrameworkService.findAvailableFrameworks()`, `control_mappings` table | ISO 42001 (AI management system framework) does not exist as a seeded framework anywhere — required by AI Governance OS's controls library and explicitly flagged as missing, not invented, by PR #12 |
| Questionnaire | None — `vendors.questionnaire jsonb` is the only artifact, an unstructured per-vendor JSON array | The entire `questionnaires`/`questions`/`responses`/`question_control_map` data model, Confidence Scoring, Trust Review/Approval workflow, `/trust/questionnaires` UI |
| Trust Center | None — no `apps/web/app/trust/` directory exists on `main` | The full 9-section IA, `TrustCenterService`, `AccessRequestService`, `AssistantService` (ZARA Trust), external RLS pattern |
| AI Governance OS | `packages/ai-governance`'s 14-line `AiGovernanceLayer.canExecute()` exists but governs Zig's own agent execution gate, not customer AI inventory (see `TRUST_OS_AGENT_ARCHITECTURE.md` in this batch for the disambiguation) | AI inventory/risk/control/decision tables, AI Trust Score computation (weight reserved, unscored), `/trust/ai-governance` route |
| Trust Intelligence | None named "Trust Intelligence" — closest real analogs are `framework-engine` (real mapping logic) and `autonomous-risk` (real weighted prioritizer), both read-only inputs | Trust Analytics, Predictive Trust Risk, Continuous Assurance, Recommendation Engine, Trust Benchmark, Trust Certification Engine, Executive Intelligence, `/trust/intelligence` route |
| Agent runtime (Zig's own) | Real and substantial: `AgentRuntime`/`AgentIngestion`/`RuntimeQueue`/`RuntimePersistence` (`packages/agent-runtime`), `AgentGovernanceGuard` wrapping `RbacEngine` (`packages/agent-governance`), `agent-evidence-review`, `agent-trigger-automation`, `governed_agents` table family (RACI, handoffs, memory policies, approvals, certifications, risk register, self-healing, scorecards, audit traces, FinOps, SOC events) | Not a Trust OS gap at all — this is Zig's own internal agent infrastructure, in scope for `TRUST_OS_AGENT_ARCHITECTURE.md` (this batch) but out of scope for AI Governance OS (PR #12), which governs the *customer's* AI, not Zig's own (see Finding 1 of PR #12's audit, carried forward unchanged) |

## 3. Carried-forward disambiguations (not re-opened by this batch)

- **AI Governance OS vs. Zig's own agent runtime** (PR #12, Finding 1): `packages/ai-governance` is Zig-internal agent policy, not customer AI inventory. Carried forward unchanged; restated with full detail in `TRUST_OS_AGENT_ARCHITECTURE.md`.
- **Trust Certification vs. learner certification** (PR #11, Batch 58): `certification-journeys`/`certification-readiness` are individual/learner-level; Trust Certification Engine is organization/tenant-level. Carried forward unchanged, not redefined here.
- **Governance/Risk "assessment" vs. learning "assessment"** (PR #7 Batch 1, restated by PR #8 and #9 audits): `assessments`/`risk_assessments` tables (governance) vs. `AssessmentEngine`/`AssessmentOS`/`learning_assessments` (learning). Carried forward unchanged.

## 4. Strategic framing — target category and capability chain

**Target category: "Continuous Trust & AI Assurance"** — explicitly not "GRC Software"
(implies static, periodic, audit-driven) and not "AI Governance Software" (implies the
product is only about AI; AI Governance OS is one of six Trust OS pillars, not the whole
product). The category name must reflect that Trust OS is continuous (Trust Intelligence
OS's system-of-intelligence framing, not system-of-record) and spans both traditional
governance assurance and AI-specific assurance as siblings under one Trust Score.

**Capability chain, mapped to which batch delivers each link:**

| Capability link | Delivered by | Real code today? |
|---|---|---|
| Teach Trust | Trust Center OS (PR #10) — Documentation Center, Compliance Center education content | No — `/trust` does not exist |
| Assess Trust | Questionnaire OS (PR #8) — structured questionnaire response with Confidence Score | No — only `vendors.questionnaire jsonb` exists |
| Build Trust | Trust OS harmonization (PR #7) — Trust Score Model, Trust Maturity Model, the underlying Asset->Risk->Control chain | Partial — `GovernanceScoreEngine` is real; full Trust Score composite is documented only |
| Evidence Trust | Evidence OS (PR #9) — Evidence Health Score, evidence lifecycle | Partial — `EvidenceService`, `EvidenceManagementEngine`, `AutonomousEvidenceEngine` are real; reconciliation, expiration alerting, discovery are not |
| Prove Trust | Trust Center OS (PR #10) — Customer Assurance Portal, externally-safe evidence projection | No |
| Monitor Trust | Trust Intelligence OS (PR #11) — Continuous Assurance, Trust Analytics | No — closest real analog is `autonomous-risk`'s weighted prioritizer, a different subsystem reused as an input |
| Predict Trust Risk | Trust Intelligence OS (PR #11) — Predictive Trust Risk Model | No |
| Certify Trust | Trust Intelligence OS (PR #11) — Trust Certification Engine, fed by AI Governance OS's AI Trust Score for AI-specific posture | No |

AI Governance OS (PR #12) does not occupy its own link in this chain — it is a
**parallel, AI-specific instance of the Build Trust -> Evidence Trust -> Certify Trust
spine**, contributing the AI Asset->Risk->Control->Evidence->Score chain and the reserved
AI Governance weight inside the Trust Score, rather than a ninth standalone link. This is
the runtime-convergence finding that ties PR #12 cleanly into the eight-link chain instead
of treating it as a free-floating ninth pillar.

See `TRUST_OS_COMPONENT_MAP.md` for the full per-component inventory underlying this
picture, `TRUST_OS_DATABASE_ALIGNMENT.md` for the reconciled schema, and
`TRUST_OS_UI_ARCHITECTURE.md` for the resolved route tree and 12th-module question.
