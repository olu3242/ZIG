# Auth Hotfix Report

Status date: 2026-06-21

Branch: `claude/hopeful-bardeen-93edl1`. Commit: `a8b88cf`.

## What this session could and could not do

This sandbox has **no Vercel deploy access, no Vercel log access, and no outbound network
access to `*.supabase.co`** (confirmed in an earlier part of this session via repeated
`curl` 403 "Host not in allowlist" responses). It also has no browser tool. Tasks 8–10 of
the requested execution plan (production verification, deployment-ID capture, live login
retest, full multi-tab/session/logout browser certification) **require capabilities this
session does not have** and were not performed. Reporting them as PASS would be a
fabricated claim — this report states exactly what was and wasn't verified.

## Root cause (corrected from earlier session work)

An earlier root-cause report (`AUTH_ROOT_CAUSE_REPORT.md`) and the framework audit
(`FRAMEWORK_QUERY_AUDIT.md`) were written against a *different* branch's code
(`release/mvp-convergence`, which has a `bootstrapAuthenticatedUser`/`AuthRepairClient`
chain). That code does not exist on `claude/hopeful-bardeen-93edl1`. Both files now carry a
correction note; see `AUTH_EXECUTION_TRACE.md` for the real trace on this branch.

The actual finding on this branch: `loginAction` and `signupAction`
(`apps/web/app/lib/actions.ts`) had **no try/catch anywhere in their bodies**. Three
unguarded calls could throw and crash the Server Action into an unhandled-exception `500`:

1. `loginWithEmail(email, password)` — throws on missing Supabase env vars
   (`getSupabaseConfig()`), on any non-2xx response from Supabase's
   `/auth/v1/token?grant_type=password` (including ordinary wrong-password cases, which is
   also a UX bug independent of the production-only symptom), or on a malformed auth
   response.
2. `findTenantProfileByAuthUserId(session.userId)` — raw REST call with the service-role
   key; throws on any non-2xx response.
3. `getZigServices().audit.recordAction(...)` — raw REST insert into `audit_events`; throws
   on any non-2xx response.

Because env-var/network conditions differ between localhost and the Vercel production
runtime, any of these three becoming non-2xx in production but not locally explains the
reported "localhost works, production 500s" split. **Which of the three actually fires in
production was not confirmed** — no Vercel log access — so this remains the leading
hypothesis, not a proven root cause.

## Fix applied

`apps/web/app/lib/actions.ts`, both `loginAction` and `signupAction`:

- Wrapped `loginWithEmail` in try/catch → on failure, logs `[AUTH LOGIN ERROR]` and redirects
  to `/login?error=invalid_credentials` instead of crashing.
- Wrapped `findTenantProfileByAuthUserId` in try/catch → on failure, logs
  `[AUTH PROFILE ERROR]` and falls through to the existing `!profile` branch (redirect to
  `/onboarding`), exactly matching the pre-existing "no profile yet" code path. Login is not
  blocked by this failure.
- Wrapped `setTenantProfile` + `audit.recordAction` in try/catch → on failure, logs
  `[AUTH AUDIT ERROR]` and continues to `/dashboard` anyway — an audit-log failure no longer
  blocks a successful login.
- Wrapped `signUpWithEmail` in try/catch → on failure, logs `[AUTH SIGNUP ERROR]` and
  redirects to `/signup?error=signup_failed` instead of crashing.
- Added structured `console.log("[AUTH]", ...)` lines at the start/end of each step
  (`LOGIN_START`, `LOGIN_SUCCESS`, `PROFILE_LOOKUP_START`, `PROFILE_LOOKUP_COMPLETE`,
  `AUDIT_RECORDED`, `SIGNUP_START`, `SIGNUP_COMPLETE`) so a future Vercel log lookup can pin
  down exactly which step failed, by digest, without needing another investigation like this
  one.

No changes were made to auth design, onboarding design, tenancy, lifecycle, the database
schema, Supabase configuration, or middleware/`proxy.ts`, per the stated constraints.

## Deployment ID

**Not available.** This session has no Vercel CLI/API access and did not trigger or observe
a deployment. The commit (`a8b88cf` on `claude/hopeful-bardeen-93edl1`) is pushed to GitHub;
whoever has Vercel access must deploy it (or merge to the branch Vercel watches) to take
effect in production.

## Test evidence

- `npm run lint --workspace web`: pre-existing failures in `apps/web/app/OSShell.tsx` and
  `apps/web/app/learning/module/[id]/page.tsx` (both unrelated to this change, confirmed via
  `git log` to predate this commit). `actions.ts` itself introduces no new lint errors.
- `npm run build --workspace web`: **PASS** — full production build completed, all 61
  routes generated, no type errors, no build failures.
- **No live login attempt was made** against production or any Supabase project — network
  access is blocked in this sandbox. This is a static/build-level verification only.

## Remaining risks

- The actual failing call among the three candidates above is still unconfirmed. If the real
  cause is hypothesis 1 (missing/misnamed env var in Vercel), this fix prevents the 500 but
  the user will be silently redirected to `/login?error=invalid_credentials` even with
  correct credentials — better than a 500, but still broken login, just with a clearer
  symptom. Someone with Vercel env var access should diff production vs. local env var names
  as a parallel check.
- This fix does not address the underlying wrong-credentials UX bug noted in candidate 1
  (a normal bad password was already producing a 500 instead of a clean error message,
  independent of the production-only issue) — it's fixed as a side effect of this patch, not
  a separate investigation.
- Tasks 8–10 (production retest, full auth-lifecycle browser certification covering session
  persistence, protected routes, logout, multi-tab, session expiration) are **not executed**.
  See `LOGIN_RETEST_REPORT.md` and `BOOTSTRAP_TRACE_REPORT.md` for what's confirmed vs. not.

## Status

```
Code fix: APPLIED AND PUSHED (commit a8b88cf, claude/hopeful-bardeen-93edl1)
Build validation: PASS
Production deployment: NOT PERFORMED (no Vercel access in this session)
Production verification: NOT PERFORMED (no network/browser access in this session)
Incident status: FIX READY FOR DEPLOY — NOT YET CONFIRMED RESOLVED
```
