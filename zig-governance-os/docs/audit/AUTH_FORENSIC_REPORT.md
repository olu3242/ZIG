# Auth Forensic Report

## Scope

Reviewed the repository for Supabase placeholder usage, auth package boundaries, login/signup routing, OAuth callback handling, route protection, and admin runtime visibility.

## Findings

- No active Supabase URL placeholder remains in runtime configuration.
- No active Supabase anon-key placeholder remains in runtime configuration.
- Supabase auth access is centralized through `@zig/auth` and the existing app service bridge.
- Login, signup, password reset, logout, and Google OAuth now emit auth audit events.
- The `/oauth/callback` and `/auth/callback` routes are public in `apps/web/proxy.ts`.

## Remediations

- Added fail-fast environment validation.
- Added Google OAuth start and callback exchange.
- Added `profiles` and `auth_events` tables with RLS enabled.
- Added Platform Owner auth health dashboard at `/admin/platform/auth`.

## Residual Risks

- Google provider client ID and secret must be configured in Supabase outside the repository.
- Production OAuth redirects must match the deployed domain exactly.
- Database migration must be applied before auth event/profile writes can succeed.
