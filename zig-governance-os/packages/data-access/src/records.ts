import type {
  Asset,
  Assessment,
  Audit,
  Control,
  ControlMapping,
  Evidence,
  Framework,
  GovernanceScore,
  LearningAssessment,
  LearningAssessmentQuestion,
  LearningAssessmentResult,
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
  StudentTwin,
  Task,
  Tenant,
  User,
  UserProgress,
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
export type LearningAssessmentRecord = LearningAssessment & { createdAt: Date; updatedAt: Date };
export type LearningAssessmentQuestionRecord = LearningAssessmentQuestion & { createdAt: Date; updatedAt: Date };
export type LearningAssessmentResultRecord = LearningAssessmentResult & { createdAt: Date; updatedAt: Date };
export type UserProgressRecord = UserProgress & { createdAt: Date; updatedAt: Date };
export type StudentTwinRecord = StudentTwin & { createdAt: Date; updatedAt: Date };
export type ScenarioRecord = Scenario & { createdAt: Date; updatedAt: Date };
export type ScenarioRunRecord = ScenarioRun & { createdAt: Date; updatedAt: Date };
export type GovernanceScoreRecord = GovernanceScore & { id: string; createdAt: Date; updatedAt: Date };
export type RecommendationRecord = Recommendation & { createdAt: Date; updatedAt: Date };
