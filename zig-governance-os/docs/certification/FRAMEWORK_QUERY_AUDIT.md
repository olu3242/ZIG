# Framework Query Audit

Status date: 2026-06-21

> **BRANCH CORRECTION (2026-06-21):** §4 and §5 of this report describe
> `bootstrapAuthenticatedUser` and `AuthRepairClient`, which **do not exist on the
> `claude/hopeful-bardeen-93edl1` branch this file is committed to** — they belong to a
> different branch (`release/mvp-convergence`) examined earlier in the same session by
> mistake. §1–§3 (the actual `frameworks`/`tenant_id` query audit, the RLS/service-role-key
> finding, and the `SupabaseRestAdapter.withFilters()` mechanism) describe code that **does**
> exist on this branch (`packages/data-access/src/SupabaseRestAdapter.ts`,
> `packages/data-access/src/TenantRepository.ts`) and remain accurate. Treat §4–§5 as
> not applicable to this branch; see `AUTH_EXECUTION_TRACE.md` for this branch's real
> post-login call chain.

Scope: every reference to `frameworks.tenant_id`, `.eq("tenant_id"`, `tenant_id=`, and
`from("frameworks")` across the repository, plus the call chain that ultimately executes
those queries.

## 1. Search results

### `frameworks.tenant_id`

One reference, in a SQL view join:

```
supabase/migrations/202606180002_batch_21a_database_foundation.sql:29:
  left join frameworks f on f.id = p.framework_id and f.tenant_id = p.tenant_id
```

### `.eq("tenant_id"` (Supabase JS client syntax)

**No matches anywhere in the repo.** This codebase does not use the Supabase JS query
builder (`.eq(...)`) for data access. All tenant-scoped reads/writes go through a
hand-rolled REST adapter (see §3).

### `tenant_id=` (PostgREST query-string filter)

No literal string match, but the equivalent is generated dynamically at runtime:

```
packages/data-access/src/SupabaseRestAdapter.ts:113
  params.set("tenant_id", `eq.${context.tenantId}`);
```

This is the functional equivalent of `tenant_id=eq.<value>` on every single PostgREST
request issued through `SupabaseRestAdapter.withFilters()` — i.e. every `findById`,
`findMany`, `search`, `update`, and `delete` call, for every table, including `frameworks`.

### `from("frameworks")`

No literal Supabase-JS `.from("frameworks")` call exists. The equivalent REST path is built
as a plain string in `TenantRepository`/`SupabaseRestAdapter`, registered once in
`packages/data-access/src/repositories.ts:146`:

```ts
frameworks: new TenantRepository("frameworks", new SupabaseRestAdapter<FrameworkRecord>(config), auditEvents),
```

Every read of frameworks for the product UI goes through
`FrameworkService.findAvailableFrameworks()` (`packages/services/src/FrameworkService.ts:5`):

```ts
findAvailableFrameworks(context: TenantContext): Promise<FrameworkRecord[]> {
  return this.repository.findMany(context, { filters: { status: "active" } });
}
```

called from `apps/web/app/lib/data.ts:11,120,128`.

## 2. Database-level definition

`supabase/migrations/202606180001_batch_21_core_data_platform.sql`:

```
106: create table frameworks ( ... )
333: create index on frameworks (tenant_id);
380: alter table frameworks enable row level security;
407: create policy tenant_frameworks_access on frameworks
       using (tenant_id = current_tenant_id())
       with check (tenant_id = current_tenant_id());
```

`current_tenant_id()` (`supabase/functions/current_tenant_id.sql`) reads a Postgres session
GUC: `current_setting('app.current_tenant_id', true)`.

**No code in this repo sets `app.current_tenant_id`** (no `set_config`, no
`SET app.current_tenant_id`, anywhere in `packages/` or `apps/`). The RLS policy is
therefore inert for any connection that doesn't separately set that GUC — and the app never
does, because of §3 below.

## 3. The actual enforcement mechanism — and the gap

`SupabaseRestAdapter.request()` (`packages/data-access/src/SupabaseRestAdapter.ts:79-94`)
authenticates every request with:

```ts
apikey: this.config.serviceRoleKey,
Authorization: `Bearer ${this.config.serviceRoleKey}`,
```

The **service role key bypasses Postgres RLS entirely** (PostgREST grants `service_role`
the `BYPASSRLS` attribute). This means:

- The `tenant_frameworks_access` RLS policy on `frameworks` (and the equivalent policies on
  every other table) is **not actually being enforced** for any request issued by this app
  — RLS is dead code from the running application's point of view.
- The **only** tenant isolation actually happening is the application-level
  `params.set("tenant_id", \`eq.${context.tenantId}\`)` filter injected by
  `SupabaseRestAdapter.withFilters()` on every read/update/delete.
- This filter is applied unconditionally and cannot be bypassed by a caller forgetting an
  `.eq()` — there is no `.eq()` call site to forget, because `withFilters()` is the single
  chokepoint all tenant-scoped reads funnel through (`findById`, `findMany`, `search`,
  `update`, `delete` in `TenantRepository.ts` all delegate to it).
- `insert()` does not call `withFilters()` (no filter is needed on insert), but it does
  rely on `TenantRepository.create()` (`packages/data-access/src/TenantRepository.ts:20-27`)
  stamping `tenantId: context.tenantId` onto the record before sending it — so a correct
  `tenantId` write still depends on whatever sets `context.tenantId` upstream being correct.

**This matches the standing project rule "tenant isolation must be enforced at the data
layer, not just the UI" only partially**: isolation *is* enforced at the data layer, but via
an application-level WHERE-clause convention rather than the database-level RLS the schema
was written to rely on. If `SupabaseRestAdapter` is ever bypassed (a new code path that
calls Supabase directly, or a raw `fetch()` added elsewhere with the service-role key), there
is **no RLS backstop** — cross-tenant data would be returned with no second line of defense.

## 4. `bootstrapAuthenticatedUser()` inspection

File: `apps/web/src/lib/auth/bootstrap.ts`.

```
bootstrapAuthenticatedUser(session)
  -> ensureUserProfile(session)        -> AuthRepairClient.getOne / upsert on "users"
  -> ensureOrganization(profile)       -> AuthRepairClient.getOne / insert on "tenants"
  -> ensureDefaultRole(...) x6         -> sequential loop, AuthRepairClient.upsert per role on "roles"
  -> ensureMembership(...)             -> AuthRepairClient.getOne / insert on "memberships"
  -> ensureLearningProfile(...)        -> AuthRepairClient.getOne / insert on "learning_profiles"
```

This does **not** touch `frameworks` at all — frameworks are not part of the auth bootstrap
chain, consistent with the Universal Governance Model (frameworks attach to
projects/controls, not to user/tenant provisioning).

`AuthRepairClient` (`apps/web/src/lib/auth/repair.ts`) is a second, independent REST client
— it also uses the service-role key directly via raw `fetch()`, and does **not** go through
`SupabaseRestAdapter`/`TenantRepository` at all. It builds its own query strings ad hoc per
call site rather than through a shared `withFilters()`-style chokepoint, which means its
tenant-scoping discipline is not structurally guaranteed the way `SupabaseRestAdapter`'s is
— each call site must remember to filter correctly by hand. (No `tenant_id=` literal filter
was found inside `repair.ts`; its `getOne`/`upsert` calls filter by `id` or unique business
keys such as user id, not by tenant, which is appropriate for `users`/`tenants` bootstrap
rows but is a structurally different pattern from the `frameworks` access path above.)

## 5. Call chain after `signInWithPassword()` and the first unguarded exception path

**Correction on the API name:** this codebase does not call `signInWithPassword()` for the
email/password login path. The Supabase JS SDK's `signInWithPassword` is not used anywhere
in the repo (confirmed by repo-wide search — no match). The actual email/password call is a
hand-rolled REST request: `loginWithEmail()` in `apps/web/app/lib/supabase.ts`, which `POST`s
to `${SUPABASE_URL}/auth/v1/token?grant_type=password` directly. Treating that as the
equivalent entry point, the call chain after it is:

```
loginWithEmail(email, password)                         [supabase.ts]   — try/catch guarded in loginAction
  -> setSession(session)                                  [auth.ts]      — no I/O, can't throw meaningfully
  -> safeCreateAuthProfile(...)                            [actions.ts]   — try/catch guarded internally
  -> safeRecordAuthEvent(...)                              [actions.ts]   — try/catch guarded internally
  -> bootstrapAuthenticatedUser(session)                   [bootstrap.ts] — *** UNGUARDED in loginAction ***
       -> ensureUserProfile        -> AuthRepairClient.request()  — fetch() not try/catch-wrapped
       -> ensureOrganization       -> AuthRepairClient.request()  — fetch() not try/catch-wrapped
       -> ensureDefaultRole x6     -> AuthRepairClient.request()  — fetch() not try/catch-wrapped
       -> ensureMembership         -> AuthRepairClient.request()  — fetch() not try/catch-wrapped
       -> ensureLearningProfile    -> AuthRepairClient.request()  — fetch() not try/catch-wrapped
  -> setTenantProfile(...) / safeAuditLogin(...) / redirect("/dashboard")
```

**First unguarded exception path:** `apps/web/app/lib/actions.ts:72`
(`const bootstrap = await bootstrapAuthenticatedUser(session);` inside `loginAction`) is the
first point in the post-login chain with no surrounding try/catch. Any exception thrown by
any of the five sequential steps inside it — each backed by an unguarded `fetch()` in
`AuthRepairClient.request()` (`apps/web/src/lib/auth/repair.ts`) — propagates all the way out
of the Server Action unhandled. This is the same finding already reported in
`AUTH_ROOT_CAUSE_REPORT.md` for the production `/login` 500; this audit independently
confirms it by tracing the chain from the data-access layer rather than from the action
layer, and additionally confirms it has nothing to do with `frameworks` queries — the
`frameworks` table is untouched by this chain.

## Summary of findings

| Finding | Severity |
| --- | --- |
| `frameworks` (and every other table) tenant isolation is enforced only by an app-level `tenant_id=eq.<id>` filter in `SupabaseRestAdapter.withFilters()`, not by the RLS policies the schema defines — RLS is unreachable because all requests use the service-role key | High — no DB-level backstop if a future code path bypasses the adapter |
| `current_tenant_id()` / `app.current_tenant_id` GUC is never set anywhere in app code, confirming RLS policies on `frameworks` and other tables are dead from the app's perspective | High — same root cause as above |
| `AuthRepairClient` (used by `bootstrapAuthenticatedUser`) does not share `SupabaseRestAdapter`'s `withFilters()` chokepoint; each call site builds its own filters by hand | Medium — not currently misused, but no structural guarantee against a future mistake |
| First unguarded exception path post-login is `bootstrapAuthenticatedUser(session)` at `actions.ts:72`, matching prior `AUTH_ROOT_CAUSE_REPORT.md` finding | Confirmed by independent trace — see that report for remediation |
| No `frameworks`-specific tenant leakage was found; the queries are uniformly tenant-scoped at the adapter layer | Informational |
