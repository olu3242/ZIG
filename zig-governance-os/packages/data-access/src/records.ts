import type {
  Asset,
  Assessment,
  Audit,
  Control,
  ControlMapping,
  Evidence,
  EvidenceAlertRecordShape,
  EvidenceRequestRecordShape,
  EvidenceSourceRecordShape,
  Framework,
  GovernanceScore,
  LearningModule,
  LearningPath,
  Project,
  ProjectFramework,
  Recommendation,
  Risk,
  RiskAssessment,
  Role,
  Scenario,
  ScenarioRun,
  Task,
  Tenant,
  User,
} from "@zig/types";

export type TenantRecord = Tenant;
export type UserRecord = User;
export type RoleRecord = Role;
export type ProjectRecord = Project;
export type ProjectFrameworkRecord = ProjectFramework & { createdAt: Date; updatedAt: Date };
export type FrameworkRecord = Framework & { tenantId: string; createdAt: Date; updatedAt: Date };
export type ControlRecord = Control & { createdAt: Date; updatedAt: Date };
export type ControlMappingRecord = ControlMapping & { createdAt: Date; updatedAt: Date };
export type AssetRecord = Asset & { createdAt: Date; updatedAt: Date };
export type RiskRecord = Risk & { createdAt: Date; updatedAt: Date };
export type RiskAssessmentRecord = RiskAssessment & { createdAt: Date; updatedAt: Date };
export type EvidenceRecord = Evidence & { createdAt: Date; updatedAt: Date };
export type TaskRecord = Task & { createdAt: Date; updatedAt: Date };
export type AuditRecord = Audit & { createdAt: Date; updatedAt: Date };
export type AssessmentRecord = Assessment & { tenantId: string; projectId: string; frameworkId?: string; status: string; score?: number; createdAt: Date; updatedAt: Date };
export type LearningPathRecord = LearningPath & { createdAt: Date; updatedAt: Date };
export type LearningModuleRecord = LearningModule & { tenantId: string; createdAt: Date; updatedAt: Date };
export type ScenarioRecord = Scenario & { createdAt: Date; updatedAt: Date };
export type ScenarioRunRecord = ScenarioRun & { createdAt: Date; updatedAt: Date };
export type GovernanceScoreRecord = GovernanceScore & { id: string; createdAt: Date; updatedAt: Date };
export type RecommendationRecord = Recommendation & { createdAt: Date; updatedAt: Date };

// Evidence OS Phase 1 -- reuse of existing-but-previously-unwired tables
// (control_evidence, evidence_reviews, evidence_collections), per
// docs/trust-os/evidence-os/EVIDENCE_DATA_MODEL.md. These tables already exist in
// supabase/migrations/202606180005_grc_core_engine.sql; this is the first service-layer
// wiring for them.
export interface ControlEvidenceRecord {
  id: string;
  tenantId: string;
  controlId: string;
  evidenceId: string;
  coverage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceReviewRecord {
  id: string;
  tenantId: string;
  evidenceId: string;
  reviewerUserId?: string;
  status: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvidenceCollectionRecord {
  id: string;
  tenantId: string;
  name: string;
  purpose: string;
  status: string;
  dueAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Evidence OS Phase 1 -- genuinely new entities per EVIDENCE_DATA_MODEL.md /
// EVIDENCE_REQUEST_WORKFLOW.md (Batches 22, 28), backed by the new tables added in
// supabase/migrations/202606210002_evidence_os_phase1_entities.sql.
export type EvidenceSourceRecord = EvidenceSourceRecordShape & { createdAt: Date; updatedAt: Date };
export type EvidenceRequestRecord = EvidenceRequestRecordShape & { createdAt: Date; updatedAt: Date };
export type EvidenceAlertRecord = EvidenceAlertRecordShape & { createdAt: Date; updatedAt: Date };
