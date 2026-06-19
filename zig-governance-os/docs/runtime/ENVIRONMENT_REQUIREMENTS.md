# Environment Requirements

Zig authentication fails fast when required Supabase configuration is missing or still contains placeholder values.

## Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## OAuth Redirects

Configure Google OAuth in Supabase with these redirect URLs:

- Local: `http://localhost:3001/oauth/callback`
- Production: `https://<production-domain>/oauth/callback`

The compatibility route `/auth/callback` is also implemented, but `/oauth/callback` is the canonical Zig callback.

## Placeholder Guard

Runtime validation rejects known Supabase URL and anon-key placeholder patterns.

Secrets must be configured in Vercel project environment variables for Production, Preview, and Development.
