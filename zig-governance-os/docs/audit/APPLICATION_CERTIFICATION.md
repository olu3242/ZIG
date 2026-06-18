# Application Certification

## Applications

| App | Status | Notes |
|---|---|---|
| `apps/web` | Pass | Next.js App Router shell exists |
| `apps/admin` | Partial | App package exists; admin implementation remains early |
| `apps/New-Item docs` | Fail | Accidental directory artifact; remove after inspection |

## Web App Readiness

The web app has the current platform shell routes and can be built as part of implementation validation. It should remain the primary vertical-slice MVP surface.

## Admin App Readiness

The admin app should remain secondary until identity, tenant provisioning, and operational admin use cases are defined.

## Recommendations

- Remove `apps/New-Item docs` in a cleanup ticket after verifying no intentional files exist.
- Keep App Router and Server Components as the default for new web routes.
- Avoid additional frontend feature work until Batch 21B and Batch 22 are complete.
