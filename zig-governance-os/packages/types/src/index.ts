export type RoleName =
  | "Platform Admin"
  | "Tenant Admin"
  | "Organization Admin"
  | "GRC Manager"
  | "Analyst"
  | "Risk Analyst"
  | "Compliance Analyst"
  | "Auditor"
  | "Consultant"
  | "Learner"
  | "Viewer";

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
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
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

export interface Framework {
  id: string;
  code: string;
  name: string;
  version: string;
  description: string;
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
  submittedById?: string;
  submittedAt?: Date;
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
