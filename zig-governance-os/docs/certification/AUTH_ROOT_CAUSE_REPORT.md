# Auth P0 Incident — Root Cause Report

Status date: 2026-06-21

> **BRANCH CORRECTION (2026-06-21):** This report describes `bootstrapAuthenticatedUser`,
> `AuthRepairClient`, and related files (`src/lib/auth/bootstrap.ts`, `src/lib/auth/repair.ts`,
> `oauth-callback.ts`). **That code does not exist on the `claude/hopeful-bardeen-93edl1`
> branch this file is committed to** — it was carried over by mistake from a different
> branch (`release/mvp-convergence`) examined earlier in the same session. Everything below
> is accurate for that other branch only. For the actual root-cause analysis of this
> branch's `loginAction`, see `AUTH_EXECUTION_TRACE.md` and `AUTH_HOTFIX_REPORT.md` in this
> same directory. This file is left in place, uncorrected otherwise, to preserve the audit
> trail rather than silently deleting prior work.

Incident: `POST /login` returns `500 Internal Server Error` (reported Digest `913217483`) on
`https://zig-rosy.vercel.app/login` in production. Localhost login reportedly works.

## Evidence Availability — read this first

This investigation was performed by static code tracing only. The following required
evidence sources were **not available** in this session and could not be obtained:

- Vercel runtime/function logs (no tool access to Vercel in this environment).
- Live reproduction against the production Supabase project (`*.supabase.co` outbound
  network access is blocked by sandbox egress policy — confirmed via repeated `curl`
  403 "Host not in allowlist" responses).

Because of this, **the exact exception type, stack trace, file, and line number for Digest
`913217483` could not be confirmed**, and the conclusions below are a **code-derived
hypothesis, not a verified root cause**. Anyone with Vercel log access should pull the
function log for that digest and check it against the "Predicted failure point" section
before treating this as closed.

## Login flow trace

```
Login Page (apps/web/app/(auth)/login/page.tsx)
  -> renders <AuthGateway mode="login" action={loginAction} .../>
  -> Server Action: loginAction (apps/web/app/lib/actions.ts:56-90+)
       -> loginWithEmail(email, password)            [apps/web/app/lib/supabase.ts]
            -> raw fetch() POST {SUPABASE_URL}/auth/v1/token?grant_type=password
       -> setSession(session)                          [apps/web/app/lib/auth.ts] — sets zig_session cookie
       -> safeCreateAuthProfile(...)                    — try/catch wrapped, log-and-continue
       -> safeRecordAuthEvent(...)                       — try/catch wrapped, log-and-continue
       -> bootstrapAuthenticatedUser(session)           [apps/web/src/lib/auth/bootstrap.ts] — UNGUARDED
            -> ensureUserProfile -> ensureOrganization -> ensureDefaultRole (loop) ->
               ensureMembership -> ensureLearningProfile
               (each step = AuthRepairClient.request(), a raw fetch() with no try/catch
               around the fetch call itself)
       -> setTenantProfile(...) / redirect("/dashboard")
```

Key fact: the email/password path never calls the Supabase JS SDK's `signInWithPassword`.
It uses a hand-rolled `fetch()` to the Supabase Auth REST endpoint
(`loginWithEmail` in `apps/web/app/lib/supabase.ts`). The only places that use the real
Supabase SDK auth methods (`exchangeCodeForSession`, `verifyOtp`) are in the OAuth/email-link
callback handler, `apps/web/app/lib/oauth-callback.ts`, which is a separate code path from
`/login`'s form submission.

## Last verified-good step

- `requireString(formData, "email"/"password")` — throws only if the field is missing
  entirely; not expected to fail given the login form always submits both fields.
- `loginWithEmail(email, password)` — wrapped in try/catch in `loginAction` (lines 60-67).
  Any failure here is caught, logged, and redirects to `/login?error=invalid_credentials`
  — this does **not** produce a 500, it produces a normal redirect response. Since the
  reported symptom is a 500 (not a redirect to an error query param), this step is not the
  failure point.
- `setSession(session)` — sets a single httpOnly cookie containing the JSON-serialized
  session. No conditional logic, no environment-dependent code (`secure` flag is
  `NODE_ENV === "production"`, which is expected and correct in production, not a bug by
  itself).
- `safeCreateAuthProfile` / `safeRecordAuthEvent` — both explicitly wrapped in try/catch
  inside their own helper functions (`actions.ts`); failures are swallowed and logged, not
  rethrown.

## First failing step (hypothesis)

```
bootstrapAuthenticatedUser(session)   — apps/web/app/lib/actions.ts:72
```

This call in `loginAction` has **no surrounding try/catch**. `bootstrapAuthenticatedUser`
internally calls `AuthRepairClient.request()` (`apps/web/src/lib/auth/repair.ts`) multiple
times — one raw `fetch()` per step (profile, organization, each of 6 default roles,
membership, learning profile), executed sequentially, not in parallel. `request()` does not
wrap its own `fetch()` call in a try/catch; only some of the call sites around it
(`safeEvent`) are guarded.

If any one of those `fetch()` calls throws (network error, non-2xx unexpected shape, a
slower upstream causing the surrounding Vercel serverless function to exceed its timeout,
or a transient DNS/connect failure specific to the production network path to Supabase),
the exception propagates out of `bootstrapAuthenticatedUser`, out of `loginAction`, and
becomes an unhandled error in the Server Action — which Next.js reports to the client as a
generic `500` with a digest, exactly matching the reported symptom.

**Caveat that weakens this as a certain root cause:** `signupAction` calls
`bootstrapAuthenticatedUser` the exact same way — also unguarded
(`apps/web/app/lib/actions.ts:43`). If this were a deterministic bug, signup should 500 in
production too. No information was provided about whether production signup has been
tested. If signup works in production, the cause is more likely an intermittent one
(timeout, transient network condition, or a code path inside `bootstrapAuthenticatedUser`
that only the login session triggers — e.g. a missing field in the email/password session
object that the OAuth session always has) rather than a deterministically-broken
unconditional bug. This distinction cannot be resolved without the actual stack trace.

## Stack trace

**Not available.** No Vercel log access in this session. The Digest `913217483` could not
be looked up.

## Root cause

**Unconfirmed.** Best-evidence hypothesis, in order of likelihood given the code:

1. An unhandled exception inside `bootstrapAuthenticatedUser` (most likely inside
   `AuthRepairClient.request()`, `apps/web/src/lib/auth/repair.ts`) during the unguarded
   call at `apps/web/app/lib/actions.ts:72`, surfacing as a generic 500 in production where
   network latency/conditions to Supabase differ from localhost.
2. A Vercel serverless function timeout caused by the long sequential chain of REST round
   trips in `bootstrapAuthenticatedUser` (profile → organization → 6 sequential role
   upserts → membership → learning profile), which is fast enough to complete locally but
   not within the production function's time budget.
3. (Lower confidence, unverified) A behavior change in Next.js 16's Server Action /
   `redirect()` semantics that this codebase's training-data-era assumptions don't account
   for — flagged because `apps/web/AGENTS.md` explicitly warns this Next.js version has
   breaking changes vs. training data, but no specific evidence was found that this is
   happening here.

## Recommended fix

Wrap the `bootstrapAuthenticatedUser(session)` call in `loginAction`
(`apps/web/app/lib/actions.ts:72`) in the same kind of try/catch already used for
`loginWithEmail`, mirroring the pattern already present in `handleOAuthCallback`
(`apps/web/app/lib/oauth-callback.ts`), which wraps its entire body including its own
`bootstrapAuthenticatedUser` call and redirects to `/login?error=callback` on failure. This
converts an unhandled 500 into a recoverable redirect and surfaces the real error via
existing logging (`console.error`) so a future Vercel log lookup will show a clear
`[AUTH ERROR]` line instead of an opaque framework-level digest. Apply the same guard to
`signupAction`'s equivalent unguarded call for consistency.

This is a defensive fix, not a confirmed fix — it does not address *why* the call throws (if
hypothesis 1 or 2 above is correct), only ensures the failure degrades gracefully instead of
500ing. If the underlying cause is a Vercel timeout (hypothesis 2), the sequential
`ensureDefaultRole` loop and other steps in `bootstrap.ts` should be parallelized
(`Promise.all`) to reduce total round-trip time.

## Retest procedure

1. Apply the try/catch fix above, deploy to production.
2. Attempt `POST /login` with valid production credentials.
3. If still failing: open the Vercel function log for the request, copy the digest, and
   check the now-caught `console.error("[AUTH ERROR]", error)` output (or a newly added log
   inside the catch around `bootstrapAuthenticatedUser`) for the real exception
   type/message — this was the missing piece in this report.
4. Confirm `/dashboard` loads and `zig_session`/`zig_tenant_id` cookies are set.
5. Re-run the same test against a slow/throttled network profile locally to test hypothesis
   2 (timeout) before ruling it out.

## Failure category

**Unconfirmed — cannot select definitively from the required list without a stack trace.**
Leading candidate: **Server Action Bug** (missing error handling around an async chain),
with **Runtime Error** as the proximate trigger and **Supabase Auth / Unexpected Schema
Query** as the suspected origin inside `AuthRepairClient`. This should be revised once a real
stack trace is available.

## Production Login Status

```
PRODUCTION LOGIN STATUS = UNKNOWN
```

No live reproduction was possible from this sandbox (network egress to `*.supabase.co` and
no Vercel log access). This status must not be reported as PASS or FAIL until someone with
network/log access reproduces the request and inspects the actual error.
