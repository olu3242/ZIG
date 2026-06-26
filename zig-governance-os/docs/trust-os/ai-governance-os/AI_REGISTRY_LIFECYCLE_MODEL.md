# AI Governance OS — AI Registry Lifecycle (Batch 43)

> Batch 43. Defines the state machine an AI System (Batch 42) moves through from initial
> request to retirement. Mirrors the lifecycle pattern already used by Evidence OS
> (`EVIDENCE_DATA_MODEL.md`, Batch 22: Created→Collected→Reviewed→Approved→Mapped→Used→
> Monitored→Expired→Archived) rather than inventing an unrelated lifecycle shape.

## States

```
Request → Review → Approve → Register → Monitor → Retire
```

| State | Meaning | Who acts | Exit condition |
|---|---|---|---|
| **Request** | An employee or department requests to use a new AI System (e.g. "we want to enable Copilot for the Engineering team") | Requester (any authenticated user) | A GRC Manager or Compliance Analyst picks it up for review |
| **Review** | The AI System's intended use case, data types, and provider are assessed; the AI Risk Engine (Batch 44) runs an initial risk scoring pass | GRC Manager, Risk Analyst, Compliance Analyst | Reviewer recommends approve or reject, with documented reasoning |
| **Approve** | Org Admin or GRC Manager signs off, optionally with conditions (e.g. "approved for non-PII use only") | Organization Admin, GRC Manager | Approval recorded; if rejected, the AI System row is marked `status = 'retired'` immediately with a rejection reason rather than silently deleted (no orphaned or vanished governance history) |
| **Register** | The AI System becomes a first-class inventory row with full AI Risk, AI Control, and AI Evidence mapping eligible | System (transition is automatic on approval) | AI Controls (Batch 45) can now be attached; risk_level becomes live-scored rather than provisional |
| **Monitor** | Ongoing state — AI Risk Engine re-scores periodically, AI Evidence is collected/refreshed, AI Trust Score (Batch 46) includes this system in its computation | Risk Analyst, Compliance Analyst, automated re-scoring | Either continues indefinitely, escalates back to Review on a material change (new data type, new provider terms, an incident), or moves to Retire |
| **Retire** | The AI System is decommissioned or its use discontinued | Owner, GRC Manager | Terminal state — row is preserved (not deleted) for audit trail continuity, consistent with how Evidence OS preserves `archived` rather than deleting evidence (`EVIDENCE_DATA_MODEL.md`) |

## State transition table

| From | To | Trigger |
|---|---|---|
| Request | Review | Reviewer claims the request |
| Review | Approve | Reviewer recommends approval |
| Review | Retire | Reviewer recommends rejection (skips Approve/Register/Monitor entirely — a rejected request never becomes a registered system) |
| Approve | Register | Approval finalized by Org Admin/GRC Manager |
| Register | Monitor | Initial AI Risk + AI Control mapping completed |
| Monitor | Review | Material change detected (new data type, provider change, incident, periodic re-review cadence elapsed) |
| Monitor | Retire | Owner or GRC Manager decommissions the system |

No other transitions are valid — an AI System cannot jump from Request directly to
Register, the same way Evidence OS evidence cannot jump from Created directly to Approved
without passing through Collected and Reviewed.

## Relationship to AI System.status

This state machine is exactly the `status` enum on the AI System row defined in
`AI_INVENTORY_DATA_MODEL.md`: `requested`, `under_review`, `approved`, `registered`,
`monitored`, `retired`. No separate lifecycle table is introduced — state lives on the AI
System row itself, with a transition history captured the same way other lifecycle-bearing
entities in this codebase do (an append-only log table, e.g. `ai_system_status_history`,
deferred to the implementation phase as a standard audit-trail pattern, not specified
further here since it is a generic mechanism, not an AI-specific design decision).

## Relationship to the AI Risk Engine and AI Controls Library

Review and Monitor are the two states where the AI Risk Engine (Batch 44) actively runs.
Register is the state where AI Controls (Batch 45) become attachable. This ordering is
deliberate: an AI System cannot have controls mapped to it before its risk profile has been
assessed at least once — controls exist to mitigate identified risks, not to be applied
speculatively.
