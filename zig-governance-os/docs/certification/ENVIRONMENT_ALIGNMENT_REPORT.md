# Environment Alignment Report

Status: **MATCH**

Date: 2026-06-20

## Objective

Determine whether migrations and application runtime target the same Supabase project.

## Evidence

Local runtime URL:

```text
NEXT_PUBLIC_SUPABASE_URL -> lmscairdgavntgnwztfk
```

Decoded anon key:

```text
role=anon
iss=supabase
ref=lmscairdgavntgnwztfk
```

Decoded service role key:

```text
role=service_role
iss=supabase
ref=lmscairdgavntgnwztfk
```

Supabase CLI linked project:

```text
lmscairdgavntgnwztfk
```

REST gateway response:

```text
sb-project-ref: lmscairdgavntgnwztfk
```

## Decision

```text
MATCH
```

The app runtime credentials, REST gateway, and migration target all point to the same Supabase project ref.

## Remaining Scope

This report validates local `.env.local` alignment. Preview and production Vercel environment variables should still be checked in Vercel before browser certification.

