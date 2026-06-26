# Trust Center User Journey (Batch 40)

## Journey A — Internal admin configures the Trust Center

Persona: GRC Manager or Tenant Admin (existing `RbacEngine` roles), already authenticated
inside the platform.

1. **Enable Trust Center.** Admin navigates to a new internal settings screen (under the
   existing authenticated app, not the public `/trust` route group) and creates a
   `TrustCenterProfile` for their tenant: chooses a `slug`, sets `display_name`,
   `contact_email`. `is_published` defaults to `false` — nothing is publicly visible yet
   (zero-empty-states principle still respected: the configuration screen shows a live
   preview of what the eventual public page will look like with demo/placeholder content,
   not a blank form).
2. **Review automatic Security Overview.** The admin sees the banded Trust Score label
   (Batch 33) computed live from their existing `governance_scores` — no action required,
   it is automatically derived. The admin can toggle `sections_enabled.security_overview`
   off if they're not ready to show it yet.
3. **Curate Compliance Center.** Admin selects which frameworks to publish as
   `PublishedCertification` badges, entering issuer/issued-date/valid-through. Frameworks
   below the 80% readiness threshold (Batch 34) are flagged in the admin UI as "not
   eligible to publish yet" with a link to the relevant `FrameworkService` readiness
   detail — connecting Trust Center configuration back into the existing Framework
   Workspace, not a disconnected side panel.
4. **Curate Documentation Center.** Admin browses existing `policy_attestations` and
   document-shaped `evidence` rows, selects which to publish, and sets `exposure_tier`
   per document (with Batch 36's suggested defaults pre-filled, never starting from a
   blank gating decision). For `nda_required` documents, admin writes a `summary` teaser.
5. **Curate Evidence Center.** Admin reviews the auto-filtered list of
   currently-healthy evidence eligible for publication (health-gated per Batch 36),
   confirms or adjusts suggested `exposure_tier` defaults per item.
6. **Configure Customer Assurance Portal approvers.** Admin assigns
   `evidence_external_share` permission (new `RbacResource`, Batch 39) to specific
   internal roles/users who may approve `AccessRequest`s — default suggestion is Tenant
   Admin and Compliance Manager.
7. **Publish.** Admin sets `is_published = true`. `/trust/{slug}` now resolves publicly.
8. **Ongoing measurement.** Per the Create → Analyze → Recommend → Act → **Measure** →
   Report loop, the admin's existing internal dashboards (not part of this MVP's UI scope,
   per `TRUST_CENTER_OS_MVP.md`'s deferred list, but architecturally enabled by the logged
   `AssistantInteraction` and `AccessRequest` rows) provide the Measure/Report step for a
   future Executive Reporting extension.

## Journey B — External visitor (prospect) browsing the Trust Center

Persona: a prospect's security reviewer, no account, no prior relationship to the
platform.

1. **Lands on `/trust/{slug}`.** No login required. Sees Security Overview (banded trust
   label, control family checklist, certification badges) — the always-on, zero-friction
   first impression.
2. **Browses Compliance Center.** Sees framework badges and audit status. Clicks "Request
   full SOC 2 report" on a certification badge whose `report_published_document_id`
   points to an `nda_required` document.
3. **Triggers an `AccessRequest`.** Prompted to enter email (creates/matches a `Visitor`
   row) and company name. `AccessRequest.status` becomes `pending`, then immediately
   `nda_required` since the requested document requires one.
4. **Accepts NDA.** Checkbox-acceptance flow (MVP scope, per `TRUST_CENTER_OS_MVP.md`).
   `status` becomes `nda_signed`.
5. **Waits for internal approval.** An internal user with `evidence_external_share`
   permission reviews the request (sees requester email/company, requested documents) and
   approves. `status` becomes `approved`, `grant_expires_at` set (e.g. 30 days out).
6. **Receives a scoped, signed access link.** Visitor returns to `/trust/{slug}` (or
   clicks an emailed link) and can now view the previously gated document, enforced via
   the grant-token RLS policy (Batch 39) — no broader access than the specific documents
   requested.
7. **Asks the AI Security Assistant a follow-up question** — e.g. "Do you encrypt data at
   rest?" The Assistant retrieves a matching `PublishedControl`/`evidence` citation from
   the exposure-filtered corpus and answers with a citation and confidence score. If the
   best match is itself `nda_required` and the visitor already has an active grant
   covering it, the Assistant may cite it; otherwise it offers a fresh `AccessRequest`.
8. **Browses Documentation Center and Evidence Center** for any remaining `public`-tier
   documents without further friction.
9. **Grant expires** after 30 days; if the relationship continues (e.g. became a paying
   customer), the visitor or an internal account team member submits a fresh
   `AccessRequest`, repeating steps 3-6 — there is no perpetual access, by design
   (Batch 38).

## Journey C — External auditor verifying evidence

Persona: a third-party auditor (different from a sales prospect, but uses the same
`Visitor`/`AccessRequest` mechanism — there is no separate "auditor" identity type, per
the deliberate decision in `TRUST_CENTER_DATA_MODEL.md` to keep `Visitor` generic).

1. Auditor is given the `/trust/{slug}` link directly by the tenant (out of band, e.g.
   during audit kickoff).
2. Auditor requests access to a broader set of `nda_required` evidence documents than a
   typical prospect would (e.g. several `PublishedDocument` rows spanning multiple
   control families) in a single `AccessRequest`.
3. Same NDA-accept → internal-approve → time-limited-grant lifecycle as Journey B,
   though the tenant may set a longer `grant_expires_at` appropriate to the audit
   engagement window.
4. Auditor uses the AI Security Assistant to ask targeted questions during fieldwork;
   every answer's citation set doubles as a paper trail the auditor can independently
   verify against the underlying `evidence`/`controls` rows (which the auditor cannot see
   directly, but whose existence and IDs are referenced in the answer — sufficient for
   an auditor to ask the tenant to corroborate, without granting raw database access).

## Why one identity model serves all three journeys

`Visitor` deliberately does not distinguish prospect vs. customer vs. auditor as a typed
field — the difference is in *what they request and how the tenant chooses to gate it*,
not in a different access-control code path. This keeps Batch 39's access control model
to a single mechanism (grant-scoped RLS) rather than three parallel ones, consistent with
the audit's overall finding that Trust Center OS should compose existing patterns rather
than multiply new ones.
