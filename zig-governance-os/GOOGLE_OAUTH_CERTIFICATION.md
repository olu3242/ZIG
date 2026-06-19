# Google OAuth Certification

Date: 2026-06-18  
Status: FAILED / NOT IMPLEMENTED

## Findings

Google OAuth is referenced as an integration capability, but the authentication flow is not implemented.

Missing:

- Google sign-in button.
- Supabase OAuth provider action.
- `/auth/callback` route.
- Callback session exchange.
- Google signup provisioning path.
- Vercel and Supabase redirect URL validation.

## Exact Files Reviewed

- `apps/web/app/(auth)/AuthGateway.tsx`
- `apps/web/app/lib/supabase.ts`
- `apps/web/app/lib/actions.ts`

## Required Fix

Implement a Google OAuth flow using Supabase Auth:

1. Add Google provider configuration in Supabase.
2. Add web route `/auth/callback`.
3. Add OAuth start action.
4. Provision tenant profile after callback.
5. Configure production redirect URLs in Supabase and Vercel.

## Certification Decision

FAILED. Google OAuth is not MVP-certified.
