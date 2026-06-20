# Learning Runtime Artifact Builder

## Purpose
Implementation-ready spec for `<ArtifactBuilder />` (Wave 6): Risk Register, Asset
Register, Control Matrix, Audit Plan, Vendor Assessment, BIA, Board Report. No new
service — every artifact is a rendered view over an existing service's reads.

## Important correction on `AuditService`
`AuditService` (`packages/services/src/AuditService.ts`) is **not** a GRC audit-engagement
service — it has one method, `recordAction(context, action, entityTable, entityId,
reason?)`, which writes to an `AuditSink` for activity logging (who changed what, when).
It has no concept of an audit plan, fieldwork, findings, or an audit lifecycle. The "Audit
Plan" artifact below therefore has **no real backing data source** for audit-engagement
content — this is a gap, not resolved by assuming `AuditService` covers it.

## Props

```tsx
interface ArtifactBuilderProps {
  learnerId: string;
  projectId: string;
  artifactType:
    | "riskRegister"
    | "assetRegister"
    | "controlMatrix"
    | "auditPlan"
    | "vendorAssessment"
    | "bia"
    | "boardReport";
  exportFormat: "pdf" | "excel" | "markdown";
}
```

## Per-artifact data source

| Artifact | Real source | Method(s) | Verdict |
|---|---|---|---|
| Risk Register | `RiskService` | `findMany` (risks), `findAssessments` (per risk) | **Fits.** Full data available. |
| Asset Register | `AssetService` | `findMany` (inherited from `BaseService`; `AssetService` adds no methods of its own) | **Fits.** |
| Control Matrix | `ControlService` | `findMany` (controls), `findMappings` (per control, for framework crosswalk columns) | **Fits.** |
| Audit Plan | None | — | **Gap.** `AuditService` only logs actions; no audit-engagement data exists anywhere in `packages/services/`. This artifact cannot be built with real data until an audit-engagement model is documented (out of scope for this wave — same category as the `IncidentService` gap). |
| Vendor Assessment | `AssetService` (stand-in) | `findMany`, filtered/tagged as vendor-type assets | **Documented gap, workable stand-in.** Per `docs/artifacts/VENDOR_ASSESSMENT.md`, no dedicated `VendorService` exists; `AssetService` models vendors as a specialization of assets. This artifact builds against that stand-in, consistent with the rest of the codebase's existing modeling choice — not a new decision made here. |
| BIA (Business Impact Analysis) | None confirmed | — | **Gap.** No service holds process/RTO/RPO data. `docs/learning/assets/bcm/BIA_WORKFLOW.md` documents the lesson content for this concept but no live data source exists. Renders as a template-only artifact (learner fills in values manually) until a backing model exists. |
| Board Report | `GovernanceService` | `findRecommendations` | **Partial fit.** `GovernanceScoreRecord` fields (`controlsImplemented`, `evidenceCoverage`, `riskTreatment`, `assessmentCompletion`, `explanation`) cover the scoring narrative a board report needs; it does not independently aggregate Risk/Control/Evidence detail — those sections of the report compose `RiskService`/`ControlService`/`EvidenceService` reads alongside the governance score, same as a live Zig user's executive report would. |

## Export formats
PDF, Excel, and Markdown are all rendering targets over the same underlying artifact data
model (a single typed object per `artifactType`, independent of export format). Which
PDF/Excel-generation library to use is a charting/export-library choice explicitly out of
scope for this wave (per `docs/learning/LEARNING_RUNTIME_PREPARATION.md` item 1, extended
here to cover document export, not just diagramming) — not decided here.

## What this wave does NOT do
Does not implement the component. Does not pick an export library. Does not build an
audit-engagement model or a BIA data model — both are named precisely as prerequisite
gaps for a future documentation pass, not invented or assumed away.
