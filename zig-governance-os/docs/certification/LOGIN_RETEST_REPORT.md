# Login Retest Report

Status date: 2026-06-21

## What was requested

Task 8 of the incident plan asks for a live production retest: `GET /login = 200`,
`POST /login != 500`, user authenticated, session created, dashboard loads.

## What could actually be performed in this session

**No live retest was performed.** This sandbox has:

- No Vercel deploy access — the hotfix commit (`a8b88cf`,
  `claude/hopeful-bardeen-93edl1`) is pushed to GitHub only; nothing was deployed to
  `zig-rosy.vercel.app` from this session.
- No outbound network access to `*.supabase.co` (confirmed via repeated `curl` 403 "Host not
  in allowlist" earlier in this session) or to the production Vercel URL.
- No browser tool to drive an actual login attempt even if network access existed.

Reporting `PASS` here would be a fabricated claim, contrary to this project's standing
evidence-integrity rule (carried through every certification doc produced this session).

## What was actually verified (build-level only)

| Check | Result |
| --- | --- |
| `npm run build --workspace web` | PASS — clean production build, all routes generated |
| `npm run lint --workspace web` | 2 pre-existing failures, both unrelated to this change (confirmed via `git log` to predate this commit) |
| Static trace confirms `loginAction`/`signupAction` no longer have any code path that can throw past a try/catch | Confirmed by code reading (`AUTH_EXECUTION_TRACE.md`, `AUTH_HOTFIX_REPORT.md`) |
| Live `GET /login` / `POST /login` against production | **NOT TESTED** |

## Required follow-up (for whoever has Vercel/network access)

1. Deploy commit `a8b88cf` (or merge `claude/hopeful-bardeen-93edl1`) to the environment
   Vercel builds from production.
2. `GET https://zig-rosy.vercel.app/login` → expect `200` (unchanged by this fix; already
   reported working).
3. `POST /login` with valid production credentials → expect a redirect to `/dashboard`
   (not `500`). If credentials are wrong, expect a redirect to
   `/login?error=invalid_credentials` (not `500`).
4. Pull the Vercel function log for the request and check the new `[AUTH]` log lines
   (`LOGIN_START`, `LOGIN_SUCCESS`, `PROFILE_LOOKUP_START`/`COMPLETE`, `AUDIT_RECORDED`) or
   the new `[AUTH ... ERROR]` lines to see exactly which step — if any — is still failing
   even though it no longer crashes the request.
5. Confirm `zig_session`, `zig_tenant_id`, `zig_user_id`, `zig_persona` cookies are set and
   `/dashboard` renders real data.

## Status

```
PRODUCTION LOGIN STATUS = UNKNOWN (not retested — no deploy/network/browser access)
Code-level fix: APPLIED, BUILD-VERIFIED
Live verification: PENDING — requires a session/operator with Vercel + network access
```
