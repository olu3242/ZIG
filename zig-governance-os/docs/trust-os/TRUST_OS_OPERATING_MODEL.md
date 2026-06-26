# Trust OS Operating Model

> Batch 4. Lifecycle: Policy → Control → Evidence → Assessment → Trust → Certification →
> Assurance. Each stage is tied to the real existing service/table/entity found in Batch 1
> — this is an operating model over existing infrastructure, not a new pipeline.

## The lifecycle

```
Policy → Control → Evidence → Assessment → Trust → Certification → Assurance
```

This sits directly downstream of the Universal Governance Model spine
(`Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence →
Task → Report`, `CLAUDE.md:95`) — Policy and Control are already nodes in that chain;
Trust, Certification, and Assurance are the new trust-facing stages Trust OS adds on top,
and Assessment is reconciled (not duplicated) per the naming-collision note in Batch 1.

## Stage-by-stage mapping to real services and tables

### 1. Policy

- **Existing infrastructure**: `policies`, `policy_approvals`, `policy_attestations`
  tables (`supabase/migrations/202606180005_grc_core_engine.sql:319+`).
- **Gap**: no `PolicyService` exists in `packages/services/src/factory.ts:15-39`.
- **Operating model role**: the organization's stated commitments — the top of the trust
  chain. A policy without an attestation record is a Trust Score gap (see
  `TRUST_SCORE_MODEL.md`).

### 2. Control

- **Existing infrastructure**: `ControlService` (`packages/services/src/ControlService.ts:4`),
  `controls`, `control_mappings`, `control_evidence`, `control_effectiveness`,
  `control_owners`, `control_reviews`, `control_tests` tables.
- **Operating model role**: the operational commitment that implements a policy and
  satisfies one or more framework requirements. `ControlService.findMappings()`
  (`ControlService.ts:10-12`) is how a control's framework coverage is read — Trust OS
  reuses this directly for framework-coverage display in the Trust Center.

### 3. Evidence

- **Existing infrastructure**: `EvidenceService` (`packages/services/src/EvidenceService.ts:4`),
  `evidence`, `evidence_collections`, `evidence_reviews`, `control_evidence` tables.
- **Operating model role**: proof a control exists and operates. `EvidenceService.findByControl()`
  (`EvidenceService.ts:6-8`) is the existing query; the Evidence Vault (Batch 2) extends
  this service with freshness/expiry tracking needed for continuous trust, since evidence
  that is true once and never reviewed again cannot support a continuously-current Trust
  Score.

### 4. Assessment

- **Existing infrastructure**: `assessments` and `risk_assessments` tables
  (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:228`; consumed via
  `RiskService.findAssessments()`, `RiskService.ts:10-12`) — **no dedicated service**.
- **Naming reconciliation**: this stage is the governance-assessment sense of the word, not
  the learner-competency sense (`AssessmentEngine`/`AssessmentOS`/`learning_assessments`,
  which belong to the Learning OS and are explicitly out of scope here — see Batch 1).
  Trust OS's Questionnaire Agent and any readiness assessment must be built against the
  `assessments`/`risk_assessments` tables, never against the learning-assessment engines.
- **Operating model role**: the structured evaluation step — does a control actually work,
  is a framework requirement actually met, is a vendor's risk posture actually acceptable.
  This is where Gap Assessments (`gap_assessments` table,
  `supabase/migrations/202606180005_grc_core_engine.sql:360-372`) and Compliance Snapshots
  (`compliance_snapshots`, `202606180006_production_convergence.sql:135-145`) already feed
  in.

### 5. Trust

- **Existing infrastructure**: `GovernanceService` and `governance_scores`
  (`packages/services/src/GovernanceService.ts:4`;
  `supabase/migrations/202606180001_batch_21_core_data_platform.sql:285-298`).
- **Net-new in this stage**: the Vendor and AI Governance score dimensions (see
  `TRUST_SCORE_MODEL.md`), and the externally-presentable Trust Center surface.
- **Operating model role**: the synthesis stage — every upstream stage (Policy, Control,
  Evidence, Assessment) rolls up into one explainable Trust Score, exactly the way
  `governance_scores.explanation` already requires an explanation field today.

### 6. Certification

- **Existing infrastructure**: `certifications`, `user_certifications` tables
  (`supabase/migrations/202606190003_mvp_plus_launch_schema.sql:51-67`), currently scoped
  to learner/professional credentials.
- **Net-new in this stage**: a `certification_type` discriminator distinguishing
  `compliance_attestation` (e.g. "SOC 2 Type II, issued by [auditor], valid through [date]")
  from `learner_credential`, so this stage can query the same table Zig already has rather
  than forking it (per `TRUST_OS_HARMONIZATION_PLAN.md` item 8).
- **Operating model role**: the externally-verifiable proof point a Trust Score
  contributes to, but does not replace — a high Trust Score supports a certification
  pursuit; a certification, once issued, is itself evidence feeding back into stage 3.

### 7. Assurance

- **Existing infrastructure**: the `audits`/`audit_findings`/`audit_programs`/
  `audit_remediations` table family (`supabase/migrations/202606180001_batch_21_core_data_platform.sql`),
  currently with no dedicated `AuditEngagementService` (the existing `AuditService` is an
  audit-log writer, a different concept — see Batch 1).
- **Net-new in this stage**: an `AuditEngagementService` wrapping the existing audit tables.
- **Operating model role**: the closing-the-loop stage — an external auditor's formal
  review of the same evidence and controls the Trust Score and Trust Center already
  expose, producing findings that become new Tasks (closing the lifecycle back into the
  Universal Governance Model's own terminal `Task → Report` stage).

## Why this lifecycle does not duplicate the Universal Governance Model

Policy and Control are already first-class nodes in `CLAUDE.md:95`'s chain. Evidence is
already the proof stage in that same chain. This operating model does not re-describe that
chain — it names the three stages Trust OS adds on top (Trust, Certification, Assurance)
and is explicit that Assessment, in this model, refers to the existing governance-sense
table family, not the Learning OS's competency-assessment engines.
