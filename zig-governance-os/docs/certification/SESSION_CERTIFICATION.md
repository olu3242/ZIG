# Session Certification

Status date: 2026-06-21

## Requested checks

After login: refresh browser, open a new tab, navigate to `/dashboard`, `/projects`,
`/assets`, `/controls`, `/mission-control`; verify session persists, no unexpected
redirects, no session loss.

## Code-level findings

- Session is stored entirely server-side via cookies (`zig_session`, `zig_tenant_id`,
  `zig_user_id`, `zig_persona`), set with `httpOnly: true, sameSite: "lax", path: "/"` and
  **no explicit `maxAge`/`expires`** (`apps/web/app/lib/auth.ts`). Without an explicit
  expiry, this is a browser *session* cookie — it persists across page refreshes and new
  tabs in the same browser session, but is cleared when the browser itself is closed
  (not just the tab). This matches "refresh" and "new tab" requirements but means there is
  no "remember me" / long-lived session unless added deliberately.
- Every server component/action that needs auth calls `requireSession()` or
  `requireTenantContext()` (`apps/web/app/lib/auth.ts`), which reads the cookie fresh on
  every request — there is no client-side cached auth state that could go stale across a
  refresh or new tab.
- `/controls` route exists (`apps/web/app/controls/page.tsx` confirmed present in the build
  route list). `/assets` was **not found** as a top-level route in the build output (the
  build's route list includes `/risks`, `/controls`, `/evidence`-adjacent pages, but no
  `/assets`) — if `/assets` is expected to exist as a protected route, it does not currently
  exist on this branch and should be flagged separately; this is unrelated to the login
  incident and was not investigated further here.

## Live verification

**Not performed.** No browser tool in this session.

## Result

```
Session persistence (code-level) = CONSISTENT (cookie read fresh per request, no stale client state)
Session persistence (live browser) = NOT TESTED
Note: /assets route not found in this branch's build output — separate finding, not
  part of this incident.
```
