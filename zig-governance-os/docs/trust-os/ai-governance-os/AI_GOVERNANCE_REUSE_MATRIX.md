# AI Governance OS — Reuse Matrix (Batch 41)

> Companion to `AI_GOVERNANCE_OS_AUDIT.md`. Classified Exists / Partial / Missing, the same
> scheme used by `EVIDENCE_REUSE_MATRIX.md` (Batch 21) and `TRUST_CENTER_REUSE_MATRIX.md`
> (Batch 31).

| Component | Classification | Evidence |
|---|---|---|
| AI inventory record storage (AI System, Model, Provider, Owner, Department, Use Case, Data Types, Risk Level, Status) | **Missing** | No table found across `supabase/migrations/*.sql`. `packages/ai-governance/src/index.ts`'s `AiGovernancePolicy` shares zero fields with this shape (see Audit Finding 1) |
| AI registry lifecycle (Request→Review→Approve→Register→Monitor→Retire) | **Missing** | No service, no status enum, no workflow table found. The closest analog, `agent_approval_workflows`, is scoped to `governed_agent_id` (Zig-internal agents), not a customer AI system |
| AI risk engine (Bias, Hallucination, Privacy, Security, Compliance, Copyright, Safety, Operational) | **Missing, but pattern exists** | `agent_risk_register` (`risk_type`, `likelihood`, `impact`, `treatment`, `mitigation_plan`) is a directly reusable *shape* for AI Risk rows once repointed at an `ai_systems` table instead of `governed_agents` — see `AI_RISK_ENGINE_MODEL.md` |
| AI controls library (7 domains mapped to NIST AI RMF / ISO 42001 / SOC 2 / ISO 27001) | **Missing**, and **ISO 42001 itself is missing** as a seeded framework anywhere in this codebase or any prior Trust OS batch (Audit Finding 5) | `docs/frameworks/` has no ISO 42001 file; SOC 2 and ISO 27001 do exist (`soc2.md`, `iso27001.md`) and are mappable targets; NIST AI RMF is unseeded the same way |
| AI Trust Score computation | **Missing**, weight pre-reserved | `TRUST_SCORE_MODEL.md` (Batch 9) reserves 10/100 points for "AI Governance," explicitly `null`/excluded until this model exists — this batch fills that slot, see `AI_TRUST_SCORE_MODEL.md` |
| AI decision registry (Prompt/Input/Model/Output/Reviewer/Approval/Outcome) | **Missing, but adjacent pattern exists** | `agent_audit_traces` (`input_hash`, `output_hash`, `reasoning_summary`, `confidence`, `approvals`, `actions`) is structurally close but tracks Zig's own agent executions, not a customer's AI decision log — see `AI_DECISION_REGISTRY_MODEL.md` for why this is referenced as a pattern, not repointed as the same table |
| AI evidence mapping (AI Asset → AI Risk → AI Control → AI Evidence → AI Trust Score) | **Missing as an AI-specific chain, but the underlying Evidence OS machinery is Exists** | `evidence` table, `EvidenceService`, and the Evidence OS lifecycle (Created→Collected→Reviewed→Approved→Mapped→Used→Monitored→Expired→Archived, `EVIDENCE_DATA_MODEL.md` Batch 22) are real and reused directly for "AI Evidence" rather than building a parallel evidence model — see `AI_EVIDENCE_MAPPING_MODEL.md` |
| Trust Knowledge Graph AI branch | **Partial** | `TRUST_KNOWLEDGE_GRAPH.md` (Batch 5) sketches `AI Asset -> AI Risk -> AI Control -> AI Evidence -> AI Trust Score` node-for-node as a future branch; this batch is the first to specify it in implementable detail |
| `/trust/ai-governance` dashboard route | **Missing** | No `apps/web/app/trust/` directory exists at all yet (Audit Finding 6); this batch specifies the route to compose under Trust Center OS's IA once that tree is built, not a standalone area |
| Zig-internal agent governance (`governed_agents` and its 11 satellite tables) | **Exists, wrong subject** | Real, substantial, migration-backed system — reused here only as a *pattern reference* for shape (RACI, certification, risk register, audit trace), never as the literal table a customer's AI inventory writes to |
| Reusable scoring methodology (non-collision statement pattern) | **Exists** | `CONFIDENCE_SCORING_MODEL.md` (Batch 17) and `EVIDENCE_HEALTH_MODEL.md` (Batch 25) both established the "explicit non-collision statement + reconciliation table" format this batch reuses verbatim in `AI_TRUST_SCORE_MODEL.md` |

## What this means for AI Governance OS's build sequence

Unlike Evidence OS (which found three existing tables with the right shape but no service
layer) or Questionnaire OS, **AI Governance OS finds zero existing tables of the right
shape** — only patterns (`agent_risk_register`'s columns, `agent_audit_traces`'s columns,
the Evidence OS lifecycle, the Trust Score reconciliation format) worth copying. The
highest-leverage, lowest-risk build sequence once implementation begins: build the new
`ai_systems` inventory table first (Batch 42), since every other capability in this batch
— registry lifecycle, risk engine, controls library, AI Trust Score, decision registry,
evidence mapping — references an `ai_system_id` foreign key into it. Reuse the
`agent_risk_register` and `agent_audit_traces` column shapes when defining `ai_risks` and
`ai_decisions` respectively, and reuse `EvidenceService`/the `evidence` table directly for
AI Evidence rather than building `ai_evidence` as a parallel table.
