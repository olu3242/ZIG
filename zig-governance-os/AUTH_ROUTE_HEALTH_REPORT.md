# Auth Route Health Report

> Investigation only. No fixes implemented. Companion to `AUTH_LOGOUT_ROOT_CAUSE.md`.

## Middleware / route gating

This Next.js fork renames `middleware.ts` to **`proxy.ts`**
(`apps/web/proxy.ts`) — a breaking-change convention per
`apps/web/AGENTS.md`. Logic:

```ts
const publicRoutes = new Set(["/", "/demo", "/login", "/signup", "/forgot-password", "/oauth/callback", "/auth/callback", "/auth/success", "/favicon.svg"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname) || request.cookies.has("zig_session")) {
    return NextResponse.next();
  }
  // else redirect to /login
}
```

- Only checks for the **presence** of the `zig_session` cookie — does not
  validate it's well-formed JSON or that tenant/persona cookies exist. A
  request with a `zig_session` cookie but missing `zig_tenant_id` will pass
  the proxy gate and rely on `requireTenantContext()` (in `auth.ts`) to
  redirect to `/onboarding` downstream. This is consistent, not broken, but
  worth noting as the single source of route gating — there is no
  defense-in-depth at the proxy layer for partial/corrupt sessions.
- `ShellGate.tsx` duplicates the public-route list client-side (`/`, `/demo`,
  `/login`, `/signup`, `/forgot-password`) to decide whether to wrap children
  in `<OSShell>`. The two lists are *not* identical (`proxy.ts` additionally
  excludes `/oauth/callback`, `/auth/callback`, `/auth/success`,
  `/favicon.svg`, none of which need the shell anyway since they're not
  pages). Not a functional bug today, but a duplicated-source-of-truth risk if
  one list is updated without the other.

## Error boundary coverage (the actual issue behind the generic logout error)

No `apps/web/app/global-error.tsx` and no `apps/web/app/error.tsx` exist at
the root. Of 51 top-level route segments under `apps/web/app/`, only 8 define
a local `error.tsx`:

| Has `error.tsx` | Missing `error.tsx` |
|---|---|
| `ai-command`, `dashboard`, `frameworks`, `learning`, `mission-control`, `onboarding`, `projects`, `scenarios`, `settings`, `(auth)` | `academy`, `agents`, `apprenticeship`, `assessment`, `assets`, `audits`, `automation`, `board`, `career`, `certifications`, `coach`, `command-center`, `compliance-command-center`, `controls`, `corporate-academy`, `demo`, `developer`, `developers`, `digital-twin`, `employers`, `employment`, `enterprise-learning`, `evidence`, `executive-assurance`, `exports`, `framework-mapper`, `gaps`, `imports`, `integrations`, `labs`, `learning-command-center`, `marketplace`, `partners`, `policies`, `portfolio`, `reports`, `risk`, `risks`, `services`, `skills`, `university`, `vendors` |

**~84% of top-level routes have no local error boundary and no root fallback
exists.** Any uncaught exception thrown on one of these ~43 routes — not just
the logout bug — surfaces as Next's generic built-in error UI ("This page
couldn't load. A server error occurred.") instead of a branded, recoverable
message. Since the logout button (`OSShell.tsx`) is rendered on every
authenticated route via `ShellGate`, the specific error text a user sees when
the logout bug fires depends entirely on which of these ~51 routes they
happened to be on — generic text on the 43 unprotected ones, a branded
"X needs a refresh" message on the 8 protected ones.

## `not-found.tsx` coverage

No `not-found.tsx` files exist anywhere under `apps/web/app/`
(`find ... -iname not-found.tsx` returned zero results). Dynamic routes that
correctly call Next's `notFound()` (e.g. `apps/web/app/frameworks/[id]/page.tsx:11`)
fall back to Next's default 404 page rather than a branded one. Not a crash
risk, but inconsistent with the "zero empty/blank states" product rule in
`CLAUDE.md`.

## `(auth)` route group

`apps/web/app/(auth)/error.tsx` exists and covers `/login`, `/signup`,
`/forgot-password` (the route group's pages). These are pre-login routes and
do not render `OSShell`/the logout button (per `ShellGate`'s public-route
list), so they are not implicated in the logout bug, but they are themselves
well-covered.

## `onboarding` routes

`apps/web/app/onboarding/error.tsx` covers `/onboarding` and its
sub-routes (`/onboarding/profile`, `/onboarding/organization`,
`/onboarding/access`, `/onboarding/review`, `/onboarding/complete`,
`/onboarding/career-goals`, `/onboarding/frameworks`,
`/onboarding/experience`) since none of those subdirectories define their own
`error.tsx` — they inherit the parent boundary correctly. This is the right
pattern; it's just not replicated for the ~43 unprotected top-level routes
above.

## Severity & recommendation

| Finding | Severity | Recommendation (not implemented) |
|---|---|---|
| No root `global-error.tsx` | High | Add one branded fallback so any future unguarded throw anywhere degrades gracefully instead of showing the framework's generic copy |
| 43/51 routes missing local `error.tsx` | Medium | Either add `error.tsx` per route (consistent with the 8 that already have one) or rely on the root fallback above once added |
| No `not-found.tsx` anywhere | Low | Add a branded 404 to match the "zero empty states" rule |
| `proxy.ts`/`ShellGate.tsx` duplicate public-route lists | Low | Share a single constant between the two if either changes |
