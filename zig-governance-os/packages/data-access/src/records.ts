import type {
  ArtifactTemplate,
  ArtifactVersion,
  Asset,
  Assessment,
  Audit,
  CapstoneProject,
  CertificationAward,
  CoachConversation,
  CoachMessage,
  Competency,
  CompetencyAssessment,
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
  PortfolioArtifact,
  Project,
  ProjectFramework,
  QuestionnaireAnswer,
  QuestionnaireSubmission,
  QuestionnaireTemplate,
  Recommendation,
  Risk,
  RiskAssessment,
  Role,
  Scenario,
  ScenarioAttempt,
  ScenarioDecision,
  ScenarioOutcome,
  ScenarioRun,
  StudentTwin,
  ScenarioTemplate,
  SimulatedCompanyObject,
  Task,
  Tenant,
  TrustAccessLog,
  TrustCenterProfile,
  TrustDocument,
  TrustRequest,
  User,
  UserProgress,
  Vendor,
  VendorAssessment,
  VendorFinding,
  UserCompetency,
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
export type TrustCenterProfileRecord = TrustCenterProfile & { createdAt: Date; updatedAt: Date };
export type TrustDocumentRecord = TrustDocument & { createdAt: Date; updatedAt: Date };
export type TrustRequestRecord = TrustRequest & { createdAt: Date; updatedAt: Date };
export type QuestionnaireTemplateRecord = QuestionnaireTemplate & { createdAt: Date; updatedAt: Date };
export type QuestionnaireSubmissionRecord = QuestionnaireSubmission & { createdAt: Date; updatedAt: Date };
export type QuestionnaireAnswerRecord = QuestionnaireAnswer & { createdAt: Date; updatedAt: Date };
export type TrustAccessLogRecord = TrustAccessLog & { createdAt: Date; updatedAt: Date };

// --- Governance Competency OS: Competency Engine ---
export type CompetencyRecord = Competency & { createdAt: Date; updatedAt: Date };
export type UserCompetencyRecord = UserCompetency & { tenantId: string; createdAt: Date; updatedAt: Date };
export type CompetencyAssessmentRecord = CompetencyAssessment & {
  tenantId: string;
  projectId: string | null;
  status: "draft" | "submitted" | "scored" | "disputed";
  createdAt: Date;
  updatedAt: Date;
};

// --- Governance Competency OS: Scenario Engine ---
export type ScenarioTemplateRecord = ScenarioTemplate & { createdAt: Date; updatedAt: Date };
export type ScenarioAttemptRecord = ScenarioAttempt & { createdAt: Date; updatedAt: Date };
export type ScenarioDecisionRecord = ScenarioDecision & { createdAt: Date; updatedAt: Date };
export type ScenarioOutcomeRecord = ScenarioOutcome & { createdAt: Date; updatedAt: Date };

// --- Governance Competency OS: Portfolio Artifact Engine ---
export type PortfolioArtifactRecord = PortfolioArtifact & { createdAt: Date; updatedAt: Date };
export type ArtifactVersionRecord = ArtifactVersion & { tenantId: string; createdAt: Date; updatedAt: Date };
export type ArtifactTemplateRecord = Omit<ArtifactTemplate, "tenantId"> & { tenantId: string; createdAt: Date; updatedAt: Date };

// --- Learning↔Operational Bridge ---
export type SimulatedCompanyObjectRecord = SimulatedCompanyObject & { createdAt: Date; updatedAt: Date };
