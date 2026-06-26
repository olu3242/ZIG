# Root Cause: "Framework library needs a refresh"

> Investigation only. No fix has been implemented, per explicit instruction.

## Symptom

`apps/web/app/frameworks/error.tsx` is a `"use client"` error boundary for the
entire `/frameworks` route segment (covers `/frameworks` and `/frameworks/[id]`).
It renders the literal text "Framework library needs a refresh" for **any**
uncaught exception thrown by a Server Component in that segment. In production
builds, `error.message` is replaced by Next.js with an opaque digest, hiding the
real error.

Confirmed there is only one such boundary in the source tree (the other two
matches for the string are compiled `.next` build artifacts of this same file).

## Exact failing call chain

1. `apps/web/app/frameworks/page.tsx:7` renders the Framework Library index via
   `await loadFrameworks()` (`apps/web/app/lib/data.ts:81-97`). This call is
   internally protected by `safeLoad()`, so DB/env failures here gracefully
   degrade to `fallbackFrameworks()` — **this page does not crash**.

2. `fallbackFrameworks()` (`apps/web/app/lib/data.ts:108-120`) builds demo
   framework records from `FrameworkRegistry.list()`
   (`packages/framework-engine/src/FrameworkRegistry.ts:61-63`), assigning:

   ```ts
   id: framework.code.toLowerCase()   // e.g. "iso27001", "soc2", "nist_csf"
   ```

   i.e. a lowercase **slug string**, not a database UUID.

3. `page.tsx:18` links each card to `/frameworks/${framework.id}` — e.g.
   `/frameworks/iso27001`.

4. `apps/web/app/frameworks/[id]/page.tsx:9-10`:

   ```ts
   const { context } = await requireTenantContext();
   const framework = await getZigServices().frameworks.findById(context, id);
   ```

   This call is **not wrapped in any try/catch or `safeLoad`** — unlike every
   other data call in `data.ts`.

5. `getZigServices().frameworks.findById` resolves through:
   - `FrameworkService` (no override; inherits `BaseService.findById` —
     `packages/services/src/BaseService.ts:18-20`)
   - `TenantRepository.findById` (`packages/data-access/src/TenantRepository.ts:55-57`)
   - `SupabaseRestAdapter.findById` (`packages/data-access/src/SupabaseRestAdapter.ts:60-63`),
     which issues:

     ```
     GET /rest/v1/frameworks?tenant_id=eq.<tenantId>&id=eq.iso27001
     ```

6. The `frameworks` table's `id` column is declared as `uuid`
   (`supabase/migrations/202606180001_batch_21_core_data_platform.sql:106-107`):

   ```sql
   create table frameworks (
     id uuid primary key default gen_random_uuid(),
     tenant_id uuid not null references tenants(id) on delete cascade,
     ...
   );
   ```

7. PostgREST rejects `id=eq.iso27001` because `"iso27001"` is not a valid UUID,
   returning HTTP 400 with a body like:

   ```
   invalid input syntax for type uuid: "iso27001"
   ```

8. `SupabaseRestAdapter.request()` (`packages/data-access/src/SupabaseRestAdapter.ts:92-94`)
   converts this into a thrown `DataAccessError`:

   ```ts
   if (!response.ok) {
     throw new DataAccessError(`Supabase request failed for ${path}: ${response.status} ${await response.text()}`);
   }
   ```

9. This `DataAccessError` is never caught anywhere in the chain above
   `FrameworkDetailPage` — it propagates uncaught out of the Server Component,
   and Next.js renders the nearest error boundary: `apps/web/app/frameworks/error.tsx`,
   producing the "Framework library needs a refresh" message.

## Root-cause category

**Registry/service ID-shape mismatch**, not a missing-framework, schema-migration,
or cache issue:

- The demo/fallback path (`fallbackFrameworks()`) generates framework `id`s as
  lowercase framework **codes** (`"iso27001"`).
- The real persistence path (`frameworks` table + `SupabaseRestAdapter`) expects
  framework `id`s to be **UUID primary keys**.
- `/frameworks/[id]/page.tsx` has no guard for this mismatch and no try/catch
  around the lookup, so any non-UUID `id` (which is exactly what the demo/fallback
  list currently produces) throws an uncaught `DataAccessError` straight into the
  generic error boundary.

This reproduces deterministically whenever:
- `listLifecycleFrameworks()` / `loadFrameworks()` returns the fallback demo set
  (e.g., empty `frameworks` table, missing Supabase env vars, or any REST error
  caught by `safeLoad`), **and**
- the user then clicks through to a framework detail page from that list.

It would also reproduce with a real DB-backed framework list if any caller ever
passes a non-UUID `id` to `/frameworks/[id]` (e.g. a stale bookmark, a manually
typed slug, or a link built from `code` instead of the DB `id`).

## Secondary (latent, not the trigger here) issue noted during investigation

`loadFrameworks()` (`apps/web/app/lib/data.ts:83`) calls:

```ts
return safeLoad(async () => { ... }, fallbackFrameworks());
```

`fallbackFrameworks()` is evaluated **eagerly** on every call (it's a plain
argument expression, not a thunk), regardless of whether the `try` succeeds.
Currently this is harmless because `fallbackFrameworks()` only touches
`FrameworkRegistry.list()`, an in-memory static lookup that cannot throw — but
it is not lazy, and would un-suppress an exception if `fallbackFrameworks()`
itself ever became fallible. Not the cause of the reported symptom; flagged for
awareness only.

## Recommended fix (not implemented)

Do not implement yet, per instruction. For a future fix, the two real options are:

1. Stop generating fallback framework `id`s as lowercase codes; either omit the
   detail link for fallback/demo frameworks, or route fallback framework detail
   pages through `FrameworkRegistry.findById`/`.get(code)` (code-keyed, in-memory,
   cannot 400) instead of the Supabase-backed `findById`.
2. Wrap the `requireTenantContext()` + `getZigServices().frameworks.findById()`
   call in `apps/web/app/frameworks/[id]/page.tsx` in the same `safeLoad`-style
   try/catch used elsewhere in `data.ts`, treating a `DataAccessError` (or any
   thrown error) as "not found" rather than letting it crash the page — this
   addresses the symptom generally, independent of the ID-shape issue.

Both should probably be done together: (2) as a defensive backstop everywhere
in this segment, (1) as the actual fix for the ID mismatch.
