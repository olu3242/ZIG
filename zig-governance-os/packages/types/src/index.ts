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

export interface FrameworkDomain {
  id: string;
  tenantId: string;
  frameworkId: string;
  code: string;
  name: string;
  description: string;
}

export interface FrameworkControl {
  id: string;
  tenantId: string;
  frameworkId: string;
  domainId?: string;
  controlCode: string;
  title: string;
  description: string;
}

export interface FrameworkRequirement {
  id: string;
  tenantId: string;
  frameworkControlId: string;
  requirementCode: string;
  requirementText: string;
}

export interface FrameworkMapping {
  id: string;
  tenantId: string;
  sourceFrameworkControlId: string;
  targetFrameworkControlId: string;
  mappingStrength: "equivalent" | "partial" | "related";
  rationale: string;
}

export interface FrameworkCrosswalk {
  id: string;
  tenantId: string;
  sourceFrameworkId: string;
  targetFrameworkId: string;
  name: string;
  status: "draft" | "published";
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
  sourceUri?: string;
  submittedById?: string;
  submittedAt?: Date;
  sourceType: RecordSourceType;
  importedFromScenarioId?: string;
  importedFromObjectId?: string;
  importedByUserId?: string;
  importedAt?: Date;
  reportingCleared?: boolean;
}

export type ControlEvidenceCoverage = "supporting" | "primary";

export interface ControlEvidence {
  id: string;
  tenantId: string;
  controlId: string;
  evidenceId: string;
  coverage: ControlEvidenceCoverage;
}

export type EvidenceReviewStatus = "pending_review" | "approved" | "rejected";

export interface EvidenceReview {
  id: string;
  tenantId: string;
  evidenceId: string;
  reviewerUserId?: string;
  status: EvidenceReviewStatus;
  reviewedAt?: Date;
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

export interface LearningAssessment {
  id: string;
  tenantId: string;
  assessmentType: string;
  title: string;
  passingScore: number;
}

export interface LearningAssessmentQuestion {
  id: string;
  tenantId: string;
  assessmentId: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  weight: number;
  orderIndex: number;
}

export interface LearningAssessmentResult {
  id: string;
  tenantId: string;
  assessmentId: string;
  learnerUserId: string;
  score: number;
  passed: boolean;
  remediationSkillIds: string[];
}

export type UserProgressStatus = "enrolled" | "in_progress" | "completed";

export interface UserProgress {
  id: string;
  tenantId: string;
  userId: string;
  learningPathId: string;
  moduleId?: string;
  lessonId?: string;
  status: UserProgressStatus;
  completedAt?: Date;
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

export interface LabTask {
  id: string;
  tenantId: string;
  scenarioId: string;
  title: string;
  instructions: string;
  expectedOutputType: string;
  weight: number;
  orderIndex: number;
}

export type LabArtifactType = "risk_register" | "audit_finding" | "gap_assessment" | "evidence_record" | "vendor_review";

export interface LabTaskSubmission {
  id: string;
  tenantId: string;
  scenarioRunId: string;
  labTaskId: string;
  submittedBy?: string;
  content: Record<string, unknown>;
  isComplete: boolean;
}

export interface LabArtifact {
  id: string;
  tenantId: string;
  scenarioRunId: string;
  artifactType: LabArtifactType;
  content: Record<string, unknown>;
  score: number;
}

export type VendorCriticality = "low" | "medium" | "high" | "critical";
export type VendorStatus = "active" | "offboarding" | "offboarded";

export interface Vendor {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  category: string;
  criticality: VendorCriticality;
  status: VendorStatus;
  contactEmail?: string;
}

export type VendorAssessmentStatus = "in_progress" | "completed";

export interface VendorAssessment {
  id: string;
  tenantId: string;
  vendorId: string;
  assessedByUserId?: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  status: VendorAssessmentStatus;
  assessedAt?: Date;
}

export type VendorFindingSeverity = "low" | "medium" | "high" | "critical";
export type VendorFindingStatus = "open" | "remediating" | "resolved" | "accepted";

export interface VendorFinding {
  id: string;
  tenantId: string;
  vendorAssessmentId: string;
  vendorId: string;
  title: string;
  severity: VendorFindingSeverity;
  status: VendorFindingStatus;
  remediationDueAt?: Date;
}

export type CoachContextType = "learning_path" | "lesson" | "assessment" | "lab" | "general";

export interface CoachConversation {
  id: string;
  tenantId: string;
  learnerUserId: string;
  contextType: CoachContextType;
  contextId?: string;
  startedAt: Date;
}

export type CoachMessageRole = "learner" | "coach";

export interface CoachMessage {
  id: string;
  tenantId: string;
  conversationId: string;
  role: CoachMessageRole;
  content: string;
  reasoning?: string;
  supportingData: Record<string, unknown>;
  confidence?: number;
  frameworkReference?: string;
}

export interface GovernanceScore {
  tenantId: string;
  projectId: string;
  score: number;
  healthState: "Foundation" | "Visibility" | "Control" | "Managed" | "Optimized";
  controlCoverage: number;
  riskAssessmentCoverage: number;
  evidenceCompleteness: number;
  frameworkCoverage: number;
  ownershipCompleteness: number;
  reviewCompletion: number;
  vendorAssessmentCoverage: number;
  explanation: string;
  calculatedAt: Date;
}

export interface StudentTwin {
  id: string;
  tenantId: string;
  learnerUserId: string;
  knowledgeScore: number;
  skillsScore: number;
  competencyScore: number;
  portfolioScore: number;
  certificationScore: number;
  careerScore: number;
  behaviorScore: number;
  confidenceScore: number;
  learningScore: number;
}

export interface CapstoneProject {
  id: string;
  tenantId: string;
  learnerUserId?: string;
  title: string;
  status: string;
  portfolioScore: number;
}

export interface LearnerPortfolio {
  id: string;
  tenantId: string;
  learnerUserId?: string;
  validationStatus: string;
  portfolioScore: number;
  resumeSummary: string;
  linkedinSummary: string;
}

export interface CertificationAward {
  id: string;
  tenantId: string;
  learnerUserId?: string;
  certificationKey: string;
  badgeKey: string;
  scoreSnapshot: Record<string, unknown>;
  awardedAt: Date;
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

export interface TrustCenterProfile {
  id: string;
  tenantId: string;
  projectId: string;
  slug: string;
  organizationName: string;
  tagline?: string;
  supportEmail?: string;
  isPublished: boolean;
}

export type TrustDocumentVisibility = "public" | "protected" | "nda_required" | "approval_required";

export type TrustDocumentCategory =
  | "information_security_policy"
  | "acceptable_use_policy"
  | "vendor_management_policy"
  | "risk_management_policy"
  | "incident_response_plan"
  | "business_continuity_plan"
  | "disaster_recovery_plan"
  | "privacy_policy"
  | "security_overview"
  | "compliance_report"
  | "audit_report";

export interface TrustDocument {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  category: TrustDocumentCategory;
  visibility: TrustDocumentVisibility;
  sourceUri: string;
  expiresAt?: Date;
}

export type TrustRequestStatus = "pending" | "approved" | "denied" | "fulfilled";

export interface TrustRequest {
  id: string;
  tenantId: string;
  projectId: string;
  documentId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany?: string;
  reason: string;
  status: TrustRequestStatus;
  decidedByUserId?: string;
  decidedAt?: Date;
}

export type QuestionnaireTemplateType = "sig" | "sig_lite" | "caiq" | "hipaa_vendor" | "soc" | "custom";

export interface QuestionnaireQuestion {
  key: string;
  text: string;
  category?: string;
}

export interface QuestionnaireTemplate {
  id: string;
  tenantId: string;
  name: string;
  templateType: QuestionnaireTemplateType;
  questions: QuestionnaireQuestion[];
}

export type QuestionnaireSubmissionStatus = "in_progress" | "submitted" | "completed";

export interface QuestionnaireSubmission {
  id: string;
  tenantId: string;
  projectId: string;
  templateId: string;
  requesterName: string;
  requesterEmail: string;
  status: QuestionnaireSubmissionStatus;
  completedAt?: Date;
}

export interface QuestionnaireAnswer {
  id: string;
  tenantId: string;
  submissionId: string;
  questionKey: string;
  questionText: string;
  answerText: string;
  aiGenerated: boolean;
  confidence: number;
  reasoning: string;
}

export type TrustAccessEventType = "profile_view" | "document_view" | "document_request" | "questionnaire_request";

export interface TrustAccessLog {
  id: string;
  tenantId: string;
  projectId: string;
  eventType: TrustAccessEventType;
  resourceId?: string;
  visitorEmail?: string;
  occurredAt: Date;
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
