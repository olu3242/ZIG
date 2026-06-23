# Auth Runtime Recovery Report

## Root Cause

The runtime failure was caused by the web runtime using a stale placeholder Supabase URL. The failure was environmental, not an `AuthGateway` render-time Supabase call.

Evidence:

- Before restart, `/api/debug/env` reported a placeholder Supabase host.
- After restarting the web app normally, the same endpoint reported the real Supabase project host from the monorepo root `.env.local`.
- `/login` and `/signup` returned HTTP 200 and included the expected auth UI.
- `/api/debug/supabase` returned `{"ok":true,"hasSession":false}`.

## Exact Fix

- Added root `.env.local` loading in `apps/web/next.config.ts`; existing process environment values still win.
- Added `/api/debug/env`.
- Added `/api/debug/supabase`.
- Exempted `/api/debug/*` from `apps/web/proxy.ts` route protection.
- Added auth forensic logging in `AuthGateway`, auth actions, and OAuth callback.
- Tightened login catch logging and avoided masking audit-event write errors.
- Fixed two lint blockers:
  - Derived OS shell boot state without synchronous effect state update.
  - Replaced render-time `Date.now()` in `apps/web/app/evidence/page.tsx` with a stable timestamp.

## Files Affected

- `apps/web/next.config.ts`
- `apps/web/proxy.ts`
- `apps/web/app/(auth)/AuthGateway.tsx`
- `apps/web/app/lib/actions.ts`
- `apps/web/app/lib/oauth-callback.ts`
- `apps/web/app/api/debug/env/route.ts`
- `apps/web/app/api/debug/supabase/route.ts`
- `apps/web/app/OSShell.tsx`
- `apps/web/app/evidence/page.tsx`
- `docs/debug/AUTH_FAILURE_TRACE.md`
- `docs/debug/AUTH_RUNTIME_RECOVERY_REPORT.md`

## Validation Evidence

### Runtime

- `GET http://localhost:3001/login`: HTTP 200
- Login page contained `Initialize session`: true
- Login page contained `Continue with Google`: true
- Login page contained `fetch failed`: false
- `GET http://localhost:3001/signup`: HTTP 200
- Signup page contained workspace signup copy: true
- Signup page contained `Initialize with Google`: true
- Signup page contained `fetch failed`: false
- `GET http://localhost:3001/api/debug/env`: HTTP 200 with real Supabase host and no placeholder flag
- `GET http://localhost:3001/api/debug/supabase`: HTTP 200 with `ok: true`

### Commands

- `npm run lint --workspace web`: passed
- `npm run typecheck`: passed
- `npm run build`: passed
- `npm run test`: passed

Note: root `npm run lint` is not defined in `package.json`; the web workspace lint command is the available lint target and passes.

## Remaining Risks

- `NEXT_PUBLIC_SITE_URL` is still missing locally according to `/api/debug/env`.
- Live Google OAuth still requires Supabase provider credentials and redirect allow-list configuration.
- Live email login/signup requires the auth database migration to be applied and Supabase Auth configured.

## Certification

Auth runtime recovery is certified for local render and build:

- `/login` loads.
- `/signup` loads.
- No runtime render exception was observed.
- No `fetch failed` was present in rendered auth pages.
- Supabase debug connectivity returns `ok: true`.
- Google button renders.
- Callback routes compile.
- Build and tests pass.
