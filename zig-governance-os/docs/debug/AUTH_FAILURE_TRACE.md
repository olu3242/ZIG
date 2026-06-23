# Auth Failure Trace

## Current Failure

The observed runtime failure was:

```txt
Runtime TypeError: fetch failed
AuthGateway
SignupPage
LoginPage
```

The verified root cause was not a fetch in `AuthGateway` render. The running Next dev process was using a stale placeholder Supabase URL. After restart, `/api/debug/env` reported the real Supabase project host from `.env.local` and the auth pages rendered.

## Render Call Chain

`/login`:

1. `apps/web/app/(auth)/login/page.tsx`
2. `AuthGateway` client component
3. Server action references are serialized for `loginAction` and `googleOAuthAction`
4. No Supabase fetch executes during initial render

`/signup`:

1. `apps/web/app/(auth)/signup/page.tsx`
2. `AuthGateway` client component
3. Server action references are serialized for `signupAction` and `googleOAuthAction`
4. No Supabase fetch executes during initial render

## Dependency Chain

- `AuthGateway` uses `useOSInitialization`, `Logo`, `framer-motion`, and server action references.
- `loginAction`, `signupAction`, and `googleOAuthAction` live in `apps/web/app/lib/actions.ts`.
- Email auth helpers live in `apps/web/app/lib/supabase.ts`.
- Google OAuth helper lives in `packages/auth/src/google.ts`.
- Supabase client creation lives in `packages/auth/src/supabase.ts`.
- Environment validation lives in `packages/auth/src/env.ts`.

## Line Number Audit

- `apps/web/app/(auth)/AuthGateway.tsx:61` logs render.
- `apps/web/app/(auth)/AuthGateway.tsx:65` logs credential submit.
- `apps/web/app/(auth)/AuthGateway.tsx:70` logs Google OAuth submit.
- `apps/web/app/lib/actions.ts:42` begins email login.
- `apps/web/app/lib/actions.ts:45` logs email-login failures.
- `apps/web/app/lib/actions.ts:83` begins Google OAuth action.
- `apps/web/app/lib/oauth-callback.ts:19` exchanges the OAuth code.
- `apps/web/app/lib/supabase.ts:36` fetches tenant user profile.
- `apps/web/app/lib/supabase.ts:64` fetches Supabase signup.
- `apps/web/app/lib/supabase.ts:81` fetches Supabase password login.
- `apps/web/app/lib/supabase.ts:101` fetches password recovery.
- `apps/web/app/lib/supabase.ts:115` fetches profile upsert.
- `apps/web/app/lib/supabase.ts:137` fetches auth event insert.
- `packages/auth/src/session.ts:4` calls `supabase.auth.getSession()`.
- `packages/auth/src/session.ts:8` calls `supabase.auth.getUser()`.
- `packages/auth/src/supabase.ts:11` creates the Supabase client.
- `packages/auth/src/env.ts:25` requires `NEXT_PUBLIC_SUPABASE_URL`.

## Failing Operation

Before remediation, the running dev server reported:

```json
{
  "supabaseUrl": "https://your_project.supabase.co",
  "supabaseUrlPresent": true
}
```

That stale runtime environment caused downstream Supabase network calls to fail. After restarting normally with the web app loading the monorepo root `.env.local`, the debug endpoint reported:

```json
{
  "supabaseUrl": "https://lmscairdgavntgnwztfk.supabase.co",
  "supabaseUrlPresent": true,
  "supabaseUrlPlaceholder": false,
  "anonPresent": true,
  "serviceRolePresent": true,
  "missing": ["NEXT_PUBLIC_SITE_URL"]
}
```

## Server/Client Boundary Audit

- `AuthGateway` does not import Supabase clients directly.
- OAuth does not execute during render; it executes only through `googleOAuthAction`.
- Session helper calls do not execute during auth page render.
- `window` usage is confined to client components: `OSShell.tsx` and `OSInitializationProvider.tsx`.
