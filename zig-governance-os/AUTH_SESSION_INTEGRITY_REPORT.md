# Auth & Session Integrity Report

> Investigation only. No fixes implemented. Companion to `AUTH_LOGOUT_ROOT_CAUSE.md`.

## Session model

Cookies (`apps/web/app/lib/auth.ts:6-20`): `zig_session` (JSON: `accessToken`,
`refreshToken?`, `userId`, `email`), `zig_tenant_id`, `zig_user_id`,
`zig_persona`. All `httpOnly`, `sameSite: lax`, `secure` in production,
7-day `maxAge`.

## 1. Does logout clear session/cookies correctly?

**Yes, if reached.** `clearSession()` (`apps/web/app/lib/auth.ts:35-40`) deletes
all four cookies unconditionally. The defect identified in
`AUTH_LOGOUT_ROOT_CAUSE.md` is that `clearSession()` is **never reached** when
`auditAuth()` throws first — so when the bug fires, cookies are *not* cleared
and the user stays logged in (stuck on an error screen, not logged out).
Severity: **Critical** (compounds the logout bug: not just "ugly error", but
"logout silently doesn't happen").

## 2. Does the redirect target load correctly?

`/login` is in `proxy.ts`'s `publicRoutes` allowlist and in `ShellGate.tsx`'s
`publicRoutes`, so it loads outside the OS shell and without requiring a
session. Not implicated in the failure — the redirect is never reached when
the bug fires, but if it were reached, `/login` itself is fine.

## 3. Null-user / session / bootstrap / onboarding assumptions

- **`getSession()`** (`auth.ts:42-57`) is defensively written: missing cookie,
  unparseable JSON, or a parsed object missing `accessToken`/`userId`/`email`
  all safely resolve to `null`. No null-assumption risk here.
- **`requireSession()`** (`auth.ts:59-65`) calls `redirect("/login")` if
  `getSession()` returns null — a safe, intentional control-flow throw (Next's
  internal `NEXT_REDIRECT` signal, not a generic error), not a crash.
- **`requireTenantContext()`** (`auth.ts:67-79`) similarly redirects to
  `/onboarding` if any of `tenantId`/`actorUserId`/`persona` cookies are
  missing — also a safe redirect, not a crash. (This was the leading
  hypothesis investigated for the separate "Framework library needs a
  refresh" bug and was ruled out there for the same reason: redirects don't
  produce generic error screens.)
- **`bootstrapAuthenticatedUser()`** (`apps/web/src/lib/auth/bootstrap.ts:46-114`)
  is consistently defensive: every fallible step (`ensureUserProfile`,
  `ensureOrganization`, `ensureDefaultRole`, `ensureMembership`,
  `ensureLearningProfile`) checks `.ok` and falls back to a `degraded(...)`
  result rather than throwing; telemetry (`safeEvent`, line 234-240) is
  explicitly wrapped: *"Observability should never block auth recovery."*
  **This is the correct pattern that `auditAuth()` in `actions.ts` should
  follow but currently does not** — `auditAuth()` is the one place in the
  entire auth surface that breaks this convention.
- **`onboardingRouteForBootstrap()`** (`bootstrap.ts:119-135`) has a string-based
  `reason.includes(...)` dispatch with a final catch-all
  (`/onboarding?reason=...`) — no null-assumption risk, always returns a route.
- **`loginAction`/`signupAction`** (`actions.ts:23-113`) both wrap
  `bootstrapAuthenticatedUser()` in try/catch and degrade gracefully. They are
  internally consistent and do **not** have the same unguarded-audit-call
  pattern that `logoutAction` has — `loginAction` doesn't call `auditAuth`
  directly at all (it uses `safeAuditLogin`, which *is* wrapped).

## Conclusion

The session/bootstrap/onboarding layer is, on the whole, defensively written
and consistent with a documented internal philosophy ("observability should
never block auth recovery"). The single, isolated violation of that philosophy
is `auditAuth()` being called unguarded from `logoutAction()` — this is a
narrow, mechanical inconsistency rather than a systemic null-safety problem in
the auth layer.

## Severity summary

| Area | Finding | Severity |
|---|---|---|
| `logoutAction` → `auditAuth()` | Unguarded fallible call, blocks logout entirely on failure | Critical |
| `getSession`/`requireSession`/`requireTenantContext` | Defensive, redirect-based, no issue found | None |
| `bootstrapAuthenticatedUser` and helpers | Defensive, consistent `.ok`-checked degradation | None |
| `loginAction`/`signupAction` audit calls | Already correctly wrapped (`safeAuditLogin`, `safeRecordAuthEvent`) | None |
