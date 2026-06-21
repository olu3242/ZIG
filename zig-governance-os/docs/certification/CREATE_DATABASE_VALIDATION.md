# CREATE Database Validation

Status: **PARTIAL - TABLE VISIBILITY RESTORED, NAMED RECORDS MISSING**

Date: 2026-06-20

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

Database table visibility is no longer the blocker.

CREATE database certification remains incomplete because the named certification records have not been created and verified.

## Root Cause

The previous 404 was a validation-script defect, not a database runtime defect.

## Fix Required

1. Create the named certification records through the UI.
2. Capture row evidence for every required table.
3. Run `supabase/verify_create_lifecycle_certification.sql` in the Supabase SQL editor or equivalent SQL runner.

## Estimated Effort

```text
0.5-1 day
```
