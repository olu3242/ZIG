# Auth Execution Trace — `claude/hopeful-bardeen-93edl1`

Status date: 2026-06-21

Scope: `apps/web/app/lib/actions.ts` — the real `loginAction` on this branch. (There is no
`bootstrapAuthenticatedUser` on this branch; see the correction notes added to
`AUTH_ROOT_CAUSE_REPORT.md` and `FRAMEWORK_QUERY_AUDIT.md`.)

## Actual code (pre-patch)

```ts
export async function loginAction(formData: FormData): Promise<void> {
  const session = await loginWithEmail(requireString(formData, "email"), requireString(formData, "password"));
  await setSession(session);
  const profile = await findTenantProfileByAuthUserId(session.userId);

  if (!profile) {
    redirect("/onboarding");
  }

  await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
  await getZigServices().audit.recordAction(
    { tenantId: profile.tenantId, actorUserId: profile.userId },
    "login",
    "users",
    profile.userId,
    "User logged in",
  );
  await bridgeBootSequence();
  redirect("/dashboard");
}
```

## Trace

```
loginAction(formData)
  -> requireString(formData, "email" / "password")    [actions.ts:463] — throws only if field missing from form
  -> loginWithEmail(email, password)                   [supabase.ts]    — *** UNGUARDED ***
       -> getSupabaseConfig()                            — throws if NEXT_PUBLIC_SUPABASE_URL /
                                                             NEXT_PUBLIC_SUPABASE_ANON_KEY /
                                                             SUPABASE_SERVICE_ROLE_KEY missing
       -> fetch(`${url}/auth/v1/token?grant_type=password`)
       -> throws Error(responseText) if !response.ok
       -> throws Error("Login did not return a Supabase session.") if payload malformed
  -> setSession(session)                                [auth.ts]        — cookies().set(...), low risk
  -> findTenantProfileByAuthUserId(session.userId)      [supabase.ts]    — *** UNGUARDED ***
       -> getSupabaseConfig() (again)                     — same throw risk as above
       -> fetch(`${url}/rest/v1/users?...`) with service-role key
       -> throws Error(responseText) if !response.ok
  -> setTenantProfile(...)                              [auth.ts]        — cookies().set(...), low risk
  -> getZigServices().audit.recordAction(...)           [supabase.ts -> @zig/services]  — *** UNGUARDED ***
       -> getSupabaseConfig() (again)
       -> createSupabaseRepositories(...) -> SupabaseRestAdapter.insert() on "audit_events"
       -> raw fetch(), throws DataAccessError if !response.ok
  -> bridgeBootSequence()                                — setTimeout(800ms), cannot throw
  -> redirect("/dashboard")
```

## Last successful step

`requireString` field extraction and `setSession(session)` — these are the only steps with
no outbound network call and no environment-variable dependency once `session` exists.

## First unprotected step

**The entire function body has no try/catch.** The very first unprotected step is
`loginWithEmail(...)` on line 25 — the first line of the function. Unlike the
`release/mvp-convergence` branch (where `loginWithEmail` is at least guarded, and only the
later bootstrap call is unguarded), **this branch's `loginAction` has zero exception
handling anywhere in its body.**

## First possible exception path

Three real candidates, all currently unguarded, any one of which produces an unhandled
exception inside the Server Action → Next.js reports a generic `500` to the client:

1. `getSupabaseConfig()` (called inside `loginWithEmail`, again inside
   `findTenantProfileByAuthUserId`, again inside `getZigServices()`) — throws synchronously
   if any of the three required Supabase env vars is unset/empty in the Vercel production
   environment. This is the single most likely candidate given "Supabase configuration
   verified" is asserted but not independently confirmed by this session (no Vercel
   dashboard / env var listing access).
2. `loginWithEmail`'s `fetch()` to `/auth/v1/token` — throws `Error(responseText)` on any
   non-2xx response (wrong credentials, rate limiting, network blip) or
   `Error("Login did not return a Supabase session.")` if the response shape is unexpected.
   A wrong-credentials case is expected and currently surfaces as a 500 instead of a clean
   "invalid credentials" message — this is itself a UX/correctness bug independent of the
   production-only symptom.
3. `findTenantProfileByAuthUserId` or `getZigServices().audit.recordAction` — both raw REST
   calls using the service-role key; either can throw if the production `users`/`audit_events`
   tables/policies differ from the local/dev database, or on any transient network issue
   between Vercel and Supabase that doesn't occur from localhost.

No code in this chain references `window`, `document`, or any browser-only API, so a
browser/server execution mismatch is not implicated. The leading explanation for
"localhost works, production fails" remains either (a) an env var difference between local
`.env.local` and the Vercel production environment, or (b) a transient network condition
between Vercel's edge/serverless runtime and Supabase that doesn't reproduce locally.
