# Auth Security Model

## Controls

- Required environment variables fail fast when missing.
- Known placeholder values are rejected.
- Zig session cookies are HTTP-only.
- Production cookies are marked `secure`.
- Auth profiles and auth audit events are written with the service role from server-only code.
- RLS is enabled on `profiles` and `auth_events`.
- OAuth callback routes are public; workspace routes remain protected.

## Auditability

Tracked events:

- `signup`
- `login`
- `login_failed`
- `logout`
- `google_login`
- `password_reset_requested`

## Operational Notes

Apply the auth migration before enabling the new login flow in production. If `profiles` or `auth_events` are missing, auth can succeed in Supabase but fail during Zig session bridging.
