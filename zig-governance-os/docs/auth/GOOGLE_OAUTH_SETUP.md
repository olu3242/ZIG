# Google OAuth Setup

## Supabase

1. Enable Google as an Auth provider.
2. Add the Google client ID and secret in the Supabase dashboard.
3. Add redirect URLs:
   - `http://localhost:3001/oauth/callback`
   - `https://<production-domain>/oauth/callback`
4. Confirm the production domain matches Vercel exactly.

## Zig

The app starts OAuth through `googleOAuthAction()` and exchanges the returned code in `/oauth/callback`.

The compatibility route `/auth/callback` is available for provider configurations that already use that path.
