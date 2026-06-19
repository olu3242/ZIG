# Zig Production Deployment Certification Report

Date: 2026-06-18  
Scope: monorepo, Vercel deployment, Next.js App Router routing, proxy, Supabase, authentication, environment variables, integrations, build certification, and Fable readiness.

## 1. Executive Summary

Zig is locally buildable and route generation is healthy, but it is not production-certified yet.

The observed Vercel `404: NOT_FOUND` is not explained by missing local App Router routes. The local web build generates `/`, `/login`, `/signup`, `/dashboard`, `/frameworks`, `/agents`, and the rest of the expected route table. The most likely deployment root cause is Vercel building or serving the wrong monorepo directory.

Production readiness is blocked by two P0 issues:

1. Vercel root directory ambiguity. The Git root is `C:\Cdev\ZIG GRCOS`, while the deployable Next.js web app is `zig-governance-os/apps/web`.
2. Tracked `zig-governance-os/env` contains live provider secrets and is not protected by the current `.gitignore` rules.

Local certification result:

- `npm run test`: PASS
- `npm run build`: PASS
- Web App Router routes: PRESENT
- Admin App Router routes: PRESENT
- Production deployment: NO-GO until P0 items are fixed

## 2. Root Cause Analysis

### P0-01: Vercel project root likely points at the wrong directory

Exact files:

- `package.json`
- `apps/web/package.json`
- `apps/admin/package.json`
- `apps/web/.next/app-path-routes-manifest.json`
- `apps/admin/.next/app-path-routes-manifest.json`

Exact problem:

The Git repository root is `C:\Cdev\ZIG GRCOS`, but the actual workspace root is `zig-governance-os`, and the deployable web application is `zig-governance-os/apps/web`. There is no `vercel.json` anywhere in the repository to pin the deployment target.

Evidence:

- Root workspace scripts exist in `zig-governance-os/package.json`.
- Workspace globs are defined at `zig-governance-os/package.json:20`.
- Web app route manifest includes `"/page": "/"`, `"/(auth)/login/page": "/login"`, and `"/(auth)/signup/page": "/signup"`.
- Local build output includes `○ /`, `○ /login`, `○ /signup`, and `ƒ Proxy (Middleware)`.

Root cause:

If the Vercel project root is default/root, Vercel may not build or serve `apps/web`. A platform-wide `404: NOT_FOUND` with a successful deployment is consistent with no mapped Next.js output for the requested domain.

Exact fix:

Set the public web Vercel project:

- Root Directory: `zig-governance-os/apps/web`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: blank

Create a separate admin Vercel project:

- Root Directory: `zig-governance-os/apps/admin`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: blank

## 3. Repository Audit

Status: PARTIAL production-ready monorepo.

Findings:

- `zig-governance-os/package.json:13` builds both `web` and `admin` from the workspace root.
- `zig-governance-os/package.json:14` runs workspace test/typecheck scripts.
- `zig-governance-os/package.json:20` correctly declares `apps/*` and `packages/*` workspaces.
- Package dependency resolution passes local build and test.
- Package manifests generally expose `main` and `types` to `./src/index.ts`, but do not define `exports`. This works locally with Next transpilation and TypeScript path aliases, but is not hardened for external package consumption.

Issue:

P2-01: Workspace packages lack explicit package `exports`.

Exact problem:

Package JSON files under `packages/*/package.json` use `main` and `types`, but no `exports` field. Local Next builds pass because the apps use `transpilePackages` and TS path aliases.

Exact fix:

Add package exports consistently:

```json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

## 4. Monorepo Audit

Status: VALID locally, ambiguous for Vercel.

Evidence:

- `apps/web/next.config.ts:5` calculates `repoRoot` as `../..`.
- `apps/web/next.config.ts:8` sets Turbopack root.
- `apps/web/next.config.ts:11` lists internal packages in `transpilePackages`.
- `apps/admin/next.config.ts:4` lists admin package transpilation dependencies.

Issue:

P1-01: No repository-level deployment contract exists.

Exact problem:

No `vercel.json` exists to document or enforce deployment intent. This leaves deployment correctness entirely dependent on Vercel dashboard settings.

Exact fix:

Either rely on Vercel Root Directory settings per project, or add deployment docs plus separate Vercel projects. Do not use one Vercel project to deploy both `apps/web` and `apps/admin`.

## 5. Routing Audit

Status: PASS locally.

Web routes verified:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/dashboard`
- `/frameworks`
- `/frameworks/[id]`
- `/projects`
- `/projects/[id]`
- `/projects/new`
- `/mission-control`
- `/risks`
- `/controls`
- `/evidence`
- `/agents`
- `/command-center`
- `/compliance-command-center`

Admin routes verified:

- `/`
- `/admin/dashboard`
- `/admin/tenants`
- `/admin/users`
- `/admin/runtime`
- `/admin/audit`
- `/admin/integrations`
- `/admin/agent-control-tower`
- `/admin/agent-soc`

Evidence:

- `apps/web/.next/app-path-routes-manifest.json`
- `apps/admin/.next/app-path-routes-manifest.json`
- Build output route table from `npm run build`

Conclusion:

The Vercel 404 is not caused by missing local App Router route files.

## 6. Vercel Audit

Status: BLOCKED until project settings are verified in Vercel.

Correct web settings:

- Root Directory: `zig-governance-os/apps/web`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: blank

Correct admin settings:

- Root Directory: `zig-governance-os/apps/admin`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: blank

Build log must show:

- `○ /`
- `○ /login`
- `○ /signup`
- `ƒ /dashboard`
- `ƒ Proxy (Middleware)`

If those entries are absent from the Vercel build log, Vercel is not building the web app.

## 7. Proxy Audit

Status: PASS for route protection, with minor hardening needed.

Exact file:

- `apps/web/proxy.ts`

Evidence:

- Public routes are defined at `apps/web/proxy.ts:3`.
- `zig_session` is checked at `apps/web/proxy.ts:8`.
- Unauthenticated protected routes redirect to `/login` at `apps/web/proxy.ts:12`.
- Matcher excludes static assets at `apps/web/proxy.ts:19`.

Could `proxy.ts` cause a platform-wide 404?

No. `/` is public, and protected routes redirect to `/login`. A proxy problem could cause auth loops, but not a Vercel platform 404 for every route.

Issue:

P2-02: Proxy trusts cookie presence, not session validity.

Exact problem:

`apps/web/proxy.ts:8` permits protected routes if `zig_session` exists. It does not validate expiry, structure, signature, or Supabase session state.

Exact fix:

Use a signed session token or Supabase SSR session validation in middleware/proxy-compatible code. At minimum, validate cookie parseability and expiration before allowing access.

## 8. Environment Audit

Status: BLOCKED.

### P0-02: Live secrets are stored in tracked `env`

Exact file:

- `env`

Exact problem:

`zig-governance-os/env` is tracked by Git and contains live provider credentials. The current ignore rules protect `.env` and `.env.*`, but not a file literally named `env`.

Evidence:

- `git ls-files` includes `zig-governance-os/env`.
- `.gitignore` does not ignore `env`.
- `git status` shows `zig-governance-os/env` modified.

Root cause:

The environment file was named `env` instead of `.env.local` or another ignored pattern.

Exact fix:

1. Rotate all exposed provider keys.
2. Move local values to `.env.local`.
3. Add `env` to both root `.gitignore` files.
4. Remove `env` from Git tracking with `git rm --cached zig-governance-os/env`.
5. Set production values only in Vercel Environment Variables.

Variable classification:

| Variable | Required | Scope | Current code usage |
|---|---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Build/runtime public | Web/admin Supabase REST |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Runtime public | Web auth calls |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Runtime server-only | Web/admin REST service role |
| `GOOGLE_CLIENT_ID` | No current code path | Future runtime | Not implemented |
| `GOOGLE_CLIENT_SECRET` | No current code path | Future server-only | Not implemented |
| `OPENAI_API_KEY` | No current code path | Future server-only | Not implemented |
| `STRIPE_SECRET_KEY` | No current code path | Future server-only | Package contract only |
| `STRIPE_WEBHOOK_SECRET` | No current code path | Future server-only | Package contract only |
| `RESEND_API_KEY` | No current code path | Future server-only | Not implemented |
| `CRON_SECRET` | No current code path | Future server-only | Not implemented |
| `VERCEL_URL` | Optional | Runtime | Not used by app code |
| `VERCEL_ENV` | Optional | Runtime | Not used by app code |

## 9. Supabase Audit

Status: PARTIAL.

Evidence:

- Core tables exist in `supabase/migrations/202606180001_batch_21_core_data_platform.sql`, including tenants, users, projects, frameworks, controls, assets, risks, evidence, tasks, and audit events.
- RLS is enabled at `supabase/migrations/202606180001_batch_21_core_data_platform.sql:374`.
- Tenant policies exist at `supabase/migrations/202606180001_batch_21_core_data_platform.sql:398` and project policy at `:406`.
- Runtime config guards exist in `apps/web/app/lib/supabase.ts:13` through `:18`.

Issue:

P1-02: Runtime uses service role REST calls, so database RLS is not the primary enforcement boundary.

Exact files:

- `packages/data-access/src/SupabaseRestAdapter.ts`
- `apps/web/app/lib/supabase.ts`
- `apps/admin/app/lib/platform-data.ts`

Exact problem:

`packages/data-access/src/SupabaseRestAdapter.ts:84` and `:85` send the service role key to Supabase REST. Service role bypasses RLS by design. Tenant isolation is implemented by app-side filters such as `tenant_id=eq.<tenant>` at `SupabaseRestAdapter.ts:110`, not by user-scoped Supabase RLS.

Root cause:

The app uses a backend-style service role integration but still claims RLS-enforced tenant isolation. Those are different control models.

Exact fix:

Choose one production model:

1. Backend service-role model: keep service role server-only, enforce tenant filters in repositories, add automated negative tests for cross-tenant reads/writes, and never expose service role to client code.
2. Supabase user-session model: use user JWTs and RLS policies based on `auth.uid()` and membership tables instead of service role.

## 10. Authentication Audit

Status: PARTIAL.

Implemented:

- Email signup through Supabase Auth REST: `apps/web/app/lib/supabase.ts:71`.
- Email login through Supabase Auth REST: `apps/web/app/lib/supabase.ts:88`.
- Password reset through Supabase recover endpoint: `apps/web/app/lib/supabase.ts:106`.
- App cookies set in `apps/web/app/lib/auth.ts:13` and `:18` through `:20`.
- Logout clears cookies in `apps/web/app/lib/auth.ts`.

Missing or weak:

### P1-03: Session cookies lack production security attributes

Exact file:

- `apps/web/app/lib/auth.ts`

Exact problem:

Cookies are `httpOnly` and `sameSite: "lax"`, but do not set `secure`, `maxAge`, `expires`, or a signed/encrypted session wrapper.

Exact fix:

Set `secure: true` in production, add explicit expiration aligned to Supabase session expiry, and store only a signed opaque session reference or encrypted payload.

### P1-04: Google OAuth is not implemented

Exact files:

- `apps/web/app/lib/supabase.ts`
- `apps/web/app/(auth)`

Exact problem:

The repository references OAuth-capable integrations, but there is no Google OAuth login action, callback route, or Supabase OAuth flow.

Exact fix:

Add `/auth/callback`, Google sign-in action, Supabase provider configuration, and Vercel/Supabase redirect URLs.

### P1-05: Admin app guard relies on a web cookie without admin login boundary

Exact file:

- `apps/admin/app/admin/guard.ts`

Exact problem:

`apps/admin/app/admin/guard.ts:5` checks only `zig_persona`. There is no independent admin authentication setup or session validation.

Exact fix:

Implement admin auth middleware/proxy, validate Supabase session server-side, and require Platform Owner from a trusted tenant profile lookup.

## 11. API Integration Audit

Status: MOSTLY CONTRACTS, NOT LIVE INTEGRATIONS.

| Integration | Status | Evidence | Finding |
|---|---|---|---|
| Supabase | Connected partial | `apps/web/app/lib/supabase.ts`, migrations | Runtime REST exists; RLS enforcement model needs hardening |
| Google OAuth | Missing | only OAuth capability labels found | No auth callback or provider flow |
| OpenAI | Missing runtime | no `OPENAI_API_KEY` code usage outside docs/env | AI packages are deterministic contracts/stubs |
| Stripe | Partial contract | `packages/billing/src/index.ts`, billing tables | No live Checkout API route or webhook handler |
| Resend | Missing runtime | provider appears in webhook/integration types only | No email send path |
| Cron Jobs | Missing runtime | `CRON_SECRET` not used | No scheduled route or Vercel cron config |
| Import/Export | Partial | `packages/imports`, `packages/exports`, tables | Pipelines exist as local logic; no upload/download runtime |
| Webhooks | Partial contract | `packages/webhooks`, webhook tables | No deployed route handlers |

## 12. Build Certification

Status: PASS locally.

Commands run:

```powershell
npm run test
npm run build
```

Results:

- `npm run test`: passed all workspace typecheck/test scripts.
- `npm run build`: passed web and admin Next.js production builds.
- Web build generated 57 static/dynamic app routes.
- Admin build generated 20 static/dynamic app routes.

Build is not the current blocker. Deployment mapping and runtime production hardening are the blockers.

## 13. Fable Compliance Audit

| Fable | Status | Evidence |
|---|---|---|
| Fable 1: Auth, organizations, projects, RBAC, tenant isolation, navigation, design system, demo data | PARTIAL | Auth and onboarding exist; projects exist; RBAC engine exists; tenant isolation is partly app-filtered; design shell exists |
| Fable 2: Mission Control, assets, risks, controls, evidence, tasks, scoring | PARTIAL | Routes/packages exist; several pages show computed/sample values; not all are live CRUD |
| Fable 3: Framework engine, coverage, readiness, crosswalks | PARTIAL | Framework routes and tables exist; framework package exists; coverage/crosswalks are not fully live workflows |
| Fable 4: AI command, health advisor, AI governance, explainable recommendations | PARTIAL/MISSING | AI command route exists; recommendation runtime is not connected to model/provider telemetry |
| Fable 5: Reporting, portfolio, security, performance, accessibility, E2E | MISSING/PARTIAL | Reporting surfaces exist; no verified E2E suite, accessibility audit, or production security certification |

Fable readiness conclusion:

Zig is approximately Fable 1.5 to Fable 2 locally, not Fable 5 production-ready.

## 14. Production Readiness Score

Production readiness: 54/100.

Reasoning:

- Local build/test: strong
- App Router route generation: strong
- Vercel deployment configuration: blocked
- Secret hygiene: blocked
- Auth/session hardening: partial
- Supabase runtime enforcement: partial
- Live integrations: mostly not connected
- E2E/runtime monitoring: missing

## 15. MVP Readiness Score

MVP readiness: 66/100.

Reasoning:

The first vertical slice can run locally if Supabase is configured, but production MVP readiness requires Vercel root correction, secret rotation, Vercel env setup, admin auth hardening, and at least one end-to-end onboarding test against a non-production Supabase project.

## 16. Critical Blockers

### P0 - Blocking Deployment

1. Vercel root directory ambiguity.
   - Exact fix: configure web project root to `zig-governance-os/apps/web`.
2. Tracked live secrets in `zig-governance-os/env`.
   - Exact fix: rotate secrets, move to `.env.local`, ignore `env`, remove from Git tracking.

### P1 - Blocking MVP

1. Service-role runtime bypasses RLS as an enforcement boundary.
2. Session cookies lack `secure`, expiry, and signed/encrypted session protections.
3. Admin guard checks only `zig_persona`.
4. Google OAuth is absent despite being in certification scope.
5. Stripe/Resend/OpenAI/Cron are not live integrations.

### P2 - Technical Debt

1. Workspace packages lack `exports`.
2. No `vercel.json` or deployment contract in repo.
3. Many module pages expose status/contract language rather than live CRUD workflows.
4. Generated docs overstate runtime readiness.

### P3 - Future Enhancements

1. Multi-project deployment automation.
2. Full observability/Sentry/OpenTelemetry.
3. Accessibility and browser E2E certification.
4. Performance budgets per route.

## 17. Recommended Fixes

Priority order:

1. Fix Vercel Root Directory for web to `zig-governance-os/apps/web`.
2. Rotate every key currently present in `env`.
3. Remove `env` from Git tracking and add `env` to `.gitignore`.
4. Set Vercel environment variables directly in the Vercel dashboard.
5. Redeploy web and confirm build log contains `○ /`, `○ /login`, `○ /signup`, and `ƒ Proxy (Middleware)`.
6. Implement signed/secure session cookies.
7. Harden admin auth with server-side session validation.
8. Decide and document Supabase enforcement model: service-role backend isolation or user-JWT RLS.
9. Add Playwright E2E test for signup -> onboarding -> project -> framework -> dashboard.
10. Add integration routes only for providers that are truly live.

## 18. Prioritized Remediation Plan

### Sprint 0: Deployment Recovery

- Configure Vercel root.
- Redeploy without build cache.
- Verify route table in Vercel logs.
- Confirm `/`, `/login`, `/signup`, and `/dashboard` behavior.

### Sprint 1: Secret and Auth Hardening

- Rotate all exposed keys.
- Remove tracked `env`.
- Add secure session cookie attributes.
- Add admin session validation.

### Sprint 2: Supabase Runtime Certification

- Add tenant isolation tests against Supabase REST.
- Verify cross-tenant denial.
- Document whether service role or user JWT is authoritative.

### Sprint 3: MVP E2E Certification

- Add browser E2E for the first vertical slice.
- Add deployment smoke tests.
- Add basic runtime monitoring.

## Final Certification Decision

Deployment: NO-GO until P0 issues are fixed.  
MVP: CONDITIONAL after P0 and P1 auth/security fixes.  
Fable readiness: Fable 1.5 to Fable 2, not Fable 5.
