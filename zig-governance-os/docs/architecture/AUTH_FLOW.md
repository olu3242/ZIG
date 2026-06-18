# Auth Flow

## Signup

1. User submits `/signup`.
2. Server Action calls Supabase Auth `/auth/v1/signup`.
3. If Supabase returns a session, Zig stores the session cookie.
4. User is redirected to `/onboarding`.

## Login

1. User submits `/login`.
2. Server Action calls Supabase Auth password grant.
3. Zig stores the session cookie.
4. User is redirected to `/onboarding` if tenant profile cookies are missing.

## Password Reset

1. User submits `/forgot-password`.
2. Server Action calls Supabase Auth recovery endpoint.
3. User returns to `/login`.

## Protected Routes

`requireSession()` protects identity-only routes. `requireTenantContext()` protects tenant-scoped routes and redirects incomplete users to onboarding.

## Admin Access

`apps/admin` reads the persona cookie and allows `/admin/*` only for `Platform Owner`.
