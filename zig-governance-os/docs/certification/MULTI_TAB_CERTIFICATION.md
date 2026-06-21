# Multi-Tab Certification

Status date: 2026-06-21

## Requested check

Tab A logs in; Tab B opens `/dashboard`; logout from Tab A; refresh Tab B; expect session
invalidated, redirect to login.

## Code-level findings

- Session state lives entirely in cookies (`zig_session`, `zig_tenant_id`, `zig_user_id`,
  `zig_persona`), which are shared across all tabs of the same browser by the browser's
  cookie jar — there is no per-tab or in-memory client session state to get out of sync.
- `logoutAction` (now wired to a visible button per `LOGOUT_CERTIFICATION.md`) calls
  `clearSession()`, which deletes all four cookies server-side via `Set-Cookie` response
  headers on the logout request.
- Because `proxy.ts` (confirmed wired into the Next.js middleware slot — see
  `PROTECTED_ROUTE_CERTIFICATION.md`) checks `request.cookies.has("zig_session")` on every
  request, a refresh in Tab B after Tab A's logout would no longer find the cookie (it was
  deleted by Tab A's response) and should redirect to `/login` — consistent with the
  requested behavior, by code design.

## Live verification

**Not performed.** No browser tool in this session to open two tabs and observe this
interaction directly.

## Result

```
Multi-tab session invalidation (code-level reasoning) = CONSISTENT WITH SPEC
Multi-tab session invalidation (live browser) = NOT TESTED
```
