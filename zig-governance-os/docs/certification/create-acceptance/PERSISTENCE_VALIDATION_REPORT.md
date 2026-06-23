# CREATE Persistence Validation Report

Status: **FAIL**

Date: 2026-06-20

## Objective

Prove that CREATE records persist after refresh, logout/login, and direct URL navigation.

## Required Records

- Project: `CREATE Certification Project`
- Asset: `Customer Database`
- Control: `Multi-Factor Authentication`
- Relationship: `Customer Database -> Multi-Factor Authentication`

## Result

Persistence was not proven.

## Evidence

Local build verification passed:

```text
npm run lint --workspace web: PASS
npm run build: PASS
```

Remote migration `202606200004` was applied and database lint passed:

```text
202606200004 | 202606200004
No schema errors found
```

However, read-only REST checks through the current `.env.local` Supabase REST endpoint returned 404 for known CREATE tables:

```text
projects 404
assets 404
controls 404
asset_control_mappings 404
activities 404
```

This prevents accepting persistence evidence from the current local runtime configuration.

## Certification Impact

CREATE persistence remains uncertified.

## Required Remediation

- Confirm the deployed application and `.env.local` point to the same Supabase project.
- Create the required records through the browser.
- Refresh the browser and navigate directly to the project URL.
- Verify records remain visible.

