import type {
  Asset,
  Assessment,
  Audit,
  CapstoneProject,
  CertificationAward,
  CoachConversation,
  CoachMessage,
  Control,
  ControlEvidence,
  ControlMapping,
  Evidence,
  EvidenceReview,
  Framework,
  FrameworkControl,
  FrameworkCrosswalk,
  FrameworkDomain,
  FrameworkMapping,
  FrameworkRequirement,
  GovernanceScore,
  LabArtifact,
  LabTask,
  LabTaskSubmission,
  LearningAssessment,
  LearningAssessmentQuestion,
  LearningAssessmentResult,
  LearningModule,
  LearningPath,
  LearnerPortfolio,
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
  Vendor,
  VendorAssessment,
  VendorFinding,
} from "@zig/types";

export type TenantRecord = Tenant;
export type UserRecord = User;
export type RoleRecord = Role;
export type ProjectRecord = Project;
export type ProjectFrameworkRecord = ProjectFramework & { createdAt: Date; updatedAt: Date };
export type FrameworkRecord = Framework & { tenantId: string; createdAt: Date; updatedAt: Date };
export type ControlRecord = Control & { createdAt: Date; updatedAt: Date };
export type ControlMappingRecord = ControlMapping & { createdAt: Date; updatedAt: Date };
export type FrameworkDomainRecord = FrameworkDomain & { createdAt: Date; updatedAt: Date };
export type FrameworkControlRecord = FrameworkControl & { createdAt: Date; updatedAt: Date };
export type FrameworkRequirementRecord = FrameworkRequirement & { createdAt: Date; updatedAt: Date };
export type FrameworkMappingRecord = FrameworkMapping & { createdAt: Date; updatedAt: Date };
export type FrameworkCrosswalkRecord = FrameworkCrosswalk & { createdAt: Date; updatedAt: Date };
export type AssetRecord = Asset & { createdAt: Date; updatedAt: Date };
export type RiskRecord = Risk & { createdAt: Date; updatedAt: Date };
export type RiskAssessmentRecord = RiskAssessment & { createdAt: Date; updatedAt: Date };
export type EvidenceRecord = Evidence & { createdAt: Date; updatedAt: Date };
export type ControlEvidenceRecord = ControlEvidence & { createdAt: Date; updatedAt: Date };
export type EvidenceReviewRecord = EvidenceReview & { createdAt: Date; updatedAt: Date };
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
export type LabTaskRecord = LabTask & { createdAt: Date; updatedAt: Date };
export type LabTaskSubmissionRecord = LabTaskSubmission & { createdAt: Date; updatedAt: Date };
export type LabArtifactRecord = LabArtifact & { createdAt: Date; updatedAt: Date };
export type VendorRecord = Vendor & { createdAt: Date; updatedAt: Date };
export type VendorAssessmentRecord = VendorAssessment & { createdAt: Date; updatedAt: Date };
export type VendorFindingRecord = VendorFinding & { createdAt: Date; updatedAt: Date };
export type GovernanceScoreRecord = GovernanceScore & { id: string; createdAt: Date; updatedAt: Date };
export type CoachConversationRecord = CoachConversation & { createdAt: Date; updatedAt: Date };
export type CoachMessageRecord = CoachMessage & { createdAt: Date; updatedAt: Date };
export type RecommendationRecord = Recommendation & { createdAt: Date; updatedAt: Date };
export type CapstoneProjectRecord = CapstoneProject & { createdAt: Date; updatedAt: Date };
export type LearnerPortfolioRecord = LearnerPortfolio & { createdAt: Date; updatedAt: Date };
export type CertificationAwardRecord = CertificationAward & { createdAt: Date; updatedAt: Date };
