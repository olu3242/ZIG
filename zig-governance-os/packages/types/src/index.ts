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
  controlsImplemented: number;
  evidenceCoverage: number;
  riskTreatment: number;
  assessmentCompletion: number;
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
