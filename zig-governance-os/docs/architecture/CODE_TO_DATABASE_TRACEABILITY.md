# Code To Database Traceability

Generated: 2026-06-20

## Scan Summary

Repository search for direct Supabase client calls found no runtime `.from(`, `.rpc(`, `.storage.`, or `.channel(` calls in the app. The application uses:

- Supabase Auth endpoints directly in `apps/web/app/lib/supabase.ts`.
- Supabase REST through `packages/data-access/src/SupabaseRestAdapter.ts`.
- Service orchestration through `packages/services`.

## Traceability Matrix

| Code Location | Object Type | Object Name | Exists in DB | Action |
| --- | --- | --- | --- | --- |
| `apps/web/app/lib/supabase.ts` | table | profiles | No | Create in recovery migration |
| `apps/web/app/lib/supabase.ts` | table | auth_events | No | Create in recovery migration |
| `apps/web/app/lib/supabase.ts` | table | users | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | tenants | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | users | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | roles | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | projects | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | project_frameworks | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | frameworks | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | controls | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | control_mappings | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | assets | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | risks | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | risk_assessments | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | evidence | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | tasks | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | audits | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | assessments | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | learning_paths | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | learning_modules | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | scenarios | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | scenario_runs | No | Create in recovery migration |
| `packages/data-access/src/repositories.ts` | table | governance_scores | No | Existing local migration defines it; not required for access recovery |
| `packages/data-access/src/repositories.ts` | table | recommendations | No | Existing local migration defines it; not required for access recovery |
| `packages/data-access/src/SupabaseRestAdapter.ts` | table | audit_events | No | Create in recovery migration |
| `apps/web/app/lib/actions.ts` | table | tenants | No | Required for onboarding |
| `apps/web/app/lib/actions.ts` | table | users | No | Required for tenant persona cookie |
| `apps/web/app/lib/actions.ts` | table | frameworks | No | Required for framework seed on onboarding |
| `apps/web/app/lib/actions.ts` | table | projects | No | Required for project creation |
| `apps/web/app/lib/actions.ts` | table | project_frameworks | No | Required for framework assignment audit |
| `supabase/seed/mvp_seed.sql` | table | organizations | No | Create in recovery migration |
| `supabase/seed/mvp_seed.sql` | table | lessons | No | Create in recovery migration |
| `supabase/seed/mvp_seed.sql` | table | labs | No | Existing local migration defines it; recovery keeps MVP access focused |
| `supabase/seed/mvp_seed.sql` | table | vendors | No | Existing local migration defines it; recovery includes it for demo stability |
| `supabase/seed/mvp_seed.sql` | table | audit_logs | No | Create in recovery migration |

## Objects Requested But Not Directly Used By Current Runtime

| Object | Recovery Decision |
| --- | --- |
| modules | Compatibility view over `learning_modules` |
| simulations | Compatibility view over `scenarios` |
| simulation_runs | Compatibility view over `scenario_runs` |
| activity_log | Compatibility view over `audit_logs` |

## No Direct Usage Found

| Pattern | Result |
| --- | --- |
| `.rpc(` | None found |
| `.storage.` | None found |
| `.channel(` | None found |

## Conclusion

The MVP access path is blocked by missing runtime tables, especially `profiles`, `auth_events`, `users`, `tenants`, `frameworks`, `projects`, and `audit_events`. The recovery migration maps to the running repository layer rather than creating unrelated future-domain tables.
