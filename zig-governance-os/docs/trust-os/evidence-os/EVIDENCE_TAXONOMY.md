# Evidence OS — Taxonomy

> Batch 23. Nine domains, deliberately identical to the nine domains used in
> `TRUST_TAXONOMY.md` (Batch 6) and `questionnaire-os/QUESTION_DOMAIN_LIBRARY.md` (Batch 13)
> — Evidence OS does not introduce a fourth/competing domain vocabulary. Ten evidence types.

## Domains (same nine as Trust Taxonomy / Question Domain Library)

| Domain | Existing evidence-relevant table(s) |
|---|---|
| Governance | `policies`, `policy_approvals`, `policy_attestations` |
| Risk | `risk_assessments`, `risk_snapshots` |
| Compliance | `frameworks`, `framework_requirements`, `compliance_snapshots`, `gap_assessments` |
| Security | `controls`, `control_evidence`, `control_effectiveness`, `control_tests` |
| Privacy | none dedicated — same gap identified in `TRUST_TAXONOMY.md`; privacy evidence today is filed as generic Policy-type evidence |
| Audit | `audits`, `audit_findings`, `audit_programs` |
| Vendor Risk | `vendors` (including `vendors.questionnaire jsonb`) |
| Business Continuity | none — same confirmed-missing gap as `TRUST_TAXONOMY.md` |
| AI Governance | `governed_agents`, `agent_certifications`, `agent_audit_traces` (internal-agent scope only, same gap as `TRUST_TAXONOMY.md`) |

## Evidence types

| Type | Maps to existing `evidence_types.source` value (if any) | Example |
|---|---|---|
| Policy | `manual_upload` or `generated` | Information Security Policy PDF |
| Procedure | `manual_upload` | Incident Response Runbook |
| Screenshot | `manual_upload` or `automation` | MFA configuration screenshot |
| Report | `import` or `api_integration` | Penetration test report |
| Configuration | `automation` or `cloud_sync` | Cloud IAM policy export |
| Certificate | `manual_upload` | SOC 2 Type II certificate |
| Assessment | derived from existing `assessments` table | Completed risk assessment |
| Log | `automation` or `cloud_sync` | Access log export |
| Contract | `manual_upload` | Vendor DPA |
| Training Record | `import` — the one legitimate Learning OS intersection noted in `EVIDENCE_OS_AUDIT.md` | Completed security-awareness training record from `learning_assessments` |

`evidence_types.source` (`supabase/migrations/202606180005_grc_core_engine.sql:221`) already
defines exactly the source vocabulary needed (`manual_upload`, `automation`,
`api_integration`, `cloud_sync`, `import`, `generated` — these are also the literal
`EvidenceSource` union type values in `packages/evidence/src/index.ts:1`). Evidence OS reuses
this vocabulary rather than inventing a new one; the ten Evidence Types above are a new
classification *orthogonal* to source (what kind of artifact, not how it arrived).

## Domain × Evidence Type is not a strict mapping

A Policy-type evidence item can belong to any of the nine domains (a Privacy policy, a
Governance policy, a BCM policy once that domain exists). The taxonomy therefore stores
`domain` and `evidence_type` as two independent fields on `Evidence Source`
(`EVIDENCE_DATA_MODEL.md`), not a single combined enum — consistent with how
`QUESTION_CLASSIFICATION_MODEL.md` (Questionnaire OS, Batch 13) treats domain and question
type as orthogonal dimensions for the same reason.
