# Vercel Deployment Configuration

Date: 2026-06-18  
Status: READY FOR DASHBOARD CONFIGURATION

## Current State

Zig is a nested monorepo.

- Git root: `C:\Cdev\ZIG GRCOS`
- Workspace root: `zig-governance-os`
- Public app: `zig-governance-os/apps/web`
- Admin app: `zig-governance-os/apps/admin`

There is no `vercel.json` in the repository. Deployment behavior is therefore controlled by Vercel project settings.

## Root Cause

A Vercel project using the Git root or `zig-governance-os` as Root Directory can build a ready deployment without serving the intended App Router output. That matches the observed platform-level `404: NOT_FOUND`.

Local evidence shows the web app routes exist:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/frameworks`
- `/agents`

## Correct Configuration

### Public Web Project

- Framework Preset: `Next.js`
- Root Directory: `zig-governance-os/apps/web`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave blank

### Admin Project

- Framework Preset: `Next.js`
- Root Directory: `zig-governance-os/apps/admin`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave blank

## Deployment Steps

1. Open Vercel project settings.
2. Set Root Directory to `zig-governance-os/apps/web`.
3. Confirm Framework Preset is `Next.js`.
4. Clear Output Directory.
5. Redeploy without build cache.
6. Repeat in a separate Vercel project for `zig-governance-os/apps/admin`.

## Verification Checklist

The Vercel build log for web must include:

- `○ /`
- `○ /login`
- `○ /signup`
- `ƒ /dashboard`
- `ƒ Proxy (Middleware)`

Post-deploy route checks:

- `/` returns the landing page.
- `/login` returns the branded login gateway.
- `/signup` returns the branded signup gateway.
- `/dashboard` redirects unauthenticated users to `/login`.

## Certification Decision

Repository configuration is documented and locally verified. Final Vercel deployment certification remains pending until dashboard settings and production route checks are completed.
