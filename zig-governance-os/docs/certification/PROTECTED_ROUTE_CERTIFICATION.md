# Protected Route Certification

Status date: 2026-06-21

## Requested checks

Authenticated user must access `/dashboard`, `/projects`, `/assets`, `/controls`,
`/mission-control`. Unauthenticated user must be redirected to `/login`.

## Code-level findings

- `apps/web/proxy.ts` is a custom Next.js middleware-equivalent file (function named
  `proxy`, exported `config.matcher`). It treats `/login`, `/signup`, `/forgot-password`,
  `/oauth/callback`, `/auth/callback`, `/auth/success`, `/`, `/demo`, `/favicon.svg`, and
  `/api/debug/*` as public; everything else requires `request.cookies.has("zig_session")` or
  it redirects to `/login?next=<path>`. This is a single global gate, not a per-page check —
  if it's correctly wired into the Next.js middleware pipeline, an unauthenticated user
  hitting any non-public route is redirected before the page even renders.
- Individually, `/dashboard`, `/projects`, `/controls`, `/mission-control` pages also call
  `requireSession()`/`requireTenantContext()` server-side, giving defense-in-depth beyond the
  `proxy.ts` gate.
- `/assets` does not exist as a route on this branch (confirmed: no `apps/web/app/assets`
  directory) — cannot be certified as protected or unprotected because it doesn't exist.
  This is a product-surface gap unrelated to the auth incident.

## Live verification

**Not performed** for actual unauthenticated-redirect behavior (no browser tool). However,
`npm run build --workspace web`'s route output for this branch includes a dedicated line:

```
ƒ Proxy (Middleware)
```

confirming Next.js 16.2.9 does recognize `proxy.ts` and compiles it into the middleware
slot — this is the modern convention on this Next.js version, not an inert misnamed file as
initially suspected. This resolves the open question raised during the earlier static
investigation.

## Result

```
Protected route gating (code-level) = PRESENT (proxy.ts global gate + per-page server checks)
proxy.ts wired into Next.js middleware = CONFIRMED (build output shows "ƒ Proxy (Middleware)")
/assets route = DOES NOT EXIST on this branch
Live redirect behavior = NOT TESTED (no browser tool)
```
