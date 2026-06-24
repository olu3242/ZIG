# Evidence OS — Entity Relationship Diagram

> Batch 22. Relationship map for the entities in `EVIDENCE_DATA_MODEL.md`, anchored against
> the Universal Governance Model spine (`CLAUDE.md:95`).

```
tenants (existing)
  └─ projects (existing)
       └─ evidence (existing — Evidence Item)
            ├─ control_id (legacy direct FK, being superseded by control_evidence)
            ├─ control_evidence (existing — Evidence Mapping, many-to-many)
            │     └─ control_id ──► controls (existing)
            │                          └─ control_mappings (existing) ──► frameworks (existing)
            ├─ evidence_reviews (existing — Evidence Review)
            │     └─ reviewer_user_id ──► users (existing)
            ├─ evidence_sources (NEW)
            │     └─ source_ref_id ──► policies | assessments | audits (existing, polymorphic)
            ├─ evidence_types (existing, FK target proposed as new column)
            └─ health (NEW column, reconciled per EVIDENCE_HEALTH_MODEL.md)
                  └─ feeds evidence_alerts (NEW — Evidence Expiration)

evidence_collections (existing — Evidence Collection)
  └─ evidence_requests (NEW — Evidence Request)
       ├─ control_id ──► controls (existing)
       ├─ requested_from_user_id ──► users (existing)
       └─ resulting_evidence_id ──► evidence (existing, nullable until collected)
```

## Cardinality

| Relationship | Cardinality |
|---|---|
| Evidence Item → Evidence Mapping (`control_evidence`) | 1 → many (one evidence item can support multiple controls) |
| Control → Evidence Mapping | 1 → many (one control can be supported by multiple evidence items) |
| Evidence Item → Evidence Review | 1 → many (re-review over time produces multiple review rows) |
| Evidence Item → Evidence Source | 1 → 1 (one provenance record per evidence item) |
| Evidence Collection → Evidence Request | 1 → many |
| Evidence Request → Evidence Item | 1 → 0..1 (an open request has none yet; once collected, exactly one) |
| Evidence Item → Evidence Health | 1 → 1 (single current health value, recomputed, not historized in v1 — history is a future extension) |

## Connection to the Universal Governance Model

Evidence sits explicitly on the chain's `Evidence` node
(`Organization → Project → Asset → Risk → Control → Framework Requirement → Evidence → Task →
Report`, `CLAUDE.md:95`). Every entity here attaches either directly to `evidence` (existing)
or to `controls` (existing), so nothing introduced in this batch is an orphan:

- `Evidence Mapping` (`control_evidence`) is literally the Control→Evidence edge in the
  chain — already a real table, just unused at the service layer.
- `Evidence Source` extends the chain backward into *why* the evidence exists (which policy,
  assessment, or audit produced it), without creating a parallel chain.
- `Evidence Request` is the chain's generative direction — instead of evidence already
  existing and being mapped to a control, a control's *gap* generates a request that, once
  fulfilled, produces a new `evidence` row and an Evidence Mapping row, closing the loop back
  onto the same chain.
- `Evidence Health`/`Evidence Expiration` are temporal properties of the existing `Evidence`
  node, not new nodes on the chain.

This satisfies the "no orphaned entity outside the Universal Governance Model" invariant
restated in the methodology skill.
