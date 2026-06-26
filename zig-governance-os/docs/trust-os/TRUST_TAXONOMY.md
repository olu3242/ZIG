# Trust Taxonomy

> Batch 6. Nine trust domains, each mapped to its existing framework/module coverage found
> in Batch 1, so this taxonomy organizes existing capability rather than inventing parallel
> categories.

| Domain | Existing framework/module coverage | Status |
|---|---|---|
| **Governance** | `GovernanceService`, `governance_scores`, `recommendations` (`packages/services/src/GovernanceService.ts:4`; `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-300`); also the entire Universal Governance Model spine in `CLAUDE.md:95` | EXISTS — core, well covered |
| **Risk** | `RiskService`, `risks`, `risk_assessments`, `risk_treatments`, `risk_categories`, `risk_acceptances`, `risk_reviews`, `risk_snapshots` (`packages/services/src/RiskService.ts:4`) | EXISTS — core, well covered |
| **Compliance** | `FrameworkService`, `frameworks`, `framework_requirements`, `framework_mappings`, `framework_crosswalks`, `compliance_snapshots`, `gap_assessments` (`packages/services/src/FrameworkService.ts:4`) | EXISTS — framework metadata model is mature per CLAUDE.md's "frameworks are metadata" rule |
| **Security (Controls)** | `ControlService`, `controls`, `control_mappings`, `control_evidence`, `control_effectiveness`, `control_tests` (`packages/services/src/ControlService.ts:4`) | EXISTS — core, well covered |
| **Privacy** | No dedicated table or service found anywhere in `packages/*/src` or `supabase/migrations/*.sql`. The only privacy-adjacent artifact is `AiGovernancePolicy.piiProtection` (`packages/ai-governance/src/index.ts:3`), a single boolean field. | MISSING — privacy is currently expressed only as metadata on frameworks (e.g. HIPAA per `CLAUDE.md:107`), not as its own domain with dedicated controls/evidence types |
| **Vendor Risk** | `vendors` table (`supabase/migrations/202606190002_mvp_convergence_schema.sql:85-97`), `apps/web/app/vendors/` routes — no `VendorService` | PARTIAL — table and UI exist, service layer is the gap (per `TRUST_OS_HARMONIZATION_PLAN.md` item 7) |
| **BCM (Business Continuity Management)** | No table, service, or route found under any name. BCM exists only as Learning OS curriculum content (`docs/learning/lessons/bcm_dr/`) and one artifact template (`docs/artifacts/BIA.md`, which states explicitly: "No dedicated `BCMService` exists on `main` today... a documented gap, not an invented service") | MISSING operationally — taught as a discipline in the Learning OS, not implemented as a governance module |
| **Audit** | `audits`, `audit_findings`, `audit_programs`, `audit_remediations`, `audit_responses` tables (`supabase/migrations/202606180001_batch_21_core_data_platform.sql`), `apps/web/app/audits/` route — no `AuditEngagementService` (the existing `AuditService` class is an audit-log writer, a different concept — `packages/services/src/AuditService.ts:3`) | PARTIAL — data model and UI exist, engagement service is the gap |
| **AI Governance** | `packages/ai-governance/src/index.ts:1-14` (single policy gate), `governed_agents`/`agent_certifications`/`agent_audit_traces` (`supabase/migrations/202606180009_agent_governance_os.sql:55-94`, scoped to Zig's own internal agents) | PARTIAL — pattern exists for internal agents, customer-facing AI asset governance is missing (see `TRUST_KNOWLEDGE_GRAPH.md` AI branch) |

## Cross-domain framework coverage check

CLAUDE.md names six frameworks as supported metadata: ISO 27001, SOC 2, NIST CSF, CIS
Controls, HIPAA, PCI DSS (`CLAUDE.md:107`). Mapped against the nine domains above:

| Framework | Domains it primarily exercises |
|---|---|
| ISO 27001 | Governance, Risk, Security (Controls), Compliance |
| SOC 2 | Security (Controls), Compliance, Audit |
| NIST CSF | Risk, Security (Controls) |
| CIS Controls | Security (Controls) |
| HIPAA | Privacy, Compliance, Security (Controls) |
| PCI DSS | Security (Controls), Compliance, Vendor Risk |

No framework in the current six maps meaningfully onto BCM or AI Governance — both domains
are coverage gaps for Zig's framework engine, not just for Trust OS. This confirms Batch 1's
finding that AI Governance is largely net-new, and additionally surfaces that **BCM is a
gap with no existing partial coverage at all**, unlike every other domain in this taxonomy.

## Taxonomy verdict

Of nine domains, four are fully covered by existing services (Governance, Risk, Compliance,
Security), two are partial (Vendor Risk, Audit — data exists, service layer doesn't), one is
nascent-pattern-only (AI Governance), and two are confirmed missing entirely (Privacy as a
first-class domain, BCM). Trust OS's build sequence (Batch 10) should prioritize the
partial domains (cheap to close) before the two fully-missing ones.
