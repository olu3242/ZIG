# Bootstrap Trace Report

Status date: 2026-06-21

## Naming note

This report is named "Bootstrap Trace" to match the requested task list, but on
`claude/hopeful-bardeen-93edl1` there is **no bootstrap function** distinct from
`loginAction` itself — no `bootstrapAuthenticatedUser`, no multi-step
profile/organization/role/membership/learning-profile provisioning chain. That pattern
exists only on `release/mvp-convergence` (see the correction notes added to
`AUTH_ROOT_CAUSE_REPORT.md`). This report instead traces the closest equivalent on this
branch: the post-authentication steps inside `loginAction` that establish tenant context,
which is what `AUTH_EXECUTION_TRACE.md` already covers in full.

## Stage-by-stage mapping (requested stages → actual code on this branch)

| Requested stage | Actual equivalent on this branch | Exists? |
| --- | --- | --- |
| Profile | `findTenantProfileByAuthUserId(session.userId)` — looks up an existing `users` row by `auth_user_id`. Now logged as `PROFILE_LOOKUP_START` / `PROFILE_LOOKUP_COMPLETE`. | Yes |
| Organization | Only happens once, in `onboardingAction` (`services.tenants.createOrganization(...)`), not on every login. Not part of the login path. | No — not a per-login step |
| Membership | No separate membership table/step on this branch; tenant linkage is the single `users.tenant_id` column read by the Profile step above. | No |
| Role Provisioning | Happens once in `onboardingAction` (`role: "Tenant Admin"` set on user creation), not on every login. | No — not a per-login step |
| Framework Assignment | Happens once in `onboardingAction` (loops `FrameworkRegistry.list()` and calls `services.frameworks.create(...)` per framework), not on every login. | No — not a per-login step |
| Finalization | `setTenantProfile(...)` (cookie writes) + `audit.recordAction(...)` (audit log write). Now logged as `AUDIT_RECORDED` on success, `[AUTH AUDIT ERROR]` on failure. | Yes |

## Why this matters for the incident

The requested stage list (Profile → Organization → Membership → Role Provisioning →
Framework Assignment → Finalization) describes a **signup-time bootstrap that runs once**,
not a per-login operation, on this branch. `loginAction` only ever runs the Profile lookup
and Finalization steps — it never re-runs organization/role/framework provisioning. This
means the production 500 is **not** caused by per-login re-provisioning overhead or a
provisioning-step failure; it can only be one of the three calls already identified in
`AUTH_EXECUTION_TRACE.md` (`loginWithEmail`, `findTenantProfileByAuthUserId`,
`audit.recordAction`), all of which are now logged and try/catch-guarded per
`AUTH_HOTFIX_REPORT.md`.

If `onboardingAction`'s one-time provisioning chain (organization/role/framework creation)
is itself unreliable in production, that would only affect *first-time* signups reaching
`/onboarding`, not the reported `POST /login` 500 on an existing account — out of scope for
this incident unless new evidence ties them together.

## Status

```
Per-login bootstrap stages confirmed: Profile, Finalization (logged + guarded)
Per-signup-only stages (Organization, Role, Framework): out of scope for this login incident
Exact failing call in production: UNCONFIRMED — no Vercel log access this session
```
