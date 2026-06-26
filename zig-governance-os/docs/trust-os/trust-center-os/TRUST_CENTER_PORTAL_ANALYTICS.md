# Trust Center Portal Analytics (Batch 31-40 reconciliation addendum)

## Scope and explicit naming collision avoidance

This document covers **customer-facing portal usage analytics only** — how visitors use
the `/trust` surface itself. It is deliberately named `TRUST_CENTER_PORTAL_ANALYTICS.md`,
**not** `TRUST_ANALYTICS_MODEL.md`, because the parallel Batch 51-60 "Trust Intelligence
OS" work may introduce its own `TRUST_ANALYTICS_MODEL.md` scoped to **internal,
program-wide** trust analytics (governance-program-level reporting across all of Trust OS,
not portal visitor behavior). The two are different documents covering different audiences
and different data: this one is external-visitor-behavior analytics; that one (if/when it
exists) is internal program analytics. They must not be merged or confused — if a future
batch creates `TRUST_ANALYTICS_MODEL.md`, that document should cross-reference this one,
not duplicate it.

This document was added because `TRUST_CENTER_OS_MVP.md`'s original "Explicitly deferred"
list states: "Analytics/visitor-tracking dashboard for the admin... MVP logs
`AssistantInteraction` and `AccessRequest` rows for audit purposes but does not build a
reporting UI over them." That remains true for *implementation* — this document does not
contradict that deferral. It documents the **data model and metric definitions** for the
analytics the user's spec explicitly asks for, so that when a future Fable phase decides to
build the reporting UI, the metric definitions already exist and don't need re-deriving.
The reporting UI itself remains deferred, exactly as `TRUST_CENTER_OS_MVP.md` states.

## Metrics, sourced entirely from existing logged tables — no new storage required

| Metric | Source | Definition |
|---|---|---|
| Portal usage | `TrustCenterProfile` page-view events (a lightweight view-log analogous to `AssistantInteraction`'s logging pattern — see Documentation Center's download-tracking section for the same pattern applied to page views) | Count of `/trust/{slug}` page renders, by IA section, over a time window |
| Document downloads | The download-tracking log defined in `DOCUMENTATION_CENTER_MODEL.md`'s "Search, filter, version-tracking, and download-tracking" section | Count of document view/download events, by `PublishedDocument` and by `Visitor` (where identified) |
| Top questions asked | `AssistantInteraction` (existing, Batch 32) | Aggregation of `AssistantInteraction.question_text` (or a normalized/clustered form of it) ranked by frequency, over a time window |
| Evidence requests volume | `AccessRequest` (existing, Batch 32) | Count of `AccessRequest` rows created, broken down by status (`pending`/`approved`/`denied`/`expired`) and by requested `PublishedDocument`, over a time window — directly reuses the Assurance Request workflow stages defined in `CUSTOMER_ASSURANCE_PORTAL_MODEL.md` |
| ZARA Trust assistant usage | `AssistantInteraction` (existing, Batch 32) | Count of questions asked, match vs. no-match rate, average confidence score, and no-match-to-AccessRequest conversion rate (how often a no-match escalation actually results in an `AccessRequest`) — this last figure is the natural "no dead ends" loop-closure metric for ZARA Trust specifically |

## Why no new tables are required

Every metric above is a read-only aggregation over tables this batch (or PR #7/#8/#9)
already defines: `AssistantInteraction`, `AccessRequest`, and the two new lightweight
event logs introduced in `DOCUMENTATION_CENTER_MODEL.md` (page-view and download
events, which follow the exact same shape/discipline as `AssistantInteraction` logging).
No new score, no new entity beyond those two small event logs, and no contradiction with
PR #7/#8/#9's models — this document only adds metric *definitions* over data that either
already exists or is defined elsewhere in this same reconciliation pass.

## Relationship to internal Trust Score / Health Advisor reporting

This document is strictly about visitor/portal behavior, not governance posture. It does
not feed into, and is not fed by, `TRUST_SCORE_MODEL.md` (PR #7) or the Health Advisor —
those remain entirely about internal governance state. The only place portal analytics and
governance scoring intersect conceptually is that strong portal engagement (e.g. low
no-match rate, healthy document download activity) is a *signal* a tenant might care about
operationally, but it is not a TrustScore input and this document does not propose making
it one.
