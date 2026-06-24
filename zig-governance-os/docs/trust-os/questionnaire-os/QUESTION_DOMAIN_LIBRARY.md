# Questionnaire OS — Question Domain Library

> Batch 13. Nine question domains, deliberately identical to the nine Trust Taxonomy domains
> established in `TRUST_OS_VISION` work (`TRUST_TAXONOMY.md`, Batch 6) so Questionnaire OS
> does not introduce a second, conflicting domain vocabulary.

| Domain | Typical question pattern | Existing coverage status (from `TRUST_TAXONOMY.md`, re-confirmed in this session) | Primary control/evidence source |
|---|---|---|---|
| Governance | "Do you have a documented information security policy approved by leadership?" | EXISTS — `GovernanceService`, `governance_scores` | `policies`, `policy_approvals` |
| Risk | "Do you perform an annual risk assessment?" | EXISTS — `RiskService`, `risks`, `risk_assessments` | `risks`, `risk_assessments` |
| Compliance | "Are you SOC 2 Type II certified?" | EXISTS — `FrameworkService`, `frameworks`, `framework_requirements` | `frameworks`, `framework_mappings` |
| Security | "Do you enforce MFA for privileged access?" | EXISTS — `ControlService`, `controls`, `control_mappings` | `controls`, `control_evidence` |
| Privacy | "Do you have a documented data retention policy?" | MISSING as a first-class domain per `TRUST_TAXONOMY.md` — only `AiGovernancePolicy.piiProtection` boolean exists (`packages/ai-governance/src/index.ts:3`) | Falls back to `policies` (generic) until a dedicated privacy control type exists |
| Audit | "When was your last third-party penetration test?" | PARTIAL — `audits`, `audit_findings` tables exist, no `AuditEngagementService` | `audits`, `audit_findings` |
| Vendor Risk | "Do your sub-processors undergo security review?" | PARTIAL — `vendors` table exists, no `VendorService` | `vendors`, plus the new `EvidenceReference` join (Batch 12) |
| Business Continuity | "Do you have a documented disaster recovery plan with a tested RTO/RPO?" | MISSING — no table, service, or route found under any name (confirmed in `TRUST_TAXONOMY.md` and re-verified: no `bcm_*`/`disaster_recovery*` tables in `supabase/migrations/`) | No control source exists yet; questions in this domain can only resolve to `evidence_request` type (Batch 13 classification) pending a future BCM module |
| AI Governance | "Do you maintain an inventory of AI models in production and their risk classification?" | PARTIAL — `packages/ai-governance` policy gate and `governed_agents`/`agent_certifications` exist but are scoped to Zig's own internal agents, not customer AI systems (re-confirmed: no `ai_assets`/`ai_risks`/`ai_controls` tables found) | No customer-facing AI control source exists yet; same evidence_request fallback as BCM |

## Implication for the Control Mapping Engine (Batch 14)

Two of nine domains (Business Continuity, and customer-facing AI Governance) have **no**
control source to map into today. The Control Mapping Engine must therefore support a
question resolving to `evidence_request` type with no `ControlReference` at all, rather than
forcing every question through a control — this is reflected in the worked examples in
`CONTROL_MAPPING_ENGINE.md`.
