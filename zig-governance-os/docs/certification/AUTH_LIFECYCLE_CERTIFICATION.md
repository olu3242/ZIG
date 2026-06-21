# Authentication Lifecycle Certification

Status date: 2026-06-21

## Scope and constraint

Task 10 of the incident plan asks for live, browser-driven certification of 8 auth flows
(Login, Session Persistence, Protected Route Access, Logout, Session Expiration, Re-login,
Browser Refresh, Multi-tab Behaviour). **This sandbox has no browser tool and no network
access to the production Supabase project**, so none of these flows could be exercised
live. This certification is therefore **code-level only** — it confirms what the code does
by inspection, and explicitly marks what was not (and could not be) observed running.

Per-flow detail is in `LOGIN_CERTIFICATION.md`, `LOGOUT_CERTIFICATION.md`,
`SESSION_CERTIFICATION.md`, `PROTECTED_ROUTE_CERTIFICATION.md`, and
`MULTI_TAB_CERTIFICATION.md`. This file is the roll-up.

## Roll-up

| Flow | Code-level finding | Live-verified? |
| --- | --- | --- |
| Login | Hardened this session — see `AUTH_HOTFIX_REPORT.md` | No |
| Session Persistence | `zig_session` cookie is `httpOnly`, `sameSite: lax`, `path: "/"`, no `maxAge`/`expires` set → defaults to a session cookie that does not survive browser close, but does survive refresh/new-tab while the browser stays open | No |
| Protected Route Access | Enforced by `requireSession`/`requireTenantContext` (`apps/web/app/lib/auth.ts`) called from server components/actions; relies on each protected page calling one of these — not a global middleware gate (see `PROTECTED_ROUTE_CERTIFICATION.md`) | No |
| Logout | **Gap found and fixed this session**: `logoutAction` existed but no UI control called it anywhere in the app. Added a "Log out" button to `OSShell.tsx`'s top navigation, wired to the existing action. | No |
| Session Expiration | No client-side refresh-token rotation logic found; `AuthSession.refreshToken` is stored but never used to refresh `accessToken` anywhere in `apps/web` | No |
| Re-login | Same code path as Login | No |
| Browser Refresh | Cookie-based session is read fresh from cookies on every server request, so a refresh re-reads `getSession()`; no client-side state to go stale | No |
| Multi-tab Behaviour | Cookies are shared across tabs in the same browser by design; logging out in one tab clears `zig_session` for all tabs of that browser, so a subsequent action in another tab will fail `requireSession` and redirect to `/login`. Not verified live. | No |

## What is and isn't certified

```
Code exists and is internally consistent for: Login (hardened), Logout (now wired),
  Protected Route gating, cookie-based Session model.

NOT verified by running the app: every row above. No PASS claim is made for any live
  browser behavior — see individual certification files for the specific gaps each
  describes.
```

## Status

```
Production Auth Status = NOT GREEN — code-level hardening applied and build-verified;
  live certification requires an operator with browser + production network access.
```
