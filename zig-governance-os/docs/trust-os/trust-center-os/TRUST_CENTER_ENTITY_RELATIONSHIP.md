# Trust Center Entity Relationship (Batch 32)

## Diagram (textual)

```
tenants (existing)
  └─ TrustCenterProfile (new, 1:1 per tenant)
       ├─ PublishedDocument (new, many) ──source_id──> evidence | policy_attestations (existing)
       ├─ PublishedControl (new, many) ──source_control_ids[]──> controls (existing)
       ├─ PublishedCertification (new, many) ──framework_id──> frameworks (existing)
       │        └─ report_published_document_id ──> PublishedDocument (self-reference, nullable)
       ├─ SubprocessorDisclosure (new, many) ──vendor_id──> vendors (existing)
       └─ AccessRequest (new, many)
                ├─ requester_id ──> Visitor (new)
                ├─ requested_document_ids[] ──> PublishedDocument (new)
                └─ approved_by ──> users (existing, internal)

Visitor (new)
  └─ AssistantInteraction (new, many)
           ├─ cited_evidence_ids[] ──> evidence (existing)
           └─ cited_control_ids[] ──> controls (existing, via PublishedControl)

governance_scores (existing) ──read-only, no FK──> Security Overview render (PublishedControl/Security Overview composite, no stored table)
responses (existing, PR #8) ──read-only, no FK──> AssistantInteraction (retrieval source, not a foreign key — the assistant queries existing approved responses as one evidence source among several)
```

## Relationship notes

1. **`TrustCenterProfile` is the only entity with a hard FK to `tenants`.** Every other
   new entity reaches `tenants` indirectly through `trust_center_profile_id`, keeping a
   single place to flip a tenant's entire public surface on/off (`is_published`).

2. **`PublishedDocument.source_id` is polymorphic** (`source_type` discriminates between
   `evidence` and `policy_attestations`). This mirrors the existing pattern of
   `control_evidence` mapping `evidence` rows to `controls` rows by reference rather than
   duplicating content — consistent with PR #9's principle that Evidence OS is the single
   source of truth for evidence content.

3. **`PublishedControl.source_control_ids` is an array FK ("rollup"), not 1:1.** A
   single externally-shown control family (e.g. "Access Control") typically rolls up
   several internal `controls` rows. This is a deliberate simplification boundary: the
   external view is coarser than the internal model by design (see
   `SECURITY_OVERVIEW_MODEL.md`, Batch 33, for why).

4. **No FK from any new table to `governance_scores` or `responses`.** Both are read at
   render/query time through their existing services (`GovernanceService`,
   `QuestionnaireService`'s response retrieval) rather than snapshotted into a new table.
   This avoids staleness — Security Overview always reflects the live score, and the AI
   Security Assistant always cites the latest approved response, never a frozen copy.

5. **`AccessRequest.approved_by` points at the existing `users` table**, i.e. an internal
   tenant user (GRC Manager / Compliance Manager / Tenant Admin per `RbacEngine`'s role
   list) — approval is always an internal action, never automated, never performed by a
   `Visitor`.

6. **`Visitor` has no relationship to `tenants` or `users`.** A `Visitor` is global
   (one email can interact with multiple tenants' Trust Centers); the tenant boundary is
   enforced per-`AccessRequest` and per-`AssistantInteraction` row instead. This is
   intentional — see `TRUST_CENTER_ACCESS_CONTROL_MODEL.md` for why `Visitor` sits
   outside the existing tenant-isolation model rather than inside it.

7. **`AssistantInteraction.visitor_id` is nullable.** Anonymous browsing of fully public
   sections, including asking the AI Security Assistant a question without identifying
   yourself, is allowed; identity capture is only required at the point an answer would
   require citing `nda_required` content, which triggers an `AccessRequest` instead of an
   answer (see Batch 37/38).

## Cardinalities

| Relationship | Cardinality |
|---|---|
| `tenants` → `TrustCenterProfile` | 1:1 |
| `TrustCenterProfile` → `PublishedDocument` | 1:many |
| `TrustCenterProfile` → `PublishedControl` | 1:many |
| `TrustCenterProfile` → `PublishedCertification` | 1:many |
| `TrustCenterProfile` → `SubprocessorDisclosure` | 1:many |
| `TrustCenterProfile` → `AccessRequest` | 1:many |
| `Visitor` → `AccessRequest` | 1:many |
| `Visitor` → `AssistantInteraction` | 1:many |
| `PublishedCertification` → `PublishedDocument` | 0/1:1 (optional report attachment) |
| `controls` → `PublishedControl` | many:many (via `source_control_ids[]`) |
