# Trust OS Harmonization Plan

> Batch 2. Defines, for every target Trust capability, which existing Zig capability it
> maps onto (per `TRUST_OS_CAPABILITY_AUDIT.md`) and what action is required: **Extend**
> (real code/table exists, add to it), **Reuse** (real code/table exists and needs no
> change, only a new consumer), or **Build** (confirmed missing in Batch 1, genuinely
> net-new). No action in this plan duplicates an existing service, table, or route.

## Principle

Trust OS is not a new platform bolted onto Zig — it is the trust-facing layer of the same
Universal Governance Model (`Organization → Project → Asset → Risk → Control → Framework
Requirement → Evidence → Task → Report`, `CLAUDE.md:95`) and the same Governance Graph
already specified in `docs/convergence/governance-graph.md`. Every harmonization decision
below is judged against one question: **does extending an existing service/table get us
there, or is this capability truly absent from the codebase?** Per the Batch 1 audit, the
honest answer splits roughly evenly — strong governance core to extend, real gaps in
questionnaire/AI-governance/trust-surfacing to build.

## Harmonization decisions

### 1. Questionnaire Agent → **Build** (with reuse of vendor scaffolding)

- Batch 1 found: no `questionnaires`/`questions`/`responses` tables, no service, no route.
  The only existing artifact is `vendors.questionnaire jsonb`
  (`supabase/migrations/202606190002_mvp_convergence_schema.sql:93`).
- Decision: build a real `questionnaires`/`questions`/`responses` data model and a
  `QuestionnaireService` following the `BaseService<T>` pattern
  (`packages/services/src/BaseService.ts:3`), but reuse `vendors` as the entity a
  questionnaire is sent *about* rather than inventing a parallel vendor concept. The
  existing `vendors.questionnaire` jsonb column becomes a migration target (backfill into
  the new relational model), not a permanent second source of truth.
- AI generation of questionnaire responses should route through the existing AI Command
  Center pattern (`apps/web/app/ai-command/`) and the explainability standard already
  required of every AI recommendation (`CLAUDE.md:122-125`), not a separate AI surface.

### 2. Evidence Vault → **Extend**

- Batch 1 found: `EvidenceService` (`packages/services/src/EvidenceService.ts:4`),
  `evidence`, `evidence_collections`, `evidence_jobs`, `evidence_types`,
  `evidence_reviews`, and `control_evidence` tables are all real and working.
- Decision: extend `EvidenceService` with vault-specific query methods (expiry tracking,
  framework-scoped retrieval, reuse-across-controls index) rather than create a new
  `EvidenceVaultService`. The vault is a UI/retrieval pattern over existing evidence data,
  not a new storage layer.

### 3. Trust Score → **Extend**

- Batch 1 found: `governance_scores` table with `score`, `controls_implemented`,
  `evidence_coverage`, `risk_treatment`, `assessment_completion`, `explanation`
  (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`) and
  `GovernanceService` (`packages/services/src/GovernanceService.ts:4`) are real and
  working.
- Decision: Trust Score is **not** a second scoring system. It is the existing Governance
  Score with two added dimensions (Vendors, AI Governance) and a renamed external-facing
  presentation. See `TRUST_SCORE_MODEL.md` for the exact reconciliation.

### 4. Trust Center → **Build** (UI only — backed entirely by extended services)

- Batch 1 found: no `trust`/`trust-center` route exists, but `compliance-command-center/`
  and `executive-assurance/` are adjacent existing surfaces.
- Decision: build a new public/external-facing Trust Center route, but it is a read-only
  presentation layer over Governance Score (extended), Evidence Vault (extended), Framework
  coverage (reused as-is from `FrameworkService`/`framework_*` tables), and Certification
  status (reused from `certifications`/`user_certifications`, scoped to compliance
  certifications rather than learner credentials). No new scoring or evidence logic is
  introduced by the Trust Center itself.

### 5. AI Governance → **Build** (extending the existing internal-agent pattern)

- Batch 1 found: `packages/ai-governance/src/index.ts` is a 14-line policy gate with no
  persistence; `governed_agents`/`agent_certifications`/`agent_audit_traces`/`agent_ledger`
  govern Zig's *own* internal AI agents, not customer-facing AI systems.
- Decision: build `ai_assets`, `ai_risks`, `ai_controls`, `ai_decisions` tables and an
  `AiGovernanceService`, but model them directly on the existing internal agent-governance
  pattern (governed entity → certification level → audit trace → evidence) rather than
  inventing a new AI-governance shape. This is the one area of Trust OS that is mostly
  net-new, but it reuses an existing architectural pattern rather than a parallel one.

### 6. Trust Knowledge Graph → **Extend** (design already exists; implementation is missing)

- Batch 1 found: `packages/knowledge-graph/src/index.ts` is a 12-line type sketch with no
  persistence, but `docs/convergence/governance-graph.md` and
  `docs/convergence/knowledge-graph.md` already specify a complete Tenant→Project→Asset→
  Risk→Control→Framework→Evidence→Task spine with Knowledge Objects (Gap, Signal, Insight,
  Recommendation, Readiness State) and an explainability standard.
- Decision: Trust Knowledge Graph (Batch 5) must be presented as an **extension** of the
  already-documented Governance Graph — same nodes, same invariants, same explainability
  contract — adding only a Trust Score node and an AI Asset/Risk/Control/Evidence branch.
  Writing a second, parallel graph spec would directly violate the "no orphaned module"
  rule in `CLAUDE.md:163-164`.

### 7. Vendor Risk Management → **Extend**

- Batch 1 found: `vendors` table and `apps/web/app/vendors/` routes exist; no
  `VendorService` exists.
- Decision: build `VendorService` (a real gap at the service layer, not the data layer)
  following the `BaseService<T>` pattern, and connect it to the new Questionnaire data
  model from item 1. This is the one place "Build" and "Extend" overlap: the service is
  net-new, but it wraps an existing table rather than creating a new one.

### 8. Certification (compliance attestation tracking) → **Extend with scope split**

- Batch 1 found: `certifications`/`user_certifications` exist but are scoped to learner
  credentials; `certification_journeys` and `agent_certifications` are similarly
  off-target.
- Decision: do not create a parallel `compliance_certifications` table. Instead, extend the
  existing `certifications` table's scope with a `certification_type` discriminator
  (`learner_credential` vs. `compliance_attestation`) so Trust Center can query the same
  table for SOC 2/ISO 27001 attestation status without forking the schema.

## Summary verdict

| Capability | Action | Net-new surface area |
|---|---|---|
| Questionnaire Agent | Build | High — new tables, new service, new AI flow |
| Evidence Vault | Extend | Low — new query methods only |
| Trust Score | Extend | Low — two new score dimensions, no new storage shape |
| Trust Center | Build (UI only) | Medium — new route, zero new business logic |
| AI Governance | Build (reusing internal pattern) | High — new tables, new service |
| Trust Knowledge Graph | Extend | Medium — implement an already-fully-specified design |
| Vendor Risk Management | Extend | Low-Medium — new service over an existing table |
| Certification | Extend | Low — one new discriminator column |

Roughly half of Trust OS (Evidence Vault, Trust Score, Vendor Risk Management,
Certification, Trust Knowledge Graph) is extension of real, working code. The other half
(Questionnaire Agent, Trust Center UI, AI Governance) is genuinely net-new, but in every
case it follows an existing architectural pattern already proven elsewhere in the
codebase (`BaseService<T>`, the governed-agent model, the Governance Graph spec) rather
than introducing a new one.
