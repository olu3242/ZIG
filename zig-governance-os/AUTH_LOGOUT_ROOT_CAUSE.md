# Root Cause: Logout failure — "This page couldn't load. A server error occurred."

> Investigation only. No fix implemented.

## Logout flow, end to end

1. **Logout button** — `apps/web/app/OSShell.tsx:329-336`:
   ```tsx
   <form action={logoutAction}>
     <button type="submit">Log out</button>
   </form>
   ```
   `OSShell`/`OSLayout` is rendered for every authenticated route via
   `apps/web/app/ShellGate.tsx:9-17`, which wraps all children in `<OSShell>`
   unless the path is in `publicRoutes` (`/`, `/demo`, `/login`, `/signup`,
   `/forgot-password`). So the logout button is present on essentially every
   page in the product.

2. **Server Action** — `apps/web/app/lib/actions.ts:311-317`:
   ```ts
   export async function logoutAction(): Promise<void> {
     await auditAuth("logout", "User logged out");
     const session = await requireSession();
     await safeRecordAuthEvent({ userId: session.userId, eventType: "logout" });
     await clearSession();
     redirect("/login");
   }
   ```

3. **`auditAuth()`** — `apps/web/app/lib/auth.ts:89-97`:
   ```ts
   export async function auditAuth(action: "login" | "logout", reason: string): Promise<void> {
     const cookieStore = await cookies();
     const tenantId = cookieStore.get(tenantCookie)?.value;
     const actorUserId = cookieStore.get(userCookie)?.value;
     if (!tenantId || !actorUserId) {
       return;
     }
     await getZigServices().audit.recordAction({ tenantId, actorUserId }, action, "users", actorUserId, reason);
   }
   ```

## Exact root cause

`auditAuth()` is the **only** call in the entire auth/session flow that is not
wrapped in a `try/catch`-with-fallback, despite being a fallible network call.
Every sibling helper in `actions.ts` that does the same kind of thing
(`safeCreateAuthProfile`, `safeRecordAuthEvent`, `safeFindTenantProfileByAuthUserId`,
`safeAuditLogin`) wraps its call in `try { ... } catch (error) { console.error(...) }`
— `auditAuth` does not, and `logoutAction` calls it directly (`await auditAuth(...)`,
not `await safeAuditAuth(...)`).

`logoutAction()` calls `auditAuth()` **first, before `requireSession()` or
`clearSession()`**. So if `auditAuth()` throws:

- The session is **never cleared** (cookies remain set).
- The user is **never redirected** to `/login`.
- The exception propagates uncaught out of the Server Action.

### Why `auditAuth()` throws

`getZigServices().audit.recordAction(...)` resolves through:

- `AuditService.recordAction` (`packages/services/src/AuditService.ts:6-15`) →
- `SupabaseAuditSink.record` (`packages/data-access/src/SupabaseRestAdapter.ts:130-144`) →
- `SupabaseRestAdapter.insert` → `request()` (`packages/data-access/src/SupabaseRestAdapter.ts:80-101`):

  ```ts
  if (!response.ok) {
    throw new DataAccessError(`Supabase request failed for ${path}: ${response.status} ${await response.text()}`);
  }
  ```

This throws a `DataAccessError` on any non-2xx response from PostgREST when
inserting into `audit_events` — e.g.:
- missing/invalid `SUPABASE_SERVICE_ROLE_KEY`/`NEXT_PUBLIC_SUPABASE_URL` env vars
  (`getZigServices()` → `validateAuthEnvironment()`, `packages/auth/src/env.ts:30-35`,
  throws synchronously before any fetch even happens),
- a Postgres constraint/RLS failure on `audit_events`,
- a transient network error to Supabase.

None of these are caught anywhere between `auditAuth()` and the Server Action
boundary.

## What the user actually sees

Because `OSShell`'s logout form is present on nearly every route, and most
routes (see `AUTH_ROUTE_HEALTH_REPORT.md`) have **no local `error.tsx`**, the
uncaught exception bubbles all the way up with no custom boundary to catch it
— `apps/web/app/layout.tsx` (root layout) has no `error.tsx`/`global-error.tsx`
sibling at all. With no custom boundary anywhere in the tree above the route,
Next.js falls back to its own built-in generic error UI, which is exactly the
generic, app-agnostic copy reported: **"This page couldn't load. A server
error occurred."** (On the minority of routes that do define a local
`error.tsx` — e.g. `/dashboard`, `/frameworks`, `/learning` — the same crash
would instead surface as that route's custom message, e.g. "Dashboard needs a
refresh," not the generic one. The generic message specifically indicates the
user was on a route with no local error boundary when they clicked logout —
which is most of the app's ~50 routes.)

## Severity

**Critical.** This is not a cosmetic bug:
- The user cannot log out at all when this path throws — they remain
  authenticated with cookies intact and stuck on an error screen.
- It depends on transient/environmental conditions (env config, Supabase
  availability, RLS), so it can appear intermittently/in some environments and
  not others, making it hard to reproduce on demand without deliberately
  breaking the audit insert (e.g. temporarily revoking `SUPABASE_SERVICE_ROLE_KEY`
  or pointing at an environment where `audit_events` RLS rejects the insert).

## Recommended remediation (not implemented)

1. Wrap `auditAuth()`'s body in the same `try/catch`-with-log pattern used by
   every other helper in this file (or have `logoutAction` call it through a
   `safeAuditAuth` wrapper), so an audit-logging failure can never block
   logout.
2. Reorder `logoutAction()` so that `clearSession()` (and ideally the
   `redirect`) happen **before** any best-effort side calls like audit logging
   — clearing the session and getting the user to `/login` should not depend
   on telemetry succeeding.
3. Consider a root-level `global-error.tsx` so that any future unguarded throw
   degrades to a branded, recoverable error screen instead of the framework's
   generic fallback — this is a defensive backstop, not a fix for the root
   cause above.
