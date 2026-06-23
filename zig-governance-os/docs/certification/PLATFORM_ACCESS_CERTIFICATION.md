# Platform Access Certification

Generated: 2026-06-20

## Certification Summary

Status: CONDITIONAL PASS AFTER MIGRATION

The application has routes and service code for auth, onboarding, dashboard, learning, framework, assessment, simulation, and portfolio flows. The configured Supabase database currently lacks the MVP schema, so runtime platform access is blocked until the recovery migration is applied.

## Success Criteria

| Criterion | Status | Evidence |
| --- | --- | --- |
| Google login succeeds | PARTIAL | OAuth route exists; DB dependencies missing before migration |
| User profile auto-created | FIXED BY MIGRATION | `bootstrap_new_user()` creates `profiles` |
| User reaches dashboard | FIXED BY MIGRATION | Trigger creates `users` row needed by tenant resolution |
| No missing-table runtime errors | FIXED BY MIGRATION | Recovery creates MVP runtime tables |
| Learning OS loads | PARTIAL | UI loads with local data; persistence awaits migration |
| Framework Intelligence loads | PARTIAL | UI/services exist; `frameworks` missing before migration |
| Assessments load | PARTIAL | Routes exist; persistence tables missing before migration |
| Simulations load | PARTIAL | Routes exist; compatibility views added |
| Portfolio loads | PARTIAL | Route exists; `artifacts` missing before migration |
| All dependencies mapped | PASS | See `CODE_TO_DATABASE_TRACEABILITY.md` |

## Known Risks

- Supabase CLI is not linked to the configured project ref, so migration history could not be verified through CLI.
- The service role is used by server-side repositories; RLS needs browser-bound integration tests.
- Several UI modules still use static MVP data rather than live service reads/writes.

## Go/No-Go

No-Go for persisted MVP until the recovery migration is applied and `scripts/verify-mvp-schema.ts` passes against Supabase REST.

Go for landing page and static MVP demonstration remains valid.
