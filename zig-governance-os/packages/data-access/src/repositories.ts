import { AuditRepository } from "./AuditRepository";
import { InMemoryDatabaseAdapter } from "./InMemoryDatabaseAdapter";
import { TenantRepository } from "./TenantRepository";
import type {
  AssetRecord,
  AssessmentRecord,
  AuditRecord,
  ControlMappingRecord,
  ControlRecord,
  EvidenceRecord,
  FrameworkRecord,
  GovernanceScoreRecord,
  LearningModuleRecord,
  LearningPathRecord,
  ProjectRecord,
  RecommendationRecord,
  RiskAssessmentRecord,
  RiskRecord,
  RoleRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  TaskRecord,
  TenantRecord,
  UserRecord,
} from "./records";

export interface ZigRepositories {
  auditEvents: AuditRepository;
  tenants: TenantRepository<TenantRecord>;
  users: TenantRepository<UserRecord>;
  roles: TenantRepository<RoleRecord>;
  projects: TenantRepository<ProjectRecord>;
  frameworks: TenantRepository<FrameworkRecord>;
  controls: TenantRepository<ControlRecord>;
  controlMappings: TenantRepository<ControlMappingRecord>;
  assets: TenantRepository<AssetRecord>;
  risks: TenantRepository<RiskRecord>;
  riskAssessments: TenantRepository<RiskAssessmentRecord>;
  evidence: TenantRepository<EvidenceRecord>;
  tasks: TenantRepository<TaskRecord>;
  audits: TenantRepository<AuditRecord>;
  assessments: TenantRepository<AssessmentRecord>;
  learningPaths: TenantRepository<LearningPathRecord>;
  learningModules: TenantRepository<LearningModuleRecord>;
  scenarios: TenantRepository<ScenarioRecord>;
  scenarioRuns: TenantRepository<ScenarioRunRecord>;
  governanceScores: TenantRepository<GovernanceScoreRecord>;
  recommendations: TenantRepository<RecommendationRecord>;
}

export function createInMemoryRepositories(): ZigRepositories {
  const auditEvents = new AuditRepository();

  return {
    auditEvents,
    tenants: new TenantRepository("tenants", new InMemoryDatabaseAdapter<TenantRecord>(), auditEvents),
    users: new TenantRepository("users", new InMemoryDatabaseAdapter<UserRecord>(), auditEvents),
    roles: new TenantRepository("roles", new InMemoryDatabaseAdapter<RoleRecord>(), auditEvents),
    projects: new TenantRepository("projects", new InMemoryDatabaseAdapter<ProjectRecord>(), auditEvents),
    frameworks: new TenantRepository("frameworks", new InMemoryDatabaseAdapter<FrameworkRecord>(), auditEvents),
    controls: new TenantRepository("controls", new InMemoryDatabaseAdapter<ControlRecord>(), auditEvents),
    controlMappings: new TenantRepository("control_mappings", new InMemoryDatabaseAdapter<ControlMappingRecord>(), auditEvents),
    assets: new TenantRepository("assets", new InMemoryDatabaseAdapter<AssetRecord>(), auditEvents),
    risks: new TenantRepository("risks", new InMemoryDatabaseAdapter<RiskRecord>(), auditEvents),
    riskAssessments: new TenantRepository("risk_assessments", new InMemoryDatabaseAdapter<RiskAssessmentRecord>(), auditEvents),
    evidence: new TenantRepository("evidence", new InMemoryDatabaseAdapter<EvidenceRecord>(), auditEvents),
    tasks: new TenantRepository("tasks", new InMemoryDatabaseAdapter<TaskRecord>(), auditEvents),
    audits: new TenantRepository("audits", new InMemoryDatabaseAdapter<AuditRecord>(), auditEvents),
    assessments: new TenantRepository("assessments", new InMemoryDatabaseAdapter<AssessmentRecord>(), auditEvents),
    learningPaths: new TenantRepository("learning_paths", new InMemoryDatabaseAdapter<LearningPathRecord>(), auditEvents),
    learningModules: new TenantRepository("learning_modules", new InMemoryDatabaseAdapter<LearningModuleRecord>(), auditEvents),
    scenarios: new TenantRepository("scenarios", new InMemoryDatabaseAdapter<ScenarioRecord>(), auditEvents),
    scenarioRuns: new TenantRepository("scenario_runs", new InMemoryDatabaseAdapter<ScenarioRunRecord>(), auditEvents),
    governanceScores: new TenantRepository("governance_scores", new InMemoryDatabaseAdapter<GovernanceScoreRecord>(), auditEvents),
    recommendations: new TenantRepository("recommendations", new InMemoryDatabaseAdapter<RecommendationRecord>(), auditEvents),
  };
}
