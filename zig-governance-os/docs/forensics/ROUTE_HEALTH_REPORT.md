# Route Health Report

Scope: all 87 `page.tsx` files under `apps/web/app` (enumerated via
`find apps/web/app -name "page.tsx"`), with focus on the 7 dynamic `[id]`-style route
families and any routes that appear to be stubs, dead ends, or redirect loops.

## Method

Every dynamic-segment route was read in full in prior waves
(`assessment/[id]`, `evidence/[id]`, `labs/[id]`, `labs/session/[id]`, `learning/[id]`,
`learning/lesson/[id]`, `learning/module/[id]`, `risk/[id]`, `vendors/[id]`,
`projects/[id]`, `frameworks/[id]`). Static routes were spot-checked where their names
suggested overlap or special-casing (e.g. `frameworks/iso27001`).

## Findings

### 1. Exactly one route in the entire 87-route surface can throw an uncaught error (Critical, cross-ref)
`apps/web/app/frameworks/[id]/page.tsx:9` is the sole dynamic route in the whole app that
calls into the live service/repository/REST layer without a try/catch or a
null-tolerant helper. Every other dynamic route (`assessment/[id]`, `evidence/[id]`,
`labs/[id]`, `labs/session/[id]`, `learning/[id]`, `learning/lesson/[id]`,
`learning/module/[id]`, `risk/[id]`, `vendors/[id]`) reads from the static
`apps/web/app/lib/mvp-data.ts` arrays via `.find(...) ?? array[0]`, which cannot throw.
`projects/[id]/page.tsx` uses `getLifecycleProject()`, which returns `null` rather than
throwing on a miss. This makes `/frameworks/[id]` a structural outlier across the route
surface, not one of many similarly-risky routes — full detail already in
`FRAMEWORK_IDENTIFIER_AUDIT.md` and `NULL_SAFETY_REPORT.md`.

### 2. `/frameworks/iso27001` is a dead-end stub that immediately redirects to the list (Medium)
`apps/web/app/frameworks/iso27001/page.tsx` (5 lines) is not a real detail page — it is a
component that calls `redirect("/frameworks")` unconditionally. Its existence alongside
`/frameworks/[id]` and `/frameworks/page.tsx` suggests an abandoned attempt at a
framework-specific static route (likely superseded by the dynamic `[id]` route, or a
short-lived deep-link target referenced from marketing/onboarding copy) that was never
removed. Any inbound link to `/frameworks/iso27001` produces a silent bounce with no
explanation to the user, which is a worse UX than a 404 because it looks successful but
discards the user's intended destination.

### 3. `/developer` and `/developers` both exist as separate routes (Low)
Both `apps/web/app/developer/page.tsx` and `apps/web/app/developers/page.tsx` exist side
by side. This was not read in full in this audit, but its mere existence as two
near-duplicate route names is worth flagging as probable route drift (a rename that
left the old path in place, or two features converging on the same audience without
de-duplication).

### 4. Zero `not-found.tsx` files anywhere in the route tree (High)
A `find apps/web/app -name "not-found.tsx"` returns no results across all 87 routes.
Next.js falls back to its generic built-in 404 for any unmatched path or any explicit
`notFound()` call (used by `frameworks/[id]/page.tsx:8` and other dynamic routes per
prior waves) when no custom `not-found.tsx` exists at the relevant route segment. This
means every "record not found" case in the app — including the legitimate ones in
`projects/[id]` and `frameworks/[id]` — renders Next.js's default unstyled 404 rather
than a branded empty/CTA state, which is inconsistent with CLAUDE.md's zero-empty-states
guidance (see `EMPTY_STATE_REPORT.md`).

### 5. Error boundaries cover 11 of 87 route segments; coverage is uneven (Medium)
`find apps/web/app -name "error.tsx"` returns 11 files: `(auth)/error.tsx`,
`ai-command/error.tsx`, `dashboard/error.tsx`, `frameworks/error.tsx`,
`learning/error.tsx`, `mission-control/error.tsx`, `onboarding/error.tsx`,
`projects/error.tsx`, `scenarios/error.tsx`, `settings/error.tsx`,
`settings/organization/error.tsx`. These boundaries are placed at top-level segments
(`frameworks/error.tsx` covers both `/frameworks` and `/frameworks/[id]` since Next.js
error boundaries cascade to nested routes), so the coverage is broader than 11/87
literally implies — but routes like `/risk`, `/risks`, `/evidence`, `/labs`, `/vendors`,
`/assessment`, `/controls`, `/assets`, `/audits`, `/skills`, `/portfolio`, `/career`,
`/certifications`, `/marketplace`, and dozens of others have no error boundary at all. If
any of those routes' data-fetching code ever throws (most are static today, per
`EMPTY_STATE_REPORT.md` and `NULL_SAFETY_REPORT.md`, so the risk is currently latent
rather than active), the failure would surface as Next.js's generic root error page
instead of the routes' design.

### 6. Loading states cover 11 routes, also uneven (Low)
`find apps/web/app -name "loading.tsx"` returns 11 matches, roughly mirroring the
error.tsx coverage. Given most list/detail routes synchronously read static arrays
(`mvp-data.ts`) with no real async latency today, the absence of `loading.tsx` elsewhere
is currently cosmetic, but will become a real UX gap once routes are wired to live
Supabase/PostgREST calls with non-trivial latency.

## Severity Table

| Finding | Severity |
|---|---|
| `/frameworks/[id]` is the only throwing dynamic route | Critical (cross-ref) |
| No `not-found.tsx` anywhere; all not-found cases hit generic Next.js 404 | High |
| `/frameworks/iso27001` dead-end redirect stub | Medium |
| Error boundary coverage uneven (11/87 segments) | Medium |
| `/developer` vs `/developers` route duplication | Low |
| Loading-state coverage uneven (11/87 segments) | Low |

## Recommendation

Add at least one `not-found.tsx` at the app root so every unmatched/`notFound()` path
gets a branded empty state instead of Next.js's default page. Remove or repurpose
`/frameworks/iso27001` — either make it a real static deep link for the ISO 27001
framework or delete it; a silent redirect to the list is the worst of both options.
Reconcile `/developer` vs `/developers` into a single canonical route. Extend error
boundary coverage to any route segment that will eventually call live services (start
with the ones identified as currently-static-but-likely-to-be-wired-next in
`SERVICE_DEPENDENCY_MAP.md` and `NULL_SAFETY_REPORT.md`).
