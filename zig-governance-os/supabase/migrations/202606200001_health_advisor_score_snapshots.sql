-- Health Advisor / Milestone Engine: governance_scores previously stored the original
-- 4-input score shape (controls_implemented/evidence_coverage/risk_treatment/
-- assessment_completion), but GovernanceService.calculateScore has since moved to the
-- 7-input weighted model in docs/architecture/governance-scoring-engine.md. Nothing ever
-- wrote to this table under the old shape (confirmed via repo-wide search), so this is a
-- safe rename+extend rather than a backfill migration.
alter table governance_scores rename column controls_implemented to control_coverage;
alter table governance_scores rename column evidence_coverage to evidence_completeness;
alter table governance_scores rename column risk_treatment to risk_assessment_coverage;
alter table governance_scores rename column assessment_completion to framework_coverage;

alter table governance_scores add column ownership_completeness integer not null default 0;
alter table governance_scores add column review_completion integer not null default 0;
alter table governance_scores add column vendor_assessment_coverage integer not null default 0;
alter table governance_scores add column health_state text not null default 'Foundation';
