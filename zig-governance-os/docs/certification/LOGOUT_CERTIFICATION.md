# Logout Certification

Status date: 2026-06-21

## Audit finding

`logoutAction` already existed in `apps/web/app/lib/actions.ts`:

```ts
export async function logoutAction(): Promise<void> {
  await auditAuth("logout", "User logged out");
  await clearSession();
  redirect("/login");
}
```

`clearSession()` (`apps/web/app/lib/auth.ts`) deletes all four auth cookies
(`zig_session`, `zig_tenant_id`, `zig_user_id`, `zig_persona`).

**Gap found**: no UI control anywhere in the app called `logoutAction` — confirmed via a
repo-wide search for `logoutAction` usage, which returned only its own definition. There was
no visible way for a logged-in user to log out.

## Fix applied

Added a "Log out" button to the top navigation in `apps/web/app/OSShell.tsx`:

```tsx
<form action={logoutAction}>
  <button type="submit" aria-label="Log out" ...>Log out</button>
</form>
```

This is the existing, unmodified `logoutAction` — no new auth/session logic was written, per
the "do not redesign auth" constraint. Build-verified (`npm run build --workspace web`
passes with this change included).

## Required behavior (per spec)

```
Click Logout -> Session destroyed -> Redirect to /login -> Protected routes inaccessible
```

Code-level: matches (`clearSession()` then `redirect("/login")`; protected pages call
`requireSession()`/`requireTenantContext()` which redirect to `/login` once the session
cookie is gone).

## Live verification

**Not performed.** No browser tool in this session to click the new button and observe
cookie clearing / redirect / protected-route blocking in a real browser.

## Result

```
Logout control exists = YES (added this session)
Logout wiring (code-level) = CORRECT
Logout (live browser) = NOT TESTED
```
