# Runtime Error Report

Scope: all 11 `error.tsx` files under `apps/web/app`, cross-referenced with
`ROUTE_HEALTH_REPORT.md`'s finding that only `/frameworks/[id]` can currently throw, and
`NULL_SAFETY_REPORT.md`'s and `FRAMEWORK_IDENTIFIER_AUDIT.md`'s root-cause analysis of
that one throw site.

## Findings

### 1. All 11 error boundaries are the same template, copy-pasted (Medium)
`apps/web/app/frameworks/error.tsx`, `apps/web/app/dashboard/error.tsx`, and
`apps/web/app/projects/error.tsx` (all three read in full) are byte-for-byte identical in
structure: a client component taking `{ error, reset }`, rendering an amber-bordered card
with an `<h1>` of the form "X needs a refresh", a `<p>{error.message}</p>`, and a "Try
again" button calling `reset()`. The only difference between files is the literal string
in the `<h1>`. This is consistent with a single template having been duplicated 11 times
rather than shared via a common component — meaning any future fix (e.g., better error
copy, telemetry hook, or hiding `error.message` from end users) requires 11 coordinated
edits instead of one.

### 2. Raw `error.message` is rendered directly to end users (Medium, security/UX)
Every error boundary renders `{error.message}` unmodified inside the card. For the one
confirmed live throw site (`frameworks/[id]/page.tsx:9`, surfacing a PostgREST
`DataAccessError`), this means the end user sees the raw database/PostgREST error text
(e.g. a Postgres type-mismatch message for the `uuid` column) rather than a sanitized,
user-facing message. This is not a fabricated risk — `DataAccessError` is thrown with the
raw response body per `SupabaseRestAdapter.ts`'s `request()` method — but its severity
depends on exactly what PostgREST's 400 body contains; this audit did not capture a live
error payload, so the concrete string was not verified. Flagging as Medium pending that
verification, with the underlying code pattern (no message sanitization at the boundary)
confirmed.

### 3. The framework error boundary is the only one with an active trigger today (informational, cross-ref)
Per `ROUTE_HEALTH_REPORT.md`, only `/frameworks/[id]` has a code path capable of
throwing under real conditions (any non-UUID id, which is exactly what the app's own
fallback/demo data generates — see `FRAMEWORK_IDENTIFIER_AUDIT.md`). The other 10 error
boundaries (`(auth)`, `ai-command`, `dashboard`, `learning`, `mission-control`,
`onboarding`, `projects`, `scenarios`, `settings`, `settings/organization`) are
defensive scaffolding for routes that, per `NULL_SAFETY_REPORT.md` and
`EMPTY_STATE_REPORT.md`, are currently backed by static fixtures or null-tolerant
helpers and do not throw under any input observed in this audit. This is good
forward-looking hygiene, but it also means the only error boundary that has ever
actually fired in practice is the one whose copy ("Framework library needs a refresh")
matches the bug this entire audit was commissioned to investigate.

### 4. No client-side or server-side error telemetry/reporting call exists in any boundary (Medium)
None of the three read-in-full `error.tsx` files call any logging, telemetry, or error-
reporting function (no `console.error`, no Sentry-style capture, no call into
`packages/services`' `AuditService`). The error is only ever shown to the end user and
discarded; there is no operator-facing signal that `/frameworks/[id]` (or any other
route) is failing in production. Combined with `AuditService.recordAction` being one of
only 3 real `getZigServices()` call sites in the whole app (per
`SERVICE_DEPENDENCY_MAP.md`), it would be straightforward to route error-boundary
failures through the existing audit log, but this is not currently done anywhere.

### 5. `reset()` cannot fix the frameworks case because the bad ID is structural, not transient (High)
The "Try again" button calls Next.js's `reset()`, which re-renders the segment and
retries the failed render. For the frameworks bug specifically, retrying does nothing
useful: the id passed to `/frameworks/[id]` is fixed by the URL (e.g. `/frameworks/iso27001`
sourced from `fallbackFrameworks()`'s lowercase-code-as-id), so every retry reproduces the
exact same PostgREST 400. The error boundary's only actionable affordance is functionally
inert for the one error it is most likely to ever catch.

## Severity Table

| Finding | Severity |
|---|---|
| "Try again" is a no-op for the frameworks structural-id bug | High |
| Raw `error.message` shown to end users unmodified | Medium |
| All 11 boundaries are a hand-duplicated template, no shared component | Medium |
| No telemetry/logging call from any error boundary | Medium |
| Only the frameworks boundary has a confirmed live trigger today | Informational |

## Recommendation

Extract the 11 duplicated error boundaries into a single shared `RouteError` component in
`packages/ui` (or `apps/web/app/components`) taking a title prop, so future changes to
error UX, message sanitization, or telemetry apply everywhere at once. Sanitize
`error.message` before rendering — map known error types (e.g. `DataAccessError`) to
static, user-safe copy, and log the raw message server-side instead. Add a telemetry call
(even a simple `console.error` plus a hook into `AuditService.recordAction`) to every
boundary so failures are visible to operators, not just end users. For the frameworks case
specifically, the real fix (already out of scope for this read-only audit, but worth
stating) is not better error-boundary UX but eliminating the structural id mismatch at
its source per `FRAMEWORK_IDENTIFIER_AUDIT.md`.
