-- Evidence OS Phase 1: canonical persisted Evidence Health vocabulary.
-- Per docs/trust-os/evidence-os/EVIDENCE_HEALTH_MODEL.md (Batch 25) and
-- docs/trust-os/runtime-convergence/TRUST_OS_DATABASE_ALIGNMENT.md (Contradiction 1):
-- the canonical persisted shape is the deduplicated union of both existing engines'
-- value sets:
--   EvidenceManagementEngine (packages/evidence/src/index.ts):
--     missing | pending_review | rejected | approved | current | expired
--   AutonomousEvidenceEngine (packages/autonomous-evidence/src/index.ts):
--     missing | fresh | current | expiring | expired
--   union, deduplicated:
--     missing | pending_review | rejected | approved | current | expired | fresh | expiring
--
-- Neither engine is replaced. Both remain input-signal pure functions in their existing
-- packages. This migration only adds the persisted column + constraint that a future
-- routing/adapter layer (resolveEvidenceHealth) writes into, per the docs' resolution.

alter table evidence
  add column if not exists health text not null default 'missing';

alter table evidence
  drop constraint if exists evidence_health_check;

alter table evidence
  add constraint evidence_health_check
  check (health in ('missing', 'pending_review', 'rejected', 'approved', 'current', 'expired', 'fresh', 'expiring'));

-- health_score: the separate 0-100 weighted aggregate quality signal (Freshness 30,
-- Review Status 25, Usage 15, Coverage 15, Mapping 15 = 100), per EVIDENCE_HEALTH_MODEL.md.
-- Explicitly a softer, cached, derived value layered on top of the categorical `health`
-- gate above -- never the reverse. Computed by packages/evidence-health's
-- computeEvidenceHealthScore() and optionally persisted here by the service layer.
alter table evidence
  add column if not exists health_score integer;

alter table evidence
  drop constraint if exists evidence_health_score_check;

alter table evidence
  add constraint evidence_health_score_check
  check (health_score is null or (health_score >= 0 and health_score <= 100));

-- expires_at: proposed addition from EVIDENCE_DATA_MODEL.md ("Evidence Item" entity) --
-- required input to both engines' freshness/expiry computation and to the Freshness
-- component of the weighted health score.
alter table evidence
  add column if not exists expires_at timestamptz;

-- evidence_type_id: proposed addition from EVIDENCE_DATA_MODEL.md, FK to the existing but
-- previously-unwired evidence_types table.
alter table evidence
  add column if not exists evidence_type_id uuid references evidence_types(id) on delete set null;

create index if not exists evidence_health_idx on evidence(health);
create index if not exists evidence_type_id_idx on evidence(evidence_type_id);
