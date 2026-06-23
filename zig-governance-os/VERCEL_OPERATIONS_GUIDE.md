# Vercel Operations Guide

Deployment environments: development, QA, staging, production, and disaster recovery.

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `VERCEL_URL`
- `VERCEL_ENV`
- `CRON_SECRET`

Operations coverage: preview deployments, production deployments, branch deployments, environment management, deployment audit trail, rollback support, runtime errors, API errors, performance metrics, uptime monitoring, Sentry, OpenTelemetry, structured logging, and audit logging.

## 404 NOT_FOUND Triage for the Web App

Observed symptom: Vercel deployment is `Ready`, but every route returns Vercel platform `404: NOT_FOUND`.

The repository is a monorepo:

- Git repository root: `C:\Cdev\ZIG GRCOS`
- Workspace root: `zig-governance-os`
- Deployable web app: `zig-governance-os/apps/web`
- Deployable admin app: `zig-governance-os/apps/admin`

If the Vercel project uses the Git repository root as the Root Directory, Vercel can complete a deployment without mapping requests to the web App Router output. This produces a platform 404 even when local builds pass.

### Required Vercel Project Settings

For the public web application:

- Framework Preset: `Next.js`
- Root Directory: `zig-governance-os/apps/web`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave blank

For the admin application, use a separate Vercel project:

- Framework Preset: `Next.js`
- Root Directory: `zig-governance-os/apps/admin`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave blank

Do not deploy from the Git repository root or from `zig-governance-os` unless the Vercel project is explicitly configured for a nested Next.js workspace output.

### Build Log Checks

The web deployment build log should show a Next route table that includes:

- `○ /`
- `○ /login`
- `○ /signup`
- `ƒ /dashboard`
- `ƒ Proxy (Middleware)`

If those entries are missing, Vercel did not build `apps/web`.

Local verification commands:

```powershell
npm run build --workspace web
Get-Content apps/web/.next/app-path-routes-manifest.json
```

The manifest must include:

```json
{
  "/page": "/",
  "/(auth)/login/page": "/login",
  "/(auth)/signup/page": "/signup"
}
```

### Proxy Check

The web app uses `apps/web/proxy.ts` for route protection. This replaces the older `middleware.ts` pattern in current Next versions.

Expected behavior:

- `/`, `/login`, `/signup`, `/forgot-password`, and `/favicon.svg` are public.
- Protected routes without `zig_session` redirect to `/login`.
- A proxy problem should cause redirects or auth behavior, not a platform-wide 404 for `/`.

### If 404 Persists After Root Directory Fix

Check, in order:

1. Deployment source commit: confirm the domain points to the latest deployment.
2. Vercel Domains tab: confirm `zig-rosy.vercel.app` is assigned to the intended project.
3. Build logs: confirm the route table above appears.
4. Function logs: request `/login` and verify whether any app function executes.
5. Project settings: confirm no Output Directory override is set.
6. Redeploy without build cache.
