# Secret Rotation Plan

Date: 2026-06-18  
Status: ROTATION REQUIRED

## Repository Remediation Completed

- Moved local secrets from tracked `env` to ignored `.env.local`.
- Added literal `env` to root and workspace `.gitignore`.
- Added `.env.example` with variable names only.
- Removed `zig-governance-os/env` from Git tracking.

## Keys To Rotate

Rotate every credential that was previously stored in `zig-governance-os/env`:

- Supabase anon key if desired for hygiene.
- Supabase service role key.
- Google OAuth client secret.
- OpenAI API key.
- Stripe secret key.
- Stripe webhook secret.
- Resend API key.
- Cron secret.

## Rotation Order

1. Supabase service role key.
2. Stripe secret and webhook keys.
3. OpenAI API key.
4. Resend API key.
5. Google OAuth client secret.
6. Cron secret.
7. Supabase anon key if project policy requires public-key rotation.

## Validation Steps

1. Generate new provider keys in each provider dashboard.
2. Update Vercel Environment Variables for web and admin.
3. Update local `.env.local`.
4. Redeploy Vercel without build cache.
5. Run login/signup smoke tests.
6. Run billing webhook test only after Stripe routes are implemented.
7. Re-run repository secret scan with `git grep` and provider-specific token patterns.

## Risk Assessment

Exposure risk is high because the old `env` file was tracked by Git. Treat previous values as compromised. Do not rely on Git removal alone; provider-side rotation is mandatory.

## Certification Decision

Repository secret hygiene is remediated. Provider rotation is pending external action, so security certification remains PARTIAL.
