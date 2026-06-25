# AI Governance OS — Capability Audit (Batch 41)

## Purpose

Batches 1-10 (Trust OS harmonization), 11-20 (Questionnaire OS), 21-30 (Evidence OS), and
31-40 (Trust Center OS) built the scoring, response, evidence, and customer-facing
machinery of Trust OS. Batch 41-50 (AI Governance OS) is different in subject matter from
all of them: it does **not** govern Zig's own AI features (the AI Command Center, the
agent runtime, recommendation generators). It governs the **customer organization's use of
third-party and internal AI systems** — ChatGPT, Claude, Copilot, custom LLMs, internal
agents the *customer* built — the same way the Asset Workspace governs the customer's
infrastructure assets, not Zig's own infrastructure.

This distinction matters because the codebase already contains a large, real "AI
governance" surface area that governs the **wrong subject** for this batch's purpose, and
it would be easy to mistake that surface for prior art. This audit separates the two
explicitly.

Classification legend (same convention as `TRUST_OS_CAPABILITY_AUDIT.md`,
`EVIDENCE_OS_AUDIT.md`, `TRUST_CENTER_OS_AUDIT.md`):

| Status | Meaning |
|---|---|
| EXISTS | Implemented and usable as-is, for this purpose |
| PARTIAL | Some building block exists but not for this purpose, or is incomplete |
| MISSING | Nothing in the codebase addresses this |

## Method

Grounded in direct reads of the current codebase on `main`, not assumption:

- `packages/ai-governance/src/index.ts` (read in full — 14 lines, see Finding 1)
- `supabase/migrations/*.sql` (grepped for `ai_system`, `ai_governance`, `ai_risk`,
  `ai_model`, `ai_asset` — zero matches; see Finding 2)
- `packages/knowledge-graph/src/index.ts`, `packages/governance/`, `packages/evidence/`
- Read-only review of `origin/docs/trust-os-batches-1-10` (`TRUST_SCORE_MODEL.md`,
  `TRUST_KNOWLEDGE_GRAPH.md`), `origin/docs/trust-os-batches-11-20`
  (`CONFIDENCE_SCORING_MODEL.md`), `origin/docs/trust-os-batches-21-30`
  (`EVIDENCE_HEALTH_MODEL.md`, `EVIDENCE_REUSE_MATRIX.md`), `origin/docs/trust-os-batches-31-40`
  (`TRUST_CENTER_OS_AUDIT.md`, `TRUST_CENTER_OS_MVP.md`)
- `zig-governance-os/docs/frameworks/` (six files: `iso27001.md`, `soc2.md`, `nist-csf.md`,
  `cis-controls.md`, `hipaa.md`, `pci-dss.md`, plus `universal-governance-model.md` — no
  ISO 42001 file; see Finding 5)
- `apps/web/app/` route tree (no `trust/` directory yet, confirmed consistent with PR #10
  being mid-flight at the time of this audit)

## Finding 1 — `packages/ai-governance/src/index.ts` is a 14-line stub governing Zig's own agents, not customer AI systems

Read in full:

```ts
export interface AiGovernancePolicy {
  agentPermissions: string[];
  approvalRequired: boolean;
  piiProtection: boolean;
  auditLogging: boolean;
  promptGovernance: boolean;
  modelGovernance: boolean;
}

export class AiGovernanceLayer {
  canExecute(policy: AiGovernancePolicy): boolean {
    return policy.auditLogging && policy.piiProtection && !policy.approvalRequired;
  }
}
```

This is a pure function with no persistence, no service wrapper, and no caller found
anywhere in `packages/*/src/`. Its shape (`agentPermissions`, `approvalRequired`,
`piiProtection`, `auditLogging`, `promptGovernance`, `modelGovernance`) describes a policy
gate for **Zig's own internal agent runtime** — the same domain as `governed_agents` and
its satellite tables in `supabase/migrations/202606180009_agent_governance_os.sql` (RACI,
handoffs, memory policies, approval workflows, certification, risk register, self-healing,
scorecards, audit traces, FinOps metrics, SOC events). It has no field for which AI
*provider* (OpenAI, Anthropic, Microsoft), which *model*, which *department* uses it, or
what *data types* it processes — the minimum shape an AI inventory record needs. **It is
real code, but it answers "should one of Zig's own agents be allowed to execute," not
"what AI systems does this customer use and how risky are they."** Classified MISSING for
AI Governance OS's actual purpose, despite being real, non-trivial, wired-adjacent code for
a different purpose.

## Finding 2 — No AI inventory/risk/control tables exist anywhere in `supabase/migrations/`

Grepped all migration files matching `*agent*`
(`202606180008_learning_agent_workforce.sql`, `202606180009_agent_governance_os.sql`,
`202606180010_agent_production_convergence.sql`) plus a full-repo grep for
`ai_system|ai_governance|ai_risk|ai_model|ai_asset` across `supabase/migrations/`: zero
matches for anything resembling an AI System, AI Model, AI Risk, or AI Control table. Every
`agent_*` table found (`governed_agents`, `agent_raci_assignments`, `agent_handoffs`,
`agent_memory_policies`, `agent_approval_workflows`, `agent_certifications`,
`agent_risk_register`, `agent_self_healing_events`, `agent_scorecards`,
`agent_audit_traces`, `agent_finops_metrics`, `agent_soc_events`) is keyed off
`governed_agent_id` referencing `governed_agents`, and every row in that table is
Zig-internal-agent shaped (`agent_key`, `agent_type`, `owner`, `supervisor`, `tools`,
`certification_level`) — there is no `provider`, `vendor`, `is_customer_owned`, or similar
discriminator that would let these tables double as a customer AI inventory without a
structural redefinition. **MISSING** for AI Governance OS.

## Finding 3 — PR #7's Trust Knowledge Graph sketches the AI branch but does not build it

`TRUST_KNOWLEDGE_GRAPH.md` (Batch 5) already proposes the exact spine this batch needs:

```text
Project -> AI Asset -> AI Risk -> AI Control -> AI Evidence -> AI Trust Score   [future, sketched below]
```

with a stage-by-stage mirror table (AI Asset mirrors Asset, AI Risk mirrors Risk, etc.) and
an explicit note that AI Control "modeled directly on the existing governed-agent pattern
already proven for Zig's own internal agents (`governed_agents`...)" — i.e., the prior
audit already anticipated reusing the *pattern*, not the *table*, of `governed_agents`.
Nothing under this sketch has been implemented: no `ai_assets`, `ai_risks`, `ai_controls`,
or `ai_decisions` table exists. **PARTIAL** — the design exists and is sound; the
implementation does not.

`TRUST_SCORE_MODEL.md` (Batch 9) already reserves a 10-point "AI Governance" weight in the
Trust Score formula and explicitly states it "defaults to 0/unscored" until "the AI
Asset/Risk/Control model from `TRUST_OS_DATA_MODEL.md`" exists. This batch is what fills
that placeholder. **PARTIAL** (weight reserved, computation missing).

## Finding 4 — Questionnaire OS and Evidence OS patterns are directly reusable, not yet applied to AI

`CONFIDENCE_SCORING_MODEL.md` (Batch 17) establishes the precedent of a scoped,
non-colliding score with an explicit reconciliation table against Trust Score and
Governance Score. `EVIDENCE_HEALTH_MODEL.md` (Batch 25) establishes the precedent of
auditing existing engines before proposing a new formula, and of never silently fabricating
a score for unpopulated data. Both patterns are reused directly in this batch (see
`AI_TRUST_SCORE_MODEL.md` and `AI_EVIDENCE_MAPPING_MODEL.md`) rather than re-derived.
**EXISTS** as reusable methodology; **MISSING** as an AI-specific application of it.

## Finding 5 — ISO 42001 does not exist anywhere in the codebase or any prior Trust OS batch

`docs/frameworks/` contains exactly seven files: `universal-governance-model.md`,
`iso27001.md`, `soc2.md`, `nist-csf.md`, `cis-controls.md`, `hipaa.md`, `pci-dss.md`. No
`iso42001.md`, no AI-management-system framework file. A grep of all four prior Trust OS
batch branches (`origin/docs/trust-os-batches-1-10` through `-31-40`) for `ISO 42001` /
`ISO42001` returns zero matches. **MISSING.** Batch 45 (`AI_GOVERNANCE_CONTROLS_LIBRARY.md`)
flags this gap explicitly rather than inventing ISO 42001 seed content (clause numbers,
control text) that has no basis anywhere in this repository. NIST AI RMF is referenced only
as a named framework in this batch's brief, not as an existing seeded framework either —
the same caveat applies and is flagged the same way.

## Finding 6 — No `/trust` route tree exists yet (consistent with PR #10 in flight)

`apps/web/app/` has no `trust/` directory. `TRUST_CENTER_OS_AUDIT.md` (Batch 31) confirms
this was already true at the time PR #10 was authored. This batch's dashboard doc
(`AI_GOVERNANCE_DASHBOARD_MODEL.md`) specifies `/trust/ai-governance` as a route that
composes under Trust Center OS's information architecture once built — it does not assume
the route exists today, and does not build it.

## Summary table

| Capability area | Status |
|---|---|
| AI inventory data model (AI System/Model/Provider/Owner/etc.) | MISSING |
| AI registry lifecycle (Request→Review→Approve→Register→Monitor→Retire) | MISSING |
| AI risk engine (8 domains) | MISSING |
| AI controls library mapped to frameworks | MISSING (and ISO 42001 itself is missing as a seeded framework) |
| AI Trust Score computation | MISSING (weight reserved in Trust Score formula, Batch 9) |
| AI decision registry | MISSING |
| AI evidence mapping | MISSING (Evidence OS entities/lifecycle exist and are reused, not duplicated) |
| `/trust/ai-governance` dashboard route | MISSING (no `/trust` tree exists yet at all) |
| Zig-internal agent governance (`governed_agents` family) | EXISTS, but governs the wrong subject for this batch |
| `packages/ai-governance` policy gate | EXISTS as code, MISSING as customer AI inventory/risk capability |
| Trust Knowledge Graph AI branch design | PARTIAL — sketched in Batch 5, not implemented |
| Reusable scoring/evidence methodology (Batches 9, 17, 25) | EXISTS, applied here rather than re-derived |

See `AI_GOVERNANCE_REUSE_MATRIX.md` for the per-component reuse/extend/build classification
that follows from these findings.
