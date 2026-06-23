# Auth Architecture

Zig uses Supabase Auth for identity and a Zig session bridge for tenant-aware application state.

## Components

- `@zig/auth`: Supabase client factory, environment validation, Google OAuth, and session helpers.
- `apps/web/app/lib/actions.ts`: server actions for email auth, password reset, Google OAuth start, and logout.
- `apps/web/app/oauth/callback/route.ts`: exchanges the Google OAuth code and creates Zig cookies.
- `apps/web/proxy.ts`: protects all non-public routes through the Zig session cookie.
- `profiles`: auth-facing user profile table.
- `auth_events`: auth audit event stream.

## Session Bridge

Successful auth creates a `zig_session` HTTP-only cookie. If the user already has a tenant profile, Zig also sets tenant, user, and persona cookies and routes to `/dashboard`; otherwise, the user is sent to `/onboarding`.
