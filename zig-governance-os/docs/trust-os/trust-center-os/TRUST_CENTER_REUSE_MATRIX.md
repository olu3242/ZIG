# Trust Center Reuse Matrix (Batch 31)

Per-entity/capability classification, following the same Reuse/Extend/Build convention
established in `TRUST_OS_HARMONIZATION_PLAN.md` (batches 1-10) and
`EVIDENCE_REUSE_MATRIX.md` (batches 21-30).

- **Reuse** — consume the existing table/service/component unchanged.
- **Extend** — add columns, a new read-projection, or a new method on an existing
  service/engine; no new top-level entity.
- **Build** — genuinely new entity/table/service with no existing analog.

## Data layer

| Capability | Existing basis | Classification | Notes |
|---|---|---|---|
| Trust Score for Security Overview | `governance_scores` table + `TRUST_SCORE_MODEL.md` formula (PR #7) | Reuse (read) + Extend (projection) | No new score table; add an externally-safe view |
| Governance Score detail | `GovernanceScoreEngine.calculateScore()` | Reuse | Internal-only consumer of the same engine |
| Framework/certification data | `frameworks`, `framework_requirements`, `framework_mappings` | Reuse (read) | Compliance Center reads, does not duplicate |
| Certification badge record (issuer, scope, valid-through, public flag) | none | Build | `PublishedCertification` — net new, see `TRUST_CENTER_DATA_MODEL.md` |
| Audit status indicator | `audits` table | Extend | Add an externally-safe status projection, not a new audits concept |
| Policy/procedure documents | `policy_attestations`, `PolicyManagementEngine.coverage()` | Extend | Documentation Center adds publish/version/gate metadata as a new joined entity, not a new document store |
| Evidence items | `evidence`, `evidence_collections`, `control_evidence`, `evidence_reviews` | Reuse (read) | Evidence Center never duplicates evidence storage |
| Evidence health | `EvidenceManagementEngine` / `AutonomousEvidenceEngine` | Reuse | External summary reads existing health enum |
| Evidence exposure classification | none | Build | `PublishedDocument`/`PublishedControl` carry exposure tier; see Batch 36 |
| Questionnaire response engine (citation rule) | `QUESTIONNAIRE_RESPONSE_ENGINE.md` (PR #8) | Extend | AI Security Assistant reuses the rule and retrieval shape against a smaller, externally-safe corpus |
| Confidence scoring | `responses.confidence_score`, Confidence Scoring Model (PR #8) | Reuse (pattern) | Assistant answers carry an analogous confidence indicator, computed the same way |
| Evidence Request Workflow | `evidence_requests` table, internal Request→Assign→Collect→Review→Approve→Map stages (PR #9) | Extend (pattern only) | Customer Assurance Portal's `AccessRequest` is a structurally similar but distinct entity — external requester, not internal owner |
| RBAC roles | `RbacEngine` 13 internal roles | Extend | Add `trust_center` / `evidence_external_share` as new `RbacResource` values; do not add external parties as a 14th internal role |
| RLS tenant pattern | `tenant_id = current_tenant_id()` | Build (new pattern, same principle) | External/anonymous access needs a signed-token policy variant; see `TRUST_CENTER_ACCESS_CONTROL_MODEL.md` |

## Service layer

| Capability | Existing basis | Classification | Notes |
|---|---|---|---|
| `GovernanceService` | `packages/services/src/factory.ts` | Reuse | Security Overview calls this, does not reimplement scoring |
| `FrameworkService` | same factory | Reuse | Compliance Center calls this |
| `EvidenceService` | same factory | Reuse | Evidence Center calls this |
| `TrustCenterService` (new) | none | Build | Orchestrates publishing/gating/exposure for all six sections; follows the same `BaseService<T>` + `TenantContext` pattern as existing services, registered in the same factory — not a parallel container |
| `AccessRequestService` (new) | Evidence Request Workflow as structural precedent only | Build | Customer Assurance Portal's approval lifecycle |
| `AssistantService` (new) | Questionnaire Response Engine as the retrieval/citation precedent | Build (orchestration) + Extend (logic reuse) | Wraps existing evidence/control lookups under the same no-hallucination rule |

## Route layer

| Capability | Existing basis | Classification | Notes |
|---|---|---|---|
| `/trust` route group | none (confirmed by grep) | Build | New top-level public route group, sibling to the authenticated app, not nested under it |
| `executive-assurance`, `compliance-command-center` | existing internal pages | None (no reuse) | Explicitly out of scope — different audience, different auth model |

## Net-new vs. composition — running tally

Counting only the items above:

- **Reuse** (no new code beyond a query): 7
- **Extend** (new column/method/projection on an existing concept): 7
- **Build** (genuinely new entity/service/route): 7

This 1:1:1 split is the basis for the "what fraction is composition vs. new" answer in
`TRUST_CENTER_OS_MVP.md` and the PR description: **roughly two-thirds of Trust Center OS's
underlying capability (Reuse + Extend) is composition over PRs #7/#8/#9 and the existing
governance/evidence/framework engines; the remaining third (Build) is genuinely new
work — concentrated almost entirely in publishing/gating, the external access-request
lifecycle, and the external-identity/RLS variant.**
