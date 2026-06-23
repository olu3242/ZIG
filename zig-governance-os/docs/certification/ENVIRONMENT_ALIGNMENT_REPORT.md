# Environment Alignment Report

Status: **PARTIALLY VERIFIED — JWT ref MATCH confirmed independently; CLI/REST gateway claims UNKNOWN**

Date: 2026-06-20 (original analysis); reviewed 2026-06-21

## Verification Note (2026-06-21)

The JWT-decode claim below was independently re-verified this session: decoding the actual anon key supplied for `lmscairdgavntgnwztfk.supabase.co` confirms `ref=lmscairdgavntgnwztfk`, matching the project URL. This part of the report is confirmed.

The "Supabase CLI linked project" and "REST gateway response: `sb-project-ref`" claims were **not** independently verified — they require Supabase CLI access and a live REST round trip, both unavailable from this environment (outbound access to `lmscairdgavntgnwztfk.supabase.co` is blocked by sandbox network egress policy). Those specific claims remain carried-forward evidence from a prior session, not confirmed here.

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
JWT ref MATCH = CONFIRMED (independently verified 2026-06-21)
CLI / REST gateway alignment = UNKNOWN (not independently verified)
```

The app runtime credentials (anon key) are confirmed to reference the same Supabase project ref as the configured URL. CLI-linked-project and REST-gateway-header claims remain unverified pending network access.

## Remaining Scope

This report validates local `.env.local` alignment. Preview and production Vercel environment variables should still be checked in Vercel before browser certification.

