# PostgREST Visibility Report

Status: **UNKNOWN (NOT INDEPENDENTLY VERIFIED) — prior session reported VISIBLE**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

The `200 OK` responses and "eliminated" causes below are carried-forward evidence from a prior session, not independently reproduced here. Outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy in the current execution environment. PostgREST visibility status is therefore `UNKNOWN` pending direct verification by someone with network access. Findings below are preserved as the original evidence trail.

## Objective

Determine whether PostgREST can see the CREATE tables.

## Findings

OpenAPI endpoint:

```text
GET /rest/v1/ -> 200 OK
content-profile: public
sb-project-ref: lmscairdgavntgnwztfk
```

PostgREST OpenAPI paths include:

```text
/projects
/assets
/controls
/activities
/asset_control_mappings
```

Direct table checks with correctly formed URLs:

```text
GET /rest/v1/projects?select=*&limit=1 -> 200 OK
GET /rest/v1/frameworks?select=*&limit=1 -> 200 OK
```

## Why Prior 404 Occurred

The prior PowerShell command generated:

```text
/rest/v1/=*&limit=1
```

instead of:

```text
/rest/v1/projects?select=*&limit=1
```

because `$table?select` was interpolated incorrectly.

## Possible Causes Eliminated (per prior-session evidence, unverified this session)

| Cause | Decision (carried-forward, unverified) |
| --- | --- |
| Schema not exposed | Reported eliminated |
| Tables missing | Reported eliminated |
| Wrong project | Reported eliminated |
| RLS denial causing 404 | Reported eliminated |
| PostgREST cannot see tables | Reported eliminated |

## PostgREST Decision

```text
PostgREST visibility = UNKNOWN (not independently verified)
```

