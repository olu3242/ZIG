# PostgREST Visibility Report

Status: **VISIBLE**

Date: 2026-06-20

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

## Possible Causes Eliminated

| Cause | Decision |
| --- | --- |
| Schema not exposed | Eliminated |
| Tables missing | Eliminated |
| Wrong project | Eliminated |
| RLS denial causing 404 | Eliminated |
| PostgREST cannot see tables | Eliminated |

## PostgREST Decision

```text
PostgREST visibility = PASS
```

