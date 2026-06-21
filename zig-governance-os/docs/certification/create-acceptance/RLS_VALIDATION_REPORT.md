# CREATE RLS Validation Report

Status: **FAIL**

Date: 2026-06-20

## Objective

Verify tenant isolation for CREATE records.

Required proof:

- User can see own organization data.
- User cannot access another organization data.

## Implementation Evidence

RLS policies exist for:

- `projects`
- `assets`
- `controls`
- `activities`
- `asset_control_mappings`

Linked database lint passed:

```text
No schema errors found
```

## Result

RLS is not acceptance-certified.

## Missing Evidence

- No second-tenant test user was validated.
- No denied cross-tenant access test was captured.
- No browser or SQL evidence proves isolation for the certification records.

## Required Remediation

Create or use a second organization/user and verify:

```text
Tenant A user can see Tenant A CREATE records.
Tenant B user cannot see Tenant A CREATE records.
Tenant A user cannot see Tenant B CREATE records.
```

