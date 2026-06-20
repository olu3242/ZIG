import type {
  ArtifactTemplate,
  ArtifactVersion,
  Asset,
  Assessment,
  Audit,
  Competency,
  CompetencyAssessment,
  Control,
  ControlMapping,
  Evidence,
  Framework,
  GovernanceScore,
  LearningModule,
  LearningPath,
  PortfolioArtifact,
  Project,
  ProjectFramework,
  Recommendation,
  Risk,
  RiskAssessment,
  Role,
  Scenario,
  ScenarioAttempt,
  ScenarioDecision,
  ScenarioOutcome,
  ScenarioRun,
  ScenarioTemplate,
  SimulatedCompanyObject,
  Task,
  Tenant,
  User,
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
