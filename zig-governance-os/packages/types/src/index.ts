export type RoleName =
  | "Platform Owner"
  | "Platform Admin"
  | "Tenant Admin"
  | "Organization Admin"
  | "GRC Manager"
  | "Governance Manager"
  | "Risk Manager"
  | "Compliance Manager"
  | "Analyst"
  | "Risk Analyst"
  | "Compliance Analyst"
  | "Auditor"
  | "Consultant"
  | "Learner"
  | "Viewer";

export type Persona =
  | "Platform Owner"
  | "Platform Admin"
  | "Tenant Admin"
  | "Governance Manager"
  | "Risk Manager"
  | "Compliance Manager"
  | "Auditor"
  | "Executive"
  | "Learner"
  | "Consultant";

export type TenantStatus = "trial" | "active" | "suspended" | "archived";
export type SubscriptionPlan = "free" | "team" | "business" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";
export type ProjectStatus = "draft" | "active" | "paused" | "completed";
export type ControlStatus = "planned" | "implemented" | "needs_evidence" | "accepted";
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskTreatment = "avoid" | "mitigate" | "transfer" | "accept";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type EvidenceStatus = "missing" | "requested" | "submitted" | "approved";
export type RecommendationSeverity = "info" | "medium" | "high" | "critical";
export type ScenarioRunStatus = "not_started" | "running" | "paused" | "completed";
export type RecordSourceType = "operational" | "learning_import";

export interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBranding {
  tenantId: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  displayName: string;
}

export interface TenantSubscription {
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  seats: number;
  currentPeriodEndsAt: Date;
}

export interface TenantSettings {
  tenantId: string;
  branding: TenantBranding;
  preferredFrameworkIds: string[];
  riskAppetite: "low" | "moderate" | "high";
  governanceTargets: {
    minimumHealthScore: number;
    evidenceCoverage: number;
    assessmentCompletion: number;
  };
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  authUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  persona: Persona;
  status: "invited" | "active" | "disabled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  action: "view" | "create" | "edit" | "delete" | "approve";
  resource: string;
  description: string;
}

export interface Role {
  id: string;
  tenantId: string;
  name: RoleName;
  description: string;
  permissions: Permission[];
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  frameworkId: string;
  status: ProjectStatus;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFramework {
  id: string;
  tenantId: string;
  projectId: string;
  frameworkId: string;
  assignedByUserId?: string;
  assignedAt: Date;
}

export interface Framework {
  id: string;
  code: string;
  name: string;
  version: string;
  description: string;
  status?: "draft" | "active" | "archived";
}

export interface Control {
  id: string;
  tenantId: string;
  projectId: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  status: ControlStatus;
  ownerId?: string;
  sourceType: RecordSourceType;
  importedFromScenarioId?: string;
  importedFromObjectId?: string;
  importedByUserId?: string;
  importedAt?: Date;
  reportingCleared?: boolean;
}

export interface ControlMapping {
  id: string;
  tenantId: string;
  projectId: string;
  sourceControlId: string;
  targetFrameworkId: string;
  targetControlId: string;
  mappingRationale: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  category: string;
  ownerId?: string;
  criticality: RiskSeverity;
  sourceType: RecordSourceType;
  importedFromScenarioId?: string;
  importedFromObjectId?: string;
  importedByUserId?: string;
  importedAt?: Date;
  reportingCleared?: boolean;
}

export interface Risk {
  id: string;
  tenantId: string;
  projectId: string;
  assetId: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  treatment: RiskTreatment;
  sourceType: RecordSourceType;
  importedFromScenarioId?: string;
  importedFromObjectId?: string;
  importedByUserId?: string;
  importedAt?: Date;
  reportingCleared?: boolean;
}

export interface RiskAssessment {
  id: string;
  tenantId: string;
  projectId: string;
  riskId: string;
  likelihood: number;
  impact: number;
  severity: RiskSeverity;
  treatmentDecision: RiskTreatment;
  assessedAt: Date;
}

export interface Evidence {
  id: string;
  tenantId: string;
  projectId: string;
  controlId: string;
  title: string;
  status: EvidenceStatus;
  submittedById?: string;
  submittedAt?: Date;
  sourceType: RecordSourceType;
  importedFromScenarioId?: string;
  importedFromObjectId?: string;
  importedByUserId?: string;
  importedAt?: Date;
  reportingCleared?: boolean;
}

export interface Task {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  ownerId?: string;
  dueAt?: Date;
}

export interface Audit {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  frameworkId: string;
  startsAt: Date;
  endsAt?: Date;
}

export interface LearningPath {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  progressPercent: number;
}

export interface LearningModule {
  id: string;
  learningPathId: string;
  title: string;
  moduleType: "lesson" | "lab" | "exercise";
  durationMinutes: number;
}

export interface Assessment {
  id: string;
  learningModuleId: string;
  title: string;
  passingScore: number;
}

export interface Scenario {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  description: string;
  frameworkIds: string[];
  templateId?: string;
}

export interface ScenarioRun {
  id: string;
  tenantId: string;
  projectId: string;
  scenarioId: string;
  status: ScenarioRunStatus;
  scoreDelta: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface GovernanceScore {
  tenantId: string;
  projectId: string;
  score: number;
  controlsImplemented: number;
  evidenceCoverage: number;
  riskTreatment: number;
  assessmentCompletion: number;
  explanation: string;
  calculatedAt: Date;
}

export interface Recommendation {
  id: string;
  tenantId: string;
  projectId: string;
  severity: RecommendationSeverity;
  title: string;
  explanation: string;
  action: string;
  confidence: number;
  frameworkReference?: string;
}

// --- Governance Competency OS: Competency Engine (docs/architecture/competency-engine.md) ---

export type CompetencyCode =
  | "asset_management"
  | "risk_assessment"
  | "control_design"
  | "evidence_management"
  | "framework_mapping"
  | "audit_readiness"
  | "vendor_risk"
  | "governance_reporting";

export type CompetencyLevel = "novice" | "developing" | "proficient" | "advanced";

export type CompetencyAssessmentSource =
  | "learning_module"
  | "scenario"
  | "portfolio_artifact"
  | "manual";

export interface Competency {
  id: string;
  tenantId: string;
  code: CompetencyCode;
  name: string;
  description: string;
  category: "core" | "specialist";
  isActive: boolean;
  sortOrder: number;
}

export interface UserCompetency {
  id: string;
  tenantId: string;
  learnerId: string;
  competencyId: string;
  proficiencyLevel: CompetencyLevel;
  currentScore: number;
  assessmentCount: number;
  lastAssessedAt: Date | null;
  latestAssessmentId: string | null;
}

export interface CompetencyRubricCriterionScore {
  criterionKey: string;
  label: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  feedback: string | null;
}

export interface CompetencyRubricScore {
  competencyCode: CompetencyCode;
  criteria: CompetencyRubricCriterionScore[];
  rubricVersion: string;
}

export interface CompetencyAssessment {
  id: string;
  learnerId: string;
  competencyId: string;
  sourceType: CompetencyAssessmentSource;
  sourceRefId: string | null;
  rubric: CompetencyRubricScore;
  overallScore: number;
  proficiencyLevel: CompetencyLevel;
  assessedAt: Date;
  assessorType: "system" | "ai_coach" | "instructor";
  assessorId: string | null;
  notes: string | null;
}

// --- Governance Competency OS: Scenario Engine (docs/architecture/scenario-engine.md) ---

export interface ScenarioTemplate {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  simulatedCompany: string;
  description: string;
  frameworkIds: string[];
  competencyIds: string[];
  difficulty: "foundation" | "intermediate" | "advanced";
  decisionPointIds: string[];
  startingScores: {
    riskScore: number;
    healthScore: number;
    readinessScore: number;
  };
  status: "draft" | "published" | "retired";
}

export interface ScenarioAttempt {
  id: string;
  tenantId: string;
  projectId: string;
  scenarioId: string;
  templateId: string;
  learnerId: string;
  status: "in_progress" | "completed" | "abandoned";
  currentDecisionPointId: string | null;
  riskScore: number;
  healthScore: number;
  readinessScore: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface ScenarioDecisionOption {
  id: string;
  label: string;
  scoreDeltas: {
    riskScore: number;
    healthScore: number;
    readinessScore: number;
  };
}

export interface ScenarioDecision {
  id: string;
  tenantId: string;
  attemptId: string;
  decisionPointId: string;
  prompt: string;
  optionsPresented: ScenarioDecisionOption[];
  optionChosen: string;
  scoreDeltas: {
    riskScore: number;
    healthScore: number;
    readinessScore: number;
  };
  rationale: string;
  decidedAt: Date;
}

export interface ScenarioOutcome {
  id: string;
  tenantId: string;
  attemptId: string;
  learnerId: string;
  scenarioId: string;
  templateId: string;
  finalRiskScore: number;
  finalHealthScore: number;
  readinessScoreDelta: number;
  decisionsCount: number;
  competenciesDemonstrated: string[];
  grade: "strong" | "adequate" | "weak";
  summary: string;
  completedAt: Date;
}

// --- Governance Competency OS: Portfolio Artifact Engine (docs/architecture/portfolio-artifact-engine.md) ---

export type PortfolioArtifactType =
  | "riskRegister"
  | "assetRegister"
  | "controlMatrix"
  | "auditPlan"
  | "vendorAssessment"
  | "bia"
  | "boardReport";

export type PortfolioArtifactExportFormat = "pdf" | "excel" | "markdown";

export type PortfolioArtifactStatus = "draft" | "generated" | "exported" | "archived";

export interface PortfolioArtifact {
  id: string;
  tenantId: string;
  learnerId: string;
  projectId: string;
  scenarioRunId?: string;
  artifactType: PortfolioArtifactType;
  templateId?: string;
  currentVersionId: string;
  exportFormat: PortfolioArtifactExportFormat;
  status: PortfolioArtifactStatus;
  title: string;
}

export interface ArtifactVersion {
  id: string;
  tenantId: string;
  portfolioArtifactId: string;
  versionNumber: number;
  content: Record<string, unknown>;
  contentRef?: string;
  sourceSnapshot: {
    projectId: string;
    capturedAt: Date;
    recordCounts: Record<string, number>;
  };
  generationReason: "initial" | "regeneration" | "feedback_revision" | "manual_edit";
  feedbackNoteRef?: string;
  exportFormat: PortfolioArtifactExportFormat;
  createdByUserId?: string;
}

export interface ArtifactTemplateSection {
  key: string;
  label: string;
  contentSource: "static" | "service_read" | "learner_input";
  staticContentRef?: string;
}

// --- Learning↔Operational Bridge read-only source (existing table, typed for the first time here) ---

export type SimulatedCompanyObjectType = "asset" | "control" | "risk" | "evidence";

export interface SimulatedCompanyObject {
  id: string;
  tenantId: string;
  simulatedCompanyId: string;
  objectType: SimulatedCompanyObjectType;
  name: string;
  status: string;
  payload: Record<string, unknown>;
}

export interface ArtifactTemplate {
  id: string;
  tenantId?: string;
  artifactType: PortfolioArtifactType;
  name: string;
  description: string;
  sectionSchema: ArtifactTemplateSection[];
  isDefault: boolean;
}
