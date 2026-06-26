# Continuous Monitoring Workflow (Detail Spec)

## Purpose
New asset covering ongoing vendor monitoring after initial tier assignment — the back half
of the vendor lifecycle that `DUE_DILIGENCE_WORKFLOW.md` and the existing "Vendor Assessment
Workflow" do not cover in detail. This is a content spec only — no rendering implementation.

## Structure

```
Monitor → Flag Change → Reassess → Update Tier
```

| Step | What happens |
|---|---|
| Monitor | Ongoing monitoring per tier cadence (security ratings, breach disclosures, financial health, SLA performance) |
| Flag Change | A material change is detected (new data access, security incident, ownership change, missed SLA) |
| Reassess | Triggered reassessment outside the normal cadence |
| Update Tier | Tier adjusted up/down based on reassessment outcome; monitoring cadence updated accordingly |

## Used by
- `vendor_risk/04_*` (proposed — see follow-up note below)

## Reconciliation
This is a **new asset**, not currently indexed in `WORKFLOW_LIBRARY.md`. It fills the gap
between the existing "Vendor Assessment Workflow" (which ends at "monitoring cadence set")
and the "Monitor" stage of `VENDOR_LIFECYCLE.md`. It should be added to
`WORKFLOW_LIBRARY.md`'s Vendor Risk section as a follow-up — this file does not edit that
library doc; it only flags the gap and provides the content spec for whoever does.
