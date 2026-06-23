# RLS Forensics Report

Status: **RLS NOT ROOT CAUSE OF 404**

Date: 2026-06-20

## Objective

Determine whether the observed REST 404 responses were caused by RLS.

## Evidence

Correct REST checks return:

```text
GET /rest/v1/projects?select=*&limit=1 -> 200 OK
GET /rest/v1/frameworks?select=*&limit=1 -> 200 OK
```

Malformed forensic checks generated an invalid URL:

```text
/rest/v1/=*&limit=1
```

and returned 404.

## Decision

RLS did not cause the observed 404 responses.

## Remaining RLS Work

RLS certification is still incomplete because Tenant A/Tenant B isolation has not been proven.

Required before CREATE PASS:

```text
Tenant A can see Tenant A CREATE data.
Tenant A cannot see Tenant B CREATE data.
Tenant B cannot see Tenant A CREATE data.
```

## RLS Certification Status

```text
FAIL - evidence missing
```

This is a certification evidence gap, not the runtime 404 root cause.
