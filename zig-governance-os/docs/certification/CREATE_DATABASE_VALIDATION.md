# CREATE Database Validation

Status: **PARTIAL - TABLE VISIBILITY UNKNOWN (NOT INDEPENDENTLY VERIFIED), NAMED RECORDS MISSING**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

The "table visibility restored" / `200` response claims below are carried-forward evidence from a prior session, not independently reproduced here. Outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy in the current execution environment, so the corrected REST calls could not be re-run. Table visibility status is therefore `UNKNOWN` pending direct verification by someone with network access. Findings below are preserved as the original evidence trail.

## Objective

Validate real database records for the CREATE closure workflow.

Required tables:

- `projects`
- `assets`
- `controls`
- `asset_control_mappings`
- `activities`

Required named records:

- Project: `CREATE Certification Project`
- Asset: `Customer Database`
- Control: `Multi-Factor Authentication`
- Mapping: `Customer Database -> Multi-Factor Authentication`
- Activities: `CREATE_PROJECT`, `CREATE_ASSET`, `CREATE_CONTROL`, `LINK_CONTROL_TO_ASSET`

## Evidence Collected

Remote migration evidence from prior certification:

```text
202606200004 applied remotely
supabase db lint --linked: PASS
```

Earlier malformed PowerShell REST validation returned:

```text
projects ERROR 404
assets ERROR 404
controls ERROR 404
asset_control_mappings ERROR 404
activities ERROR 404
```

Forensic result:

```text
The 404 was caused by malformed PowerShell URL interpolation.
bad=/rest/v1/=*&limit=1
good=/rest/v1/projects?select=*&limit=1
```

Correct REST validation returns:

```text
projects 200
frameworks 200
PostgREST OpenAPI includes projects, assets, controls, activities, and asset_control_mappings
```

## Result

Database table visibility status is `UNKNOWN` (not independently verified this session). CREATE database certification remains incomplete regardless, because the named certification records have not been created and verified.

## Root Cause

Hypothesis (unverified): the previous 404 was a validation-script defect, not a database runtime defect. This has not been independently confirmed.

## Fix Required

1. Create the named certification records through the UI.
2. Capture row evidence for every required table.
3. Run `supabase/verify_create_lifecycle_certification.sql` in the Supabase SQL editor or equivalent SQL runner.

## Estimated Effort

```text
0.5-1 day
```
