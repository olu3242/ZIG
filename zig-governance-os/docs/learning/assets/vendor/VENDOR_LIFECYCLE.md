# Vendor Lifecycle (Detail Spec)

## Purpose
Teaches the full vendor relationship arc as six discrete stages, giving learners a more
granular breakdown than the five-stage summary already indexed in `DIAGRAM_LIBRARY.md`.
This is a content spec only — no rendering implementation.

## Structure

```
Select → Assess → Approve → Monitor → Renew → Offboard
```

| Stage | What happens |
|---|---|
| Select | Candidate vendor identified, business need confirmed, shortlist narrowed |
| Assess | Due diligence performed — questionnaire, data-access review, risk scoring |
| Approve | Tier assigned, contract terms reviewed, sign-off by risk/security owner |
| Monitor | Ongoing monitoring per tier cadence (see `VENDOR_TIER_MATRIX.md`) |
| Renew | Contract renewal triggers reassessment; tier may change |
| Offboard | Access revoked, data returned/destroyed, contract closed |

## Used by
- `vendor_risk/01_VENDOR_RISK_FOUNDATIONS.md` (extends the lesson's existing lifecycle
  treatment)
- Cross-references `DIAGRAM_LIBRARY.md` → "Vendor Lifecycle"

## Reconciliation
`DIAGRAM_LIBRARY.md`'s existing "Vendor Lifecycle" entry is **Onboard → Assess → Monitor →
Reassess → Offboard** (five stages). This detail version is not a contradiction — it is the
same lifecycle at finer granularity: "Onboard" is split into **Select** (pre-contract
sourcing) and **Approve** (post-assessment sign-off), and "Reassess" is split into
**Monitor** (continuous, low-touch) and **Renew** (contract-triggered, full reassessment).
The five-stage version remains the correct summary-level diagram for `DIAGRAM_LIBRARY.md`;
this six-stage version is the expanded teaching detail for learners who need the sourcing
and renewal steps called out explicitly. No change to the library entry is being made here.
