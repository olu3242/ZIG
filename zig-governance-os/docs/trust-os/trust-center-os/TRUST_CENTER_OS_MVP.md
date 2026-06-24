# Trust Center OS — MVP Definition (Batch 40)

## Scope

This defines the minimum end-to-end Trust Center OS that satisfies CLAUDE.md's
"no dead ends" lifecycle loop (Create → Analyze → Recommend → Act → Measure → Report)
for both the internal admin and the external visitor. This is a **design spec only** —
no application code, migrations, or routes are created by this document or any other
file in this batch.

## In scope for MVP

| Section | MVP behavior |
|---|---|
| Security Overview | Banded Trust Score label, control family checklist, certification badges. Fully automatic (no admin curation needed beyond initial `TrustCenterProfile` setup). |
| Compliance Center | Framework badges (admin-published `PublishedCertification` rows), banded readiness label, coarse audit status. |
| Documentation Center | Admin-curated `PublishedDocument` list with three-tier gating (public/nda_required/private). Manual redaction via `summary` field only. |
| Evidence Center | Admin-curated `PublishedDocument` (source_type = evidence), filtered automatically by evidence health state. Default exposure-tier suggestions per evidence type (Batch 36 table). |
| AI Security Assistant | Question/answer over the published, exposure-filtered corpus only, with mandatory citations and the "no match → offer access request" escalation. No support for follow-up conversational context in MVP (each question independent) — multi-turn memory is deferred. |
| Customer Assurance Portal | Full `AccessRequest` lifecycle (pending → nda_required → nda_signed → approved/denied → expired), manual internal approval, time-limited grant via signed token. NDA "signing" in MVP is a checkbox acceptance + visitor email capture, not a legal e-signature integration. |

## Explicitly deferred (not MVP, noted so scope doesn't silently creep)

- Real e-signature integration for NDA flow (DocuSign/equivalent) — MVP uses
  checkbox-acceptance only.
- Automated text redaction of document content — MVP relies on admin-authored summaries.
- Multi-turn conversational memory in the AI Security Assistant.
- Self-service subprocessor list import from a vendor-risk integration — MVP requires
  manual `SubprocessorDisclosure` curation per `vendors` row.
- White-labeling / custom domains for `/trust/{slug}` — MVP uses the platform's own
  domain with a tenant slug path segment only.
- Analytics/visitor-tracking dashboard for the admin (who viewed what, conversion funnel)
  — MVP logs `AssistantInteraction` and `AccessRequest` rows for audit purposes but does
  not build a reporting UI over them; that is a natural Executive Reporting extension,
  not part of this MVP.

## Definition of done for Trust Center OS MVP

Per the same Fable-phase discipline this repo follows (`zig-fable5-methodology` skill):
this MVP is **documentation only** at this stage. It is "done" as a Fable phase only
once:

1. Every doc in this batch exists with no `STATUS: STUB` marker (true as of this PR).
2. The end-to-end flows in `TRUST_CENTER_USER_JOURNEY.md` are internally consistent with
   `TRUST_CENTER_DATA_MODEL.md`, `TRUST_CENTER_ACCESS_CONTROL_MODEL.md`, and the
   six section models (Batches 33-38) — no contradicting entity names or lifecycle
   stages across documents (cross-checked below).
3. No document in this batch introduces application code, a migration, or a route —
   confirmed: this batch contains only markdown files under
   `docs/trust-os/trust-center-os/`.

## Cross-document consistency check

| Check | Result |
|---|---|
| `AccessRequest` status values consistent between `TRUST_CENTER_DATA_MODEL.md` and `CUSTOMER_ASSURANCE_PORTAL_MODEL.md` | Consistent: `pending \| nda_required \| nda_signed \| approved \| denied \| expired` in both |
| `exposure_tier` values consistent across `TRUST_CENTER_DATA_MODEL.md`, `DOCUMENTATION_CENTER_MODEL.md`, `EVIDENCE_CENTER_MODEL.md`, `TRUST_CENTER_ACCESS_CONTROL_MODEL.md` | Consistent: `public \| nda_required \| private` everywhere |
| Trust Score formula matches `TRUST_SCORE_MODEL.md` (PR #7) verbatim | Consistent — reproduced unchanged in `SECURITY_OVERVIEW_MODEL.md`, no re-derivation |
| Confidence Score formula matches `CONFIDENCE_SCORING_MODEL.md` (PR #8) | Consistent — reproduced unchanged in `AI_SECURITY_ASSISTANT_MODEL.md` |
| Evidence health states match `EVIDENCE_HEALTH_MODEL.md` (PR #9) | Consistent — both engines and their exact state names reproduced unchanged in `EVIDENCE_CENTER_MODEL.md` |
| `RbacEngine` role list matches the codebase (not CLAUDE.md's simplified list) | Consistent — `TRUST_CENTER_ACCESS_CONTROL_MODEL.md` cites the actual 13-role list found in `packages/governance-engine/src/rbac/RbacEngine.ts`, not the shorter list in CLAUDE.md, and flags Tenant Admin/GRC Manager/Compliance Manager as the relevant approvers consistently across Batches 38-39 |
| No new entity duplicates an existing PR #7/#8/#9 table | Consistent — `TRUST_CENTER_REUSE_MATRIX.md` enumerates every reuse/extend point explicitly |

## What fraction of Trust Center OS is genuinely new

Per `TRUST_CENTER_REUSE_MATRIX.md`'s tally (7 Reuse : 7 Extend : 7 Build across data,
service, and route layers): roughly **two-thirds of the underlying capability is
composition** over PR #7's Trust Score, PR #8's Questionnaire Response Engine and
Confidence Scoring, and PR #9's Evidence OS — and **roughly one-third is genuinely new**,
concentrated in three places: (1) the publishing/gating/versioning layer
(`PublishedDocument`/`PublishedControl`/`PublishedCertification`), (2) the external
access-request lifecycle and `Visitor` identity concept (`AccessRequest`,
Customer Assurance Portal), and (3) the grant-token RLS extension needed to serve an
anonymous/external reader without breaking the existing tenant-isolation model. The UI
surface itself (`/trust` route group, six section pages) is 100% new at the routing
layer, since no public-facing route exists anywhere in the codebase today — but every
page is a thin rendering layer over the reuse/extend data described above, not a
parallel feature built from scratch.
