# Dependency Tracker

## Purpose

This tracker names current delivery dependencies and blockers.

## Active Dependencies

| Item | Depends On | Status | Notes |
|---|---|---|---|
| Batch 21A | Execution Governance | Ready | Reconcile and harden existing Batch 21 schema |
| Batch 21B | Batch 21A | Partially Ready | Repository/services exist but need reconciliation to 21B standard |
| Batch 22 | Batch 21A/21B | Blocked | Needs database and service layer finalized |
| Batch 22A | Batch 22 | Blocked | Persona engine depends on identity and roles |
| Batch 22B | Batch 22A | Blocked | Platform Owner OS depends on persona and internal identity |
| Batch 22C | Batch 22A | Blocked | Experience orchestration depends on persona engine |
| Batch 23 | Batch 22 | Blocked | Governance Graph needs tenant/session context |
| Batch 23A | Batch 23 | Blocked | Knowledge Graph needs operational graph |
| Batch 23B | Batch 23A | Blocked | Data Fabric needs graph and data contracts |
| Batch 24A | Batch 23 | Blocked | Workflow OS needs graph and identity |
| Batch 24K | Batch 24A | Blocked | Runtime OS needs workflow definitions |
| Batch 24L | Batch 24K | Blocked | Automation Platform needs runtime |

## Cross-Cutting Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| Runtime test runner not standardized | package behavior has compile-time tests only | Select test runner in Quality OS or earlier if needed |
| Supabase adapter not implemented | repository layer has in-memory adapter only | Implement during 21B/22 reconciliation |
| Stub docs remain | implementation should not outrun docs | Fill relevant docs before dependent batch |
| Tracked node_modules workspace mirror | noisy status and duplicated staged paths | Resolve in repo hygiene task |

## Review Cadence

Update this tracker before each batch begins and after each batch closes.
