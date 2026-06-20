# Learning ↔ Operational Bridge

> STATUS: DESIGN — written per Area 13 of
> `docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md`. This is a Tier 1 design document,
> not an implementation ticket. Per the vision doc, this is the single biggest
> architectural decision in the Learning OS effort. **Do not begin schema or service work
> from this document without a second explicit review — see "What this wave does NOT do"
> at the end.**

## Why this document exists

`docs/learning/GOVERNANCE_COMPETENCY_OS_VISION.md` (Area 13) identifies that completing a
scenario (e.g. "SOC 2 Readiness" using the CloudPay scenario, see
`docs/scenarios/CLOUDPAY.md`) currently dead-ends — the risks, controls, and artifacts a
learner builds during the scenario have no path into a real operational
Organization → Project. This document specifies that path. It does not implement it.

---

## 1. The risk, stated plainly

**Simulated/learning data could cross into real operational data and be mistaken for it.**

Concretely:

- Scenario exercises are backed by `simulated_companies` and `simulated_company_objects`
  (`supabase/migrations/202606180007_learning_os_e2e.sql`) — fictional companies like
  CloudPay (fintech, Series B, pursuing SOC 2 Type II) or HealthBridge. These rows describe
  things that did not happen at a real organization the tenant operates.
- Real operational governance data lives in `RiskRecord`, `ControlRecord`, `AssetRecord`,
  `EvidenceRecord` (`packages/data-access/src/records.ts`, backed by the `Risk`, `Control`,
  `Asset`, `Evidence` interfaces in `packages/types/src/index.ts`), scoped to a real
  `Project` under a real `Tenant`.
- If a learner's "Encryption at Rest" control (built against CloudPay, a fictional company)
  is copied into a real `ControlRecord` on a real `Project` without clear marking, it
  becomes indistinguishable from a control the organization actually implemented. From
  there it can silently feed:
  - the real `GovernanceScore` (`packages/types/src/index.ts` — `controlsImplemented`,
    `evidenceCoverage`, `riskTreatment`, `assessmentCompletion`),
  - a real `Audit` (`AuditRecord`) or `AuditEvent` trail,
  - a real Executive Report,
  - a real auditor's evidence review.

  All four are downstream consumers a customer, regulator, or auditor may rely on. Fictional
  data reaching any of them is a compliance-integrity failure, not a UX nuisance — it is the
  one outcome this entire document exists to prevent.

This risk is structural, not cosmetic: both `simulated_company_objects` and `RiskRecord` /
`ControlRecord` etc. are real rows in real tables, both protected by the same Postgres RLS
policy shape (`tenant_id = current_tenant_id()`, see `supabase/migrations/202606180007_*`
and `202606180001_batch_21_core_data_platform.sql`). There is no structural signal — like a
different database or a different tenant — that stops scenario data from being inserted
directly into operational tables by a careless import path. The safeguard has to be
explicit, not incidental.

**One mitigating fact found during this review**: `simulated_company_objects` already
carries `tenant_id` and is already RLS-isolated per tenant, exactly like operational
tables. This means the import is a same-tenant, cross-table copy — not a cross-tenant
transfer. That removes one entire class of risk (tenant boundary crossing) from this
design's job; tenant isolation still has to be checked (see Section 4), but the harder
problem this design must solve is **provenance and consent**, not **tenant containment**.

---

## 2. Import-flow spec

### 2.1 Trigger

The import is **never automatic**. It fires from exactly one place: an explicit
**"Import to my project"** action surfaced on a completed `ScenarioRun`
(`ScenarioRunStatus = "completed"`, see `packages/types/src/index.ts`), scoped per
artifact (one risk, one control, one asset, one evidence item at a time) or as a reviewed
batch. Nothing in `ScenarioService`, `ScenarioRun` completion, scoring, or any background
job may call the import path. If a future AI Coach (Area 7 of the vision doc) ever
suggests an import, it must render as a `Recommendation` (`packages/types/src/index.ts` —
carries `explanation`, `action`, `confidence`, `frameworkReference`) that still requires the
learner to click "Import to my project" — recommend, never execute.

### 2.2 Source → destination field mapping

Source rows are `simulated_company_objects` (`object_type`, `name`, `status`, `payload
jsonb`) scoped to a `simulated_company_id`. The `payload` JSON shape varies by
`object_type`; the mapping below is keyed on the indicative shapes already documented in
`docs/scenarios/CLOUDPAY.md` (asset / control / risk rows).

| `object_type` | Source field | Destination record | Destination field | Notes |
|---|---|---|---|---|
| `asset` | `name` | `AssetRecord` | `name` | direct copy |
| `asset` | `payload.category` | `AssetRecord` | `category` | required on `Asset`; import is rejected if missing |
| `asset` | `payload.criticality` | `AssetRecord` | `criticality` (`RiskSeverity`) | must validate against `"low"\|"medium"\|"high"\|"critical"` before insert |
| `asset` | — | `AssetRecord` | `ownerId` | **never copied** — real assets need a real owner; left `undefined`, surfaced as a required follow-up |
| `control` | `name` | `ControlRecord` | `title` | direct copy |
| `control` | `payload.description` | `ControlRecord` | `description` | direct copy, learner-editable before confirm |
| `control` | `status` | `ControlRecord` | `status` (`ControlStatus`) | re-validated against real enum; `needs_evidence`/`planned`/etc. carry over as a starting point, not a claim of real progress |
| `control` | `payload.frameworkId` | `ControlRecord` | `frameworkId` | only copied if the real `Project.frameworkId` matches or the project has that framework attached via `ProjectFrameworkRecord`; otherwise the field is left for the learner to set |
| `control` | — | `ControlRecord` | `controlId` | **regenerated**, not copied — the scenario's control numbering is scenario-local and must not collide with the project's real control catalog |
| `risk` | `name` | `RiskRecord` | `title` | direct copy |
| `risk` | `payload.description` | `RiskRecord` | `description` | direct copy |
| `risk` | `payload.severity` | `RiskRecord` | `severity` (`RiskSeverity`) | re-validated against enum |
| `risk` | `payload.treatment` | `RiskRecord` | `treatment` (`RiskTreatment`) | defaults to `"mitigate"` if absent — never silently `"accept"` (accepting a risk is a judgment call the import must not make for the user) |
| `risk` | — | `RiskRecord` | `assetId` | **must resolve to a real, already-imported (or pre-existing) `AssetRecord` in the destination project** — if it can't resolve, the risk import is blocked until the learner imports/links the asset first (no orphan risks, per the Universal Governance Model) |
| evidence (artifact) | scenario artifact (e.g. a generated control narrative, gap assessment) | `EvidenceRecord` | `title` | direct copy |
| evidence (artifact) | — | `EvidenceRecord` | `status` (`EvidenceStatus`) | **always inserted as `"submitted"`, never `"approved"`** — approval is a real reviewer action and must happen in the operational Evidence Workspace, not at import time |
| evidence (artifact) | — | `EvidenceRecord` | `controlId` | must resolve to a real, already-imported `ControlRecord` — same no-orphan rule as risk → asset |

General rules across all object types:
- `id` is always newly generated by the destination `TenantRepository<T>.create()` — scenario
  object IDs are never reused as operational IDs.
- `tenantId` is always set by `TenantRepository.create()` from the caller's `TenantContext`,
  never copied from the source row (this is already how `TenantRepository.create()` works —
  see `packages/data-access/src/TenantRepository.ts` lines 20–27 — the import service must
  not try to override it).
- `projectId` is always the destination project the learner explicitly chose, never inferred.

### 2.3 Provenance metadata: where it lives and why

**Decision: extend the four existing records with origin fields. Do not create a new table.**

Justification against "no new tables unless necessary" (CLAUDE.md, Universal Governance
Model — no orphan entities): a new `learning_import_log` join table would itself be an
entity sitting outside the Organization → Project → Asset → Risk → Control → Framework
Requirement → Evidence → Task → Report chain unless every governance screen that reads
`RiskRecord`/`ControlRecord`/etc. also joined against it to know whether to show a
provenance badge — that's strictly more code than adding two nullable fields to records
that already exist and are already read everywhere they need to be flagged. A join table
would be justified only if a risk/control/asset/evidence row could have *multiple* import
origins over time, which the spec below explicitly forbids (one-time import, no re-import
merge — see 2.4).

Add to `RiskRecord`, `ControlRecord`, `AssetRecord`, `EvidenceRecord` (i.e. to the
underlying `Risk`, `Control`, `Asset`, `Evidence` interfaces in
`packages/types/src/index.ts`):

```typescript
export type RecordSourceType = "operational" | "learning_import";

// added to Risk, Control, Asset, Evidence interfaces:
sourceType: RecordSourceType;            // defaults to "operational" for all existing/organic records
importedFromScenarioId?: string;          // Scenario.id (not simulated_company_id — ties to the
                                           // tenant's own ScenarioRun, see 2.4) — present only when
                                           // sourceType === "learning_import"
importedFromObjectId?: string;            // simulated_company_objects.id this row was copied from
importedByUserId?: string;                // User.id of the learner who confirmed the import
importedAt?: Date;                        // import timestamp, distinct from createdAt
```

`sourceType` defaults to `"operational"` via a backfill migration (`DEFAULT 'operational'
NOT NULL` at the SQL layer) so every pre-existing real row is unambiguously real with no
data migration guesswork. This is the same pattern already used for enum-like status
columns in this schema (e.g. `ControlStatus`, `EvidenceStatus`) — no new pattern introduced.

---

## 3. Safeguards — explicit confirmation, never silent population

Tying directly to CLAUDE.md's "every AI recommendation must be explainable" and "zero empty
states" rules, adapted to import:

1. **Every importable item renders with its scenario origin visible before import.** The
   import review screen must show, per item: scenario name (e.g. "CloudPay — SOC 2
   Readiness"), object type, and a one-line "what this becomes" preview (e.g. "Will create
   1 Control: Encryption at Rest, status: needs_evidence"). This is the explainability
   pattern from `Recommendation` (reason + data + confidence) adapted to import: reason =
   "from your completed scenario," data = the field mapping in 2.2, confidence = N/A
   (replaced by an explicit per-item checkbox, since this is a user decision, not an AI
   confidence score).
2. **No batch silent-imports.** Each item requires an individual checkbox confirmation, even
   when importing a full register. A "select all" convenience control is allowed, but the
   review screen itself (with per-item previews) is never skippable.
3. **Imported records are visually distinguished everywhere they appear operationally**,
   not just on a dedicated import screen — a badge ("Imported from CloudPay scenario,
   confirm before relying on this for audit") on the Risk Workspace, Control Workspace,
   Asset Workspace, and Evidence Workspace rows wherever `sourceType === "learning_import"`.
   This satisfies "zero empty/ambiguous states" in spirit: an imported record must never
   look identical to an organically-created one.
4. **`EvidenceRecord.status` is never inserted as `"approved"` by the import path** (see
   2.2) — evidence approval remains a real reviewer action in the Evidence Workspace,
   independent of import.
5. **`GovernanceScore` is recalculated normally, not specially, after import** — i.e. an
   imported `ControlRecord` with `status: "needs_evidence"` affects the score exactly as
   much as an organically-created one in the same state would, no more and no less. The
   safeguard is not "imported records don't count" (that would make the import pointless);
   it is "imported records must earn their score contribution the same way real records
   do" — by being reviewed, evidenced, and approved through the normal operational
   lifecycle, not by inheriting the scenario's score.
6. **Imported records are excluded from Executive Reporting and Audit export by default**
   until a human with edit rights on the destination project explicitly clears the
   provenance flag — proposed as a one-time `confirmOperational(context, recordType, id)`
   action (see 5.2) separate from the import action itself, so "I imported it" and "I vouch
   for this as real operational fact for audit/reporting purposes" are two distinct,
   independently-logged decisions. This is the strongest safeguard in this document and the
   one most likely to need revision after the second review (see Section 6).

---

## 4. Tenant isolation — hard rule

**The scenario's `tenantId` and the destination project's `tenantId` must be the same
tenant, or the import is rejected outright.**

- Both `simulated_company_objects` rows and `RiskRecord`/`ControlRecord`/`AssetRecord`/
  `EvidenceRecord` rows carry `tenant_id`/`tenantId`, both enforced by Postgres RLS using
  `current_tenant_id()` (`supabase/migrations/202606180001_batch_21_core_data_platform.sql`,
  `202606180007_learning_os_e2e.sql`). The import service must additionally check this in
  application code (defense in depth, per "tenant isolation enforced at the data layer, not
  just the UI" — CLAUDE.md) by comparing `TenantContext.tenantId` resolved for the scenario
  side against `TenantContext.tenantId` resolved for the destination `Project`.
- There is no cross-tenant import path. A consultant managing multiple organizations
  (CLAUDE.md's multi-tenant model explicitly allows this role) must switch `TenantContext`
  to the destination tenant and re-run the scenario (or have a tenant-scoped copy of it) —
  the import service never accepts a `tenantId` parameter that differs from the resolved
  context's tenant.
- This check happens **before** the review screen renders, not just before the final write —
  a learner should never see an import preview for a project they don't have a same-tenant
  path to.

---

## 5. Service design

### 5.1 Decision: new `LearningImportService`, not an extension of `RiskService`/etc.

Justification against "no duplicate architecture": this is a genuine new responsibility —
reading from `simulated_company_objects` (a learning-side table none of `RiskService`,
`ControlService`, `AssetService`, `EvidenceService` currently know about) and writing to
four different operational repositories with cross-record validation (asset must exist
before risk, control must exist before evidence) — that does not fit cleanly as a method on
any single existing service without giving e.g. `RiskService` an import-time dependency on
`AssetService`, `ControlService`, and a learning-side repository, none of which any
operational service needs for its actual job. A new service that *depends on* the existing
`AssetService`/`RiskService`/`ControlService`/`EvidenceService` (composition, not
duplication) keeps each operational service single-purpose and keeps all import-specific
validation (provenance fields, no-orphan checks, tenant match) in one auditable place.

```typescript
import type {
  AssetRecord, ControlRecord, RiskRecord, EvidenceRecord,
  TenantContext,
} from "@zig/data-access";
import type { AssetService, ControlService, RiskService, EvidenceService } from "@zig/services";

export type ImportableObjectType = "asset" | "control" | "risk" | "evidence";

export interface ImportPreviewItem {
  sourceObjectId: string;          // simulated_company_objects.id
  objectType: ImportableObjectType;
  scenarioId: string;              // Scenario.id
  scenarioName: string;
  preview: Record<string, unknown>; // field-mapped preview, not yet written
  blockedReason?: string;           // e.g. "asset not yet imported" — null/undefined if importable now
}

export interface ImportConfirmation {
  sourceObjectId: string;
  confirmed: boolean;               // must be explicitly true per item — see Safeguard 2
}

export class LearningImportService {
  constructor(
    private readonly assetService: AssetService,
    private readonly riskService: RiskService,
    private readonly controlService: ControlService,
    private readonly evidenceService: EvidenceService,
    // read-only dependency on the learning-side data access for simulated_company_objects
    private readonly scenarioObjectRepository: TenantRepository<SimulatedCompanyObjectRecord>,
  ) {}

  /** Builds the review screen's data. Never writes. Enforces tenant match (Section 4)
   *  and no-orphan ordering (asset before risk, control before evidence) by setting
   *  blockedReason rather than throwing, so the UI can show why an item is disabled. */
  previewImport(
    context: TenantContext,
    scenarioRunId: string,
    destinationProjectId: string,
  ): Promise<ImportPreviewItem[]>;

  /** The only write path. Takes only the items the learner explicitly confirmed
   *  (Safeguard 2). Performs the field mapping in 2.2, sets sourceType: "learning_import"
   *  and the four provenance fields, and writes through the existing
   *  asset/risk/control/evidenceService.create() calls — so normal create-time audit
   *  logging (TenantRepository.audit, "create") fires exactly as it does for organic
   *  records. Returns the created records, still flagged, still unapproved. */
  confirmImport(
    context: TenantContext,
    scenarioRunId: string,
    destinationProjectId: string,
    confirmations: ImportConfirmation[],
  ): Promise<{
    assets: AssetRecord[];
    risks: RiskRecord[];
    controls: ControlRecord[];
    evidence: EvidenceRecord[];
  }>;

  /** Safeguard 6 — a separate, explicitly-logged action that clears the provenance
   *  flag's reporting exclusion. Does NOT change sourceType (the historical fact that
   *  this came from a scenario is permanent and never erased) — only changes whether it's
   *  eligible for Executive Reporting / Audit export. Requires edit rights on the project,
   *  not just "the learner who imported it," since a manager may need to do this review. */
  confirmOperational(
    context: TenantContext,
    recordType: ImportableObjectType,
    recordId: string,
  ): Promise<void>;
}
```

`previewImport` and `confirmImport` are split deliberately so the review screen (Safeguard
1–2) is backed by a real method, not assembled ad hoc in a UI layer — the no-orphan and
tenant checks live in one place and can't be bypassed by a UI that forgets to call them.

---

## 6. What this wave does NOT do

This document does **not**:

- Implement `LearningImportService`, the four provenance fields, or any migration. It is a
  design document only, per "never implement before documenting."
- Decide the UI/UX of the import review screen beyond the constraints in Section 3 — that
  belongs in `docs/ux/` once this design is approved.
- Decide what happens to an imported record if the **source scenario** is later edited or
  retired (e.g. CloudPay's seed data changes) — `importedFromObjectId` is a point-in-time
  reference; whether re-sync, freeze, or break-the-link is correct is unresolved and should
  be scoped separately.
- Resolve whether `confirmOperational` (5.1, Safeguard 6) should require a specific role
  (e.g. GRC Manager, not the importing learner) — flagged as the single highest-stakes open
  question in this design, deliberately left open rather than guessed at.
- Address bulk/programmatic import (e.g. importing an entire scenario's object graph via
  API rather than the human-reviewed screen) — explicitly out of scope; Section 2.1's "never
  automatic" rule means no such path should exist without a separate, even more carefully
  reviewed design.
- Cover what happens at the **Project Builder** level if a learner wants to create a brand
  new operational Project from scenario data in one step (the spec above assumes a
  pre-existing destination Project) — that is a plausible follow-on but is a different,
  larger decision (creating a real Project from learning intent) and is not addressed here.

**Recommendation**: per the vision doc's own framing of Area 13 as "the biggest
architectural bridge, not a new table," and given that this design touches four core
operational record types, the provenance/scoring/reporting safeguards in Section 3, and a
new cross-service write path — this should get a second explicit review from the user
before any schema migration is written, even more so than the other three Tier 1 design
docs (Competency Engine, Scenario Engine, Portfolio Artifact Engine). Those three add new,
clearly-bounded tables. This one modifies the meaning of data in the four tables every other
module in the product already trusts.
