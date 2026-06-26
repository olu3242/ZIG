# Evidence OS — Evidence Request Workflow

> Batch 28. Lifecycle Request → Assign → Collect → Review → Approve → Map, using the
> `Evidence Request` entity defined in `EVIDENCE_DATA_MODEL.md` and the existing
> `evidence_collections` table for batching.

## Flow

```
Control identified as lacking sufficient evidence
  (via EVIDENCE_INTELLIGENCE_MODEL.md's "which controls lack evidence" query, Batch 29)
   │
   ▼
EvidenceRequest created: status = 'requested', control_id set, requested_from_user_id set
   │  (optionally grouped under an existing evidence_collections row if issued as part of
   │   a batch — e.g. "Q3 Evidence Refresh")
   ▼
status = 'assigned'        (owner acknowledges / is auto-assigned)
   │
   ▼
status = 'collected'       (owner uploads → creates a new `evidence` row,
                             EvidenceRequest.resulting_evidence_id set)
   │
   ▼
status = 'reviewed'        (an `evidence_reviews` row is created against the new
                             evidence item — REUSE of the existing table)
   │
   ▼
status = 'approved'        (evidence_reviews.status = 'approved')
   │
   ▼
Mapped — a control_evidence row is created linking the new evidence to the
  originating control_id (REUSE of the existing canonical mapping table, Batch 22)
```

## Why this reuses three existing tables instead of building a parallel workflow

- **Collect** writes into the existing `evidence` table — no new evidence-storage table.
- **Review** writes into the existing `evidence_reviews` table — no new review table.
- **Map** writes into the existing `control_evidence` table — no new mapping table.

The only genuinely new table is `evidence_requests` itself (the tracking record of "someone
asked, here's the status"), plus the optional grouping into the existing
`evidence_collections` table. This mirrors the same reuse pattern found throughout this audit:
the GRC core engine migration already built the destination tables for this workflow; what
was missing was the request/tracking layer connecting them.

## Status transition rules

- `requested → assigned` requires `requested_from_user_id` to be set (cannot float
  unassigned indefinitely without violating CLAUDE.md's "ownership completeness" input to
  Governance Score, `CLAUDE.md:113`).
- `collected → reviewed` cannot be skipped — even autonomously-collected evidence (per
  `EVIDENCE_HEALTH_MODEL.md`'s engine-routing logic) still gets an `evidence_reviews` row,
  though for autonomous sources that row may be auto-approved by policy rather than
  requiring a human reviewer — an implementation decision, not resolved here.
- `reviewed → approved` requires `evidence_reviews.status = 'approved'`; a `'rejected'`
  review sends the request back to `'assigned'` (re-collection needed), not forward.
- Final mapping (the `control_evidence` insert) only happens once `status = 'approved'` —
  unapproved evidence is never wired into a control's coverage, preventing an unreviewed
  artifact from silently raising a control's effectiveness score.
