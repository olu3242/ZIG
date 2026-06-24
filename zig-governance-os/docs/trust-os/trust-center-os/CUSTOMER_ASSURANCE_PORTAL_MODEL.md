# Customer Assurance Portal Model (Batch 38)

## Purpose

The Customer Assurance Portal is where a prospect, customer, or external auditor
requests access to gated (`nda_required`) content — full audit reports, detailed
procedures, or other `PublishedDocument` rows that are too sensitive to publish openly.
The audit (Batch 31) classified this as **BUILD** — nothing in the codebase models an
external party requesting access, and `RbacEngine` has no concept of a subject outside
the tenant.

## Explicit differentiation from the internal Evidence Request Workflow (PR #9)

`EVIDENCE_REQUEST_WORKFLOW.md` defines an internal lifecycle: Request → Assign →
Collect → Review → Approve → Map, using the `evidence_requests` table, where an internal
user (e.g. a Compliance Manager) requests that another internal owner collect evidence
for a control gap. Both requester and fulfiller are tenant users.

The Customer Assurance Portal's `AccessRequest` lifecycle is **structurally similar in
shape (a multi-stage approval flow) but semantically distinct**:

| | Evidence Request Workflow (PR #9, internal) | Customer Assurance Portal (Batch 38, external) |
|---|---|---|
| Requester | Internal tenant user | External `Visitor` (prospect/customer/auditor) |
| Fulfiller/approver | Internal owner assigned to collect | Internal tenant user (GRC Manager / Compliance Manager / Tenant Admin) approving disclosure |
| What's being requested | New evidence to be collected (evidence may not exist yet) | Access to evidence/documents that already exist and are already classified `nda_required` |
| Table | `evidence_requests` | `AccessRequest` (new, Batch 32) |
| Outcome | A new `evidence` row, mapped via `control_evidence` | A time-limited grant to view existing `PublishedDocument` rows |

These are two different tables and two different services
(`EvidenceRequestService`-equivalent vs. the new `AccessRequestService`) precisely
because conflating "please go collect evidence" with "please let me see evidence that
already exists" would blur an internal operational workflow with an external trust
transaction — a distinction PR #9 itself doesn't need to make, but Trust Center OS does.

## Lifecycle

```
pending → nda_required → nda_signed → approved → (active until grant_expires_at) → expired
                  │                        │
                  └────────────────────→ denied
```

| Stage | `AccessRequest.status` | Trigger |
|---|---|---|
| 1. Request created | `pending` | Visitor submits a request (directly from Documentation/Compliance Center, or escalated from an AI Security Assistant no-match) for one or more `PublishedDocument` rows with `exposure_tier = nda_required` |
| 2. NDA required | `nda_required` | System checks whether any requested document requires a signed NDA (default: yes, for all `nda_required` documents) |
| 3. NDA signed | `nda_signed` | Visitor completes NDA acceptance (e-signature integration is out of scope for this MVP design — see `TRUST_CENTER_OS_MVP.md` for what's deferred) |
| 4. Approved | `approved` | An internal user with `evidence_external_share` permission (new `RbacResource`, Batch 39) reviews and approves; `approved_by` and `grant_expires_at` are set |
| 5. Active | `approved`, within `grant_expires_at` | Visitor can view the approved documents through a scoped, time-limited link |
| 6. Expired | `expired` | `grant_expires_at` has passed; documents revert to "request access" state |
| Denied (any stage) | `denied` | Internal reviewer declines; Visitor is notified with no further access |

## Why approval is always a human action

Per CLAUDE.md's explainability principle and the general posture of this platform
(AI recommends, humans decide for anything customer-facing and irreversible), approval
of external access to sensitive documents is never automatic, regardless of how strong
the AI Security Assistant's confidence score was on a related question. This mirrors the
internal Trust Review Workflow's human-gated stages (PR #8) — AI drafts/suggests,
humans approve external-facing commitments.

## Time-limited grants

`grant_expires_at` is mandatory once `status = approved` — there is no permanent grant.
This bounds blast radius if a `Visitor`'s email is later found to be compromised or the
relationship ends, and it gives the tenant a natural recurring touchpoint (re-approval)
rather than a one-time decision that's forgotten about.

## What happens to the requested documents after expiration

The `AccessRequest` row is retained (status `expired`) for audit purposes — it is never
deleted — but the Visitor's access link stops resolving. A new request must be submitted
to regain access; the system does not auto-renew.

## Integration points

- **Documentation Center (Batch 35)**: "Request access" buttons on `nda_required`
  `PublishedDocument` entries create an `AccessRequest`.
- **Compliance Center (Batch 34)**: "Request full report" on a `PublishedCertification`
  badge creates an `AccessRequest` scoped to `report_published_document_id`.
- **AI Security Assistant (Batch 37)**: a no-match-on-gated-content answer offers to
  create an `AccessRequest` scoped to whatever `PublishedDocument` rows the Assistant
  identified as relevant but inaccessible.
- **Access control (Batch 39)**: the actual enforcement of "can this Visitor view this
  document right now" is delegated entirely to the access control model — this document
  defines the lifecycle, not the enforcement mechanism.
