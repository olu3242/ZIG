# Trust Center Access Control Model (Batch 39)

## Purpose

Define how public / gated (`nda_required`) / private content is enforced at the data
layer, tying into the existing tenant-isolation and RLS patterns rather than inventing a
parallel auth system — per the explicit instruction in CLAUDE.md that tenant isolation
"must be enforced at the data layer, not just in the UI."

## The gap this closes (from the audit, Batch 31, Finding 4)

Every existing RLS policy in `supabase/migrations` follows:

```sql
using (tenant_id = current_tenant_id())
with check (tenant_id = current_tenant_id())
```

This assumes a resolved, authenticated `current_tenant_id()` session value
(`docs/data/RLS_STRATEGY.md`). An anonymous Trust Center visitor has no tenant session
at all — they are looking at exactly one tenant's public page, but they are not "logged
in as" that tenant. The existing pattern cannot be reused unmodified for external reads;
it must be extended with a second, narrower policy shape that still respects the same
underlying principle (every row is scoped to a tenant; nothing crosses tenant
boundaries).

## Two enforcement layers, mirroring the existing two-layer pattern

The codebase already enforces tenant isolation at two layers: an application-level
guard (`requireTenantContext()`, used by `executive-assurance/page.tsx` and
`compliance-command-center/page.tsx`) plus database-level RLS. Trust Center OS keeps
this same two-layer shape, with a different application-level guard for the public path:

| Layer | Internal/admin path (existing) | External/public path (new) |
|---|---|---|
| App-level guard | `requireTenantContext()` | `resolveTrustCenterProfile(slug)` — resolves a `TrustCenterProfile` by public `slug`, fails closed (404) if `is_published = false` |
| DB-level enforcement | RLS: `tenant_id = current_tenant_id()` | RLS: a new policy shape, below |

## New RLS policy shape for externally-readable tables

For `PublishedDocument`, `PublishedControl`, `PublishedCertification`,
`SubprocessorDisclosure` — the tables an anonymous visitor needs to read — RLS adds a
second policy **in addition to** the standard tenant-admin policy, not instead of it:

```sql
-- existing-pattern policy: internal admin read/write, unchanged
create policy tenant_admin_access on published_document
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

-- new policy: anonymous public read, narrowly scoped
create policy public_read_access on published_document
  using (
    exposure_tier = 'public'
    and exists (
      select 1 from trust_center_profile p
      where p.id = published_document.trust_center_profile_id
        and p.is_published = true
    )
  );
```

This does **not** replace `current_tenant_id()`-based scoping — it adds a second,
additive policy that is only true for rows that are explicitly marked `public` and whose
parent `TrustCenterProfile` is explicitly published. An anonymous request has no
`current_tenant_id()` set, so the first policy never matches for it; only the second,
narrower policy can. A row with `exposure_tier = nda_required` or `private` is invisible
to this policy regardless of session state — the anonymous path literally cannot select
those rows, with no application-level filtering required as a safety net (though the
application layer also filters, as defense in depth).

## Enforcing `nda_required` access (signed-grant model)

`nda_required` content cannot be served by a stateless RLS predicate the way `public`
content can, because access depends on a specific `Visitor` having a specific approved,
unexpired `AccessRequest`. The enforcement path is:

1. On `AccessRequest` approval, the system issues a signed, time-limited access token
   (JWT or equivalent) scoped to `{visitor_id, requested_document_ids[], grant_expires_at}`.
2. Requests to view a gated document carry this token. The application layer validates
   the token's signature and expiry **before** querying — this is the equivalent of
   `requireTenantContext()` for the external path, call it
   `requireAccessGrant(token, documentId)`.
3. RLS adds a third, still-additive policy for the `nda_required` case, parameterized on
   a session variable set by the application layer after token validation (mirroring how
   `current_tenant_id()` is itself set per-request by the application's database
   adapter, per `RLS_STRATEGY.md`):

   ```sql
   create policy grant_scoped_access on published_document
     using (
       exposure_tier = 'nda_required'
       and id = any(string_to_array(current_setting('app.current_access_grant_ids', true), ',')::uuid[])
     );
   ```

   This follows the exact precedent `RLS_STRATEGY.md` already establishes for
   `current_tenant_id()` — a `current_setting()`-based session variable, set by the
   adapter per request — applied to a grant-scoped list instead of a tenant id. It is
   the same mechanism, not a new one.

4. No token, no `current_setting` value, no match — fails closed, consistent with
   `RLS_STRATEGY.md`'s "fail closed when tenant context is missing" rule, applied
   analogously to "fail closed when access grant context is missing."

## RBAC: extending `RbacEngine`, not duplicating it

`RbacEngine`'s `RbacResource` union (`tenant | users | settings | projects | frameworks |
assets | risks | controls | evidence | tasks | learning | reports`) gains two new values:

- `trust_center` — controls who can configure `TrustCenterProfile`, publish/unpublish
  documents and certifications (internal tenant users only: Tenant Admin, GRC Manager,
  Compliance Manager get `canEdit`/`canCreate` by default, mirroring their existing
  permissions on `evidence`/`frameworks`).
- `evidence_external_share` — controls who can approve an `AccessRequest` (a narrower
  permission than general `evidence` edit access, since approving external disclosure is
  a higher-stakes action than internal evidence management; Tenant Admin and Compliance
  Manager get `canApprove` by default, other internal roles do not).

`Visitor` is explicitly **not** added as a 14th `RbacEngine` role. `RbacEngine.can()`
requires `subject.user.tenantId === tenantId`, which assumes an internal tenant member;
extending it to model external parties would conflate two fundamentally different trust
boundaries (an internal employee with some restricted permissions vs. an external party
with no employment relationship to the tenant at all). `Visitor` access is enforced
entirely through the grant-token/RLS mechanism above, never through `RbacEngine`.

## Multi-tenant validation checklist

The user's spec requires an explicit validation checklist confirming tenant-scoping for
six entity groups. Each ties to the existing `tenant_id = current_tenant_id()` RLS pattern
established above — none of these introduce a new isolation mechanism; this checklist
exists so implementation can verify each entity group explicitly rather than assuming
tenant-scoping transitively:

| Entity group | Tenant-scoping mechanism | Validation |
|---|---|---|
| Organizations | `tenant_id` is the organization's own identity column in the existing multi-tenant model (CLAUDE.md: "every record belongs to an Organization and a Project") | An Organization row is itself the tenant boundary — `current_tenant_id()` resolves to an Organization id; no additional check needed beyond the existing foundation-layer RLS, already enforced pre-Trust-Center-OS |
| Trust Profiles | `TrustCenterProfile.tenant_id = current_tenant_id()` (internal/admin path) — the anonymous public path instead resolves via `resolveTrustCenterProfile(slug)`, which looks up by `slug` + `is_published = true` and never by `current_tenant_id()` at all (no tenant session exists for an anonymous visitor) | Confirm `TrustCenterProfile` carries `tenant_id` and that the internal admin RLS policy (`tenant_admin_access`-equivalent) is present; confirm the public resolver never bypasses the published-flag check |
| Evidence | Existing `evidence` table's pre-existing `tenant_id = current_tenant_id()` RLS (PR #9) is unchanged; Trust Center OS never grants direct table access to `evidence` itself — it only ever reads through `PublishedDocument`/`PublishedControl`, which carry their own `tenant_id` and the two-policy (`tenant_admin_access` + `public_read_access`) shape defined above | Confirm no new RLS policy on `evidence` itself was added — the exposure boundary is `PublishedDocument`, not `evidence` directly, exactly as `EVIDENCE_CENTER_MODEL.md` (Batch 36) specifies |
| Documents | `PublishedDocument.tenant_id = current_tenant_id()` for the admin path; `exposure_tier = 'public'` + published-profile check for the anonymous path (the exact `public_read_access` policy shown above) | Confirm both policies coexist additively (not as a replacement) per the "New RLS policy shape" section above |
| Trust Scores | `governance_scores.tenant_id = current_tenant_id()` (existing, PR #7, unchanged) — Trust Center OS never grants table-level access to `governance_scores`; Security Overview/Trust Scoring Dashboard reads through `TrustCenterService.deriveSecurityOverview(tenantId)`, a server-side projection, never a direct client query against `governance_scores` | Confirm the public route has no RLS policy at all on `governance_scores` — the banding/projection happens server-side before anything is sent to an anonymous client, so no anonymous-readable policy should exist on this table, ever |
| Questionnaires | Existing `responses`/questionnaire tables retain their pre-existing `tenant_id = current_tenant_id()` RLS (PR #8, unchanged); Trust Center OS (ZARA Trust / AI Security Assistant) never reads `responses` directly — its corpus is restricted to `PublishedDocument`/`PublishedControl` only, per `AI_SECURITY_ASSISTANT_MODEL.md`'s explicit exposure-boundary rule | Confirm no new RLS policy grants anonymous/visitor read access to questionnaire/response tables — ZARA Trust's citation corpus boundary must remain the published-content tables, never the internal questionnaire tables |

Every row above either reuses the existing `tenant_id = current_tenant_id()` policy
unchanged (Organizations, Evidence, Trust Scores, Questionnaires — Trust Center OS adds no
new policy to these at all) or extends it additively with the new public/grant-scoped
policies defined earlier in this document (Trust Profiles, Documents). No entity group is
tenant-scoped by a mechanism other than the two already described above.

## Summary: what's reused vs. new

| Mechanism | Reused | New |
|---|---|---|
| Tenant-admin RLS pattern (`tenant_id = current_tenant_id()`) | Yes, unchanged, for internal Trust Center admin operations | — |
| `current_setting()`-based session-variable RLS technique | Yes — same technique, new variable (`app.current_access_grant_ids`) | The specific variable and policy |
| Two-layer (app-guard + RLS) enforcement shape | Yes — same shape as `requireTenantContext()` | New guards: `resolveTrustCenterProfile`, `requireAccessGrant` |
| `RbacEngine` role/permission model | Yes — internal roles get two new resources | `trust_center`, `evidence_external_share` resources |
| External-party identity | No precedent | `Visitor`, deliberately outside `RbacEngine` |
| Fail-closed default | Yes — same principle as `RLS_STRATEGY.md` | Applied to grant-context as well as tenant-context |
