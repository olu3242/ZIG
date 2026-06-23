# Auth Production Certification

Generated: 2026-06-20

## Certification Status

Status: CONDITIONALLY IMPLEMENTED, DATABASE DEGRADED

The application auth flow now performs self-healing bootstrap when the required tables exist. The configured Supabase database still returns `404` for required auth recovery tables, so full production certification is blocked by schema deployment.

## Success Criteria

| Criterion | Status | Evidence |
| --- | --- | --- |
| Signup works | PARTIAL | Signup action creates Supabase session and invokes bootstrap; DB tables still missing |
| Login works | PASS for route/control flow | Login route and server action compile; invalid auth redirects cleanly |
| Forgot password works | PASS | `/forgot-password` route returns 200 and calls recovery endpoint |
| Session persists | PASS | `zig_session` httpOnly cookie written before bootstrap |
| Profile auto-created | IMPLEMENTED / BLOCKED BY DB | `ensureUserProfile()` upserts `profiles`; table currently 404 |
| Organization auto-created | IMPLEMENTED / BLOCKED BY DB | `ensureOrganization()` upserts tenant and organization; tables currently 404 |
| Membership auto-created | IMPLEMENTED / BLOCKED BY DB | `ensureMembership()` upserts `users` and `organization_members`; tables currently 404 |
| Default roles created | IMPLEMENTED / BLOCKED BY DB | `ensureDefaultRole()` upserts five roles; table currently 404 |
| Dashboard loads | PARTIAL | Auth bootstrap routes to dashboard only when tenant context exists; fallback pages added |
| Learning modules accessible | PARTIAL | `/learning` exists and uses tenant cookies plus local MVP data |
| Labs accessible | PARTIAL | `/labs` exists and uses tenant cookies plus local MVP data |
| Portfolio accessible | PARTIAL | `/portfolio` exists and uses tenant cookies plus local MVP data |
| Certification center accessible | PASS route exists | `/certifications` added and visible in OS shell |
| No redirect loops | PASS | Proxy and server redirects audited |
| No RLS failures | NOT CERTIFIED | SQL-level RLS inventory remains blocked |
| New user onboarding works | PARTIAL | Onboarding route exists; DB schema required for writes |

## Verification Evidence

Recent checks:

- `npm run lint --workspace web` passed before this batch.
- `npm run typecheck` passed before this batch.
- `npm run build` passed before this batch.
- `scripts/verify-auth-flow.ts` previously showed route health but Supabase table 404s.

Run after this batch:

```bash
npx tsc --noEmit --types node --target ES2022 --module NodeNext --moduleResolution NodeNext scripts/verify-auth-flow.ts scripts/verify-mvp-schema.ts
npm run lint --workspace web
npm run typecheck
npm run build
npx tsx scripts/verify-auth-flow.ts
npx tsx scripts/auth-repair.ts
```

## Go/No-Go

No-Go for full production auth until the database schema inventory and recovery migration are applied.

Go for application-level auth recovery implementation review.
