# Due Diligence Workflow (Detail Spec)

## Purpose
Names the front-half of vendor due diligence as its own workflow detail, distinct from the
full tiering/monitoring process. This is a content spec only — no rendering implementation.

## Structure

```
Request → Collect → Review → Score → Decision
```

| Step | What happens |
|---|---|
| Request | Due diligence questionnaire and supporting docs requested from vendor |
| Collect | Vendor responses, certifications, SOC 2/ISO reports gathered |
| Review | Responses reviewed for completeness and red flags |
| Score | Risk score calculated from responses + data-access multiplier |
| Decision | Approve, approve-with-conditions, or reject |

## Used by
- `vendor_risk/03_*`
- Cross-references `WORKFLOW_LIBRARY.md` → "Vendor Assessment Workflow"

## Reconciliation
`WORKFLOW_LIBRARY.md`'s "Vendor Assessment Workflow" is: *Due diligence → questionnaire
sent → responses scored → data-access multiplier applied → tier assigned → monitoring
cadence set*. This Due Diligence Workflow is the **front half** of that broader workflow —
it covers everything up through scoring and the approve/reject decision, but stops before
tier assignment and monitoring cadence, which belong to the broader Vendor Assessment
Workflow (and to `CONTINUOUS_MONITORING_WORKFLOW.md` below). This is not a duplicate asset;
it is a more granular view of the early stages for lessons that focus specifically on the
due-diligence step rather than the full assessment-to-monitoring pipeline.
