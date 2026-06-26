# Trust OS Convergence Matrix

> Batch 2. One row per target Trust capability, mapped to its existing Zig counterpart
> (cited), the convergence action, and the specific artifact(s) it must converge onto or
> produce. This is the single-glance companion to `TRUST_OS_HARMONIZATION_PLAN.md`.

| Trust capability | Existing Zig capability | Evidence | Action | Converges onto |
|---|---|---|---|---|
| Questionnaire Agent | `vendors.questionnaire jsonb` | `supabase/migrations/202606190002_mvp_convergence_schema.sql:93` | Build | New `questionnaires`/`questions`/`responses` tables; reuses `vendors` as subject; AI generation reuses AI Command Center explainability pattern (`CLAUDE.md:122-125`) |
| Evidence Vault | `EvidenceService`, `evidence`, `evidence_collections`, `evidence_reviews`, `control_evidence` | `packages/services/src/EvidenceService.ts:4`; `supabase/migrations/202606180001_batch_21_core_data_platform.sql:190-202`; `202606180005_grc_core_engine.sql:111-121,229-240` | Extend | New methods on `EvidenceService` (expiry, framework-scoped retrieval); no new tables |
| Trust Score | `GovernanceService`, `governance_scores` | `packages/services/src/GovernanceService.ts:4`; `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298` | Extend | `governance_scores` gains Vendor and AI Governance dimensions; Trust Score is the presentation name for the extended Governance Score (see `TRUST_SCORE_MODEL.md`) |
| Trust Center | `apps/web/app/compliance-command-center/`, `apps/web/app/executive-assurance/` | direct route listing, `apps/web/app/` | Build (UI only) | Read-only surface composing Trust Score, Evidence Vault, Framework coverage, Certification status — zero new business logic |
| AI Governance | `governed_agents`, `agent_certifications`, `agent_audit_traces`, `agent_ledger`, `packages/ai-governance/src/index.ts` | `supabase/migrations/202606180009_agent_governance_os.sql:55-94`; `packages/ai-governance/src/index.ts:1-14` | Build (pattern reuse) | New `ai_assets`/`ai_risks`/`ai_controls`/`ai_decisions` modeled directly on the governed-agent → certification → audit-trace → evidence pattern already proven for Zig's internal agents |
| Trust Knowledge Graph | `docs/convergence/governance-graph.md`, `docs/convergence/knowledge-graph.md`, `packages/knowledge-graph/src/index.ts` | doc files above; `packages/knowledge-graph/src/index.ts:1-12` | Extend | Implements the already-specified Governance Graph spine, adding only a Trust Score node and an AI Asset→AI Risk→AI Control→AI Evidence→AI Trust Score branch |
| Vendor Risk Management | `vendors` table, `apps/web/app/vendors/` | `supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`; route listing | Extend | New `VendorService` (service-layer gap only); wraps existing table |
| Certification (compliance) | `certifications`, `user_certifications` | `supabase/migrations/202606190003_mvp_plus_launch_schema.sql:51-67` | Extend | Add `certification_type` discriminator column; no parallel table |
| Audit engagement tracking | `audits`, `audit_findings`, `audit_programs`, `audit_remediations` | `supabase/migrations/202606180001_batch_21_core_data_platform.sql` (audits family) | Extend | New `AuditEngagementService` wraps existing tables; existing `AuditService` (audit-log writer) is untouched and renamed in docs only if needed for clarity, never merged |
| Governance, Risk, Control core | `GovernanceService`, `RiskService`, `ControlService`, `FrameworkService` | `packages/services/src/{GovernanceService,RiskService,ControlService,FrameworkService}.ts` | Reuse | No change — Trust OS reads through these services as-is for its Governance/Risk/Controls Trust Score dimensions |

## Zero-duplication checklist

Every row above was checked against this rule before being marked Extend/Build/Reuse: *if
a service, table, or doc with matching intent already exists, the row must say Extend or
Reuse — Build is reserved for rows where Batch 1 found nothing under any name.* Three rows
are marked **Build (pattern reuse)** rather than plain **Build** specifically because an
analogous architecture already exists elsewhere in the codebase (AI Governance mirrors the
governed-agent pattern; Trust Knowledge Graph mirrors the already-specified Governance
Graph; Questionnaire Agent mirrors the `BaseService<T>` + AI Command Center pattern) — none
of the three introduces a structurally new kind of system.
