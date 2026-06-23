# CREATE RLS Validation

Status: **FAIL**

Date: 2026-06-20

## Objective

Prove tenant isolation for CREATE records.

Required proof:

```text
Tenant A user can see Tenant A CREATE records.
Tenant A user cannot see Tenant B CREATE records.
Tenant B user cannot see Tenant A CREATE records.
```

## Evidence Collected

Implementation evidence:

- RLS policies exist for `projects`, `assets`, `controls`, `activities`, and `asset_control_mappings`.
- Linked database lint previously passed.

Missing evidence:

- No Tenant A/Tenant B browser test.
- No SQL impersonation evidence.
- No denied cross-tenant access evidence.

## Result

RLS validation is **FAIL**.

## Root Cause

Tenant isolation was implemented but not proven with real users or SQL evidence.

## Fix Required

1. Create or identify two test organizations.
2. Create one test user per organization.
3. Create CREATE records in Tenant A.
4. Verify Tenant B cannot read Tenant A records.
5. Repeat inverse check.
6. Capture browser or SQL evidence.

## Estimated Effort

```text
0.5 day
```

