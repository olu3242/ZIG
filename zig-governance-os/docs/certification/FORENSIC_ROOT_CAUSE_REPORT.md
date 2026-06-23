# Forensic Root Cause Report

Status: **ROOT CAUSE HYPOTHESIS FOUND — RUNTIME STATUS = UNKNOWN (NOT INDEPENDENTLY VERIFIED)**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

This report's root-cause finding and the "PASS"/"resolved" language below were produced by a prior session and are **carried-forward evidence, not independently reproduced** in the current session. On 2026-06-21:

- Outbound network access from the current execution environment to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy (`403 Host not in allowlist`), before any request reaches Supabase.
- The corrected REST calls described below (`/rest/v1/projects?select=*&limit=1 -> 200 OK`, etc.) could not be re-run or confirmed from this environment.
- The underlying hypothesis — that the 404s were caused by a PowerShell URL-interpolation defect rather than a real database/migration/PostgREST/runtime failure — remains plausible and is retained below as-is, but it is **unverified** until someone with direct network access re-runs the corrected requests and confirms the responses.

**Runtime certification status is therefore `UNKNOWN`, not `PASS`,** pending direct verification. All findings below are preserved unmodified as the evidence trail; only the certification verdict is being corrected.

## Problem

The observed REST `404` responses for:

```text
projects
assets
controls
asset_control_mappings
activities
```

were caused by a malformed PowerShell validation URL, not by missing tables, wrong Supabase project, failed migrations, RLS denial, or PostgREST schema invisibility.

## Exact Root Cause

The validation command used a double-quoted PowerShell string like:

```powershell
"/rest/v1/$table?select=*&limit=1"
```

PowerShell parsed `$table?select` incorrectly. The generated URL became:

```text
/rest/v1/=*&limit=1
```

instead of:

```text
/rest/v1/projects?select=*&limit=1
```

Escaping the `?` fixes the URL:

```powershell
"/rest/v1/$table`?select=*&limit=1"
```

## Evidence

PowerShell interpolation proof:

```text
bad=/rest/v1/=*&limit=1
good=/rest/v1/projects?select=*&limit=1
```

Correct REST check proof:

```text
/rest/v1/projects?select=*&limit=1 -> 200 OK
/rest/v1/frameworks?select=*&limit=1 -> 200 OK
```

PostgREST OpenAPI proof:

```text
/rest/v1/ -> 200 OK
paths include:
- /projects
- /assets
- /controls
- /activities
- /asset_control_mappings
```

Direct DB inventory proof:

```text
public.projects
public.assets
public.controls
public.activities
public.asset_control_mappings
```

all exist.

## Impact

The prior runtime validation failure was a false negative.

It incorrectly classified REST visibility as failed and blocked CREATE certification for an environment/runtime reason that is now disproven.

CREATE still remains **FAIL** because browser, persistence, RLS, and user-flow evidence are still missing, but the `404` runtime blocker is resolved as a test-script defect.

## Fix

Use one of these safe request patterns:

```powershell
$path = "/rest/v1/$table`?select=*&limit=1"
```

or:

```powershell
$path = "/rest/v1/" + $table + "?select=*&limit=1"
```

or use `curl.exe` with a prebuilt path variable.

Do not place `$table?select` directly in a PowerShell double-quoted string.

## Estimated Effort

```text
15 minutes
```

## Risk

Low. This is a forensic-script defect, not an application architecture defect.

## Decision

```text
ROOT CAUSE HYPOTHESIS FOUND (carried-forward, not independently verified)
RUNTIME STATUS = UNKNOWN
```

