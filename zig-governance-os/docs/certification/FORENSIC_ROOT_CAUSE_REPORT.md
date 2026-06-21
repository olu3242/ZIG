# Forensic Root Cause Report

Status: **ROOT CAUSE FOUND**

Date: 2026-06-20

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
ROOT CAUSE FOUND
```

