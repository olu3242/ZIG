import { AuditRepository } from "./AuditRepository";
import { InMemoryDatabaseAdapter } from "./InMemoryDatabaseAdapter";
import { TenantRepository } from "./TenantRepository";
import { SupabaseAuditSink, SupabaseRestAdapter, type SupabaseRestConfig } from "./SupabaseRestAdapter";
import type {
  ArtifactTemplateRecord,
  ArtifactVersionRecord,
  AssetRecord,
  AssessmentRecord,
  AuditRecord,
  CompetencyAssessmentRecord,
  CompetencyRecord,
  ControlMappingRecord,
  ControlRecord,
  EvidenceRecord,
  FrameworkRecord,
  GovernanceScoreRecord,
  LearningModuleRecord,
  LearningPathRecord,
  PortfolioArtifactRecord,
  ProjectRecord,
  ProjectFrameworkRecord,
  RecommendationRecord,
  RiskAssessmentRecord,
  RiskRecord,
  RoleRecord,
  ScenarioAttemptRecord,
  ScenarioDecisionRecord,
  ScenarioOutcomeRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  ScenarioTemplateRecord,
  SimulatedCompanyObjectRecord,
  TaskRecord,
  TenantRecord,
  UserCompetencyRecord,
  UserRecord,
} from "./records";

export interface ZigRepositories {
  auditEvents: AuditRepository;
  tenants: TenantRepository<TenantRecord>;
  users: TenantRepository<UserRecord>;
  roles: TenantRepository<RoleRecord>;
  projects: TenantRepository<ProjectRecord>;
  projectFrameworks: TenantRepository<ProjectFrameworkRecord>;
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
  competencies: TenantRepository<CompetencyRecord>;
  userCompetencies: TenantRepository<UserCompetencyRecord>;
  competencyAssessments: TenantRepository<CompetencyAssessmentRecord>;
  scenarioTemplates: TenantRepository<ScenarioTemplateRecord>;
  scenarioAttempts: TenantRepository<ScenarioAttemptRecord>;
  scenarioDecisions: TenantRepository<ScenarioDecisionRecord>;
  scenarioOutcomes: TenantRepository<ScenarioOutcomeRecord>;
  portfolioArtifacts: TenantRepository<PortfolioArtifactRecord>;
  artifactVersions: TenantRepository<ArtifactVersionRecord>;
  artifactTemplates: TenantRepository<ArtifactTemplateRecord>;
  simulatedCompanyObjects: TenantRepository<SimulatedCompanyObjectRecord>;
}

export function createSupabaseRepositories(config: SupabaseRestConfig): ZigRepositories {
  const auditEvents = new SupabaseAuditSink(config);

  return {
    auditEvents: auditEvents as unknown as AuditRepository,
    tenants: new TenantRepository("tenants", new SupabaseRestAdapter<TenantRecord>(config), auditEvents),
    users: new TenantRepository("users", new SupabaseRestAdapter<UserRecord>(config), auditEvents),
    roles: new TenantRepository("roles", new SupabaseRestAdapter<RoleRecord>(config), auditEvents),
    projects: new TenantRepository("projects", new SupabaseRestAdapter<ProjectRecord>(config), auditEvents),
    projectFrameworks: new TenantRepository("project_frameworks", new SupabaseRestAdapter<ProjectFrameworkRecord>(config), auditEvents),
    frameworks: new TenantRepository("frameworks", new SupabaseRestAdapter<FrameworkRecord>(config), auditEvents),
    controls: new TenantRepository("controls", new SupabaseRestAdapter<ControlRecord>(config), auditEvents),
    controlMappings: new TenantRepository("control_mappings", new SupabaseRestAdapter<ControlMappingRecord>(config), auditEvents),
    assets: new TenantRepository("assets", new SupabaseRestAdapter<AssetRecord>(config), auditEvents),
    risks: new TenantRepository("risks", new SupabaseRestAdapter<RiskRecord>(config), auditEvents),
    riskAssessments: new TenantRepository("risk_assessments", new SupabaseRestAdapter<RiskAssessmentRecord>(config), auditEvents),
    evidence: new TenantRepository("evidence", new SupabaseRestAdapter<EvidenceRecord>(config), auditEvents),
    tasks: new TenantRepository("tasks", new SupabaseRestAdapter<TaskRecord>(config), auditEvents),
    audits: new TenantRepository("audits", new SupabaseRestAdapter<AuditRecord>(config), auditEvents),
    assessments: new TenantRepository("assessments", new SupabaseRestAdapter<AssessmentRecord>(config), auditEvents),
    learningPaths: new TenantRepository("learning_paths", new SupabaseRestAdapter<LearningPathRecord>(config), auditEvents),
    learningModules: new TenantRepository("learning_modules", new SupabaseRestAdapter<LearningModuleRecord>(config), auditEvents),
    scenarios: new TenantRepository("scenarios", new SupabaseRestAdapter<ScenarioRecord>(config), auditEvents),
    scenarioRuns: new TenantRepository("scenario_runs", new SupabaseRestAdapter<ScenarioRunRecord>(config), auditEvents),
    governanceScores: new TenantRepository("governance_scores", new SupabaseRestAdapter<GovernanceScoreRecord>(config), auditEvents),
    recommendations: new TenantRepository("recommendations", new SupabaseRestAdapter<RecommendationRecord>(config), auditEvents),
    competencies: new TenantRepository("competencies", new SupabaseRestAdapter<CompetencyRecord>(config), auditEvents),
    userCompetencies: new TenantRepository("user_competencies", new SupabaseRestAdapter<UserCompetencyRecord>(config), auditEvents),
    competencyAssessments: new TenantRepository("competency_assessments", new SupabaseRestAdapter<CompetencyAssessmentRecord>(config), auditEvents),
    scenarioTemplates: new TenantRepository("scenario_templates", new SupabaseRestAdapter<ScenarioTemplateRecord>(config), auditEvents),
    scenarioAttempts: new TenantRepository("scenario_attempts", new SupabaseRestAdapter<ScenarioAttemptRecord>(config), auditEvents),
    scenarioDecisions: new TenantRepository("scenario_decisions", new SupabaseRestAdapter<ScenarioDecisionRecord>(config), auditEvents),
    scenarioOutcomes: new TenantRepository("scenario_outcomes", new SupabaseRestAdapter<ScenarioOutcomeRecord>(config), auditEvents),
    portfolioArtifacts: new TenantRepository("portfolio_artifacts", new SupabaseRestAdapter<PortfolioArtifactRecord>(config), auditEvents),
    artifactVersions: new TenantRepository("artifact_versions", new SupabaseRestAdapter<ArtifactVersionRecord>(config), auditEvents),
    artifactTemplates: new TenantRepository("artifact_templates", new SupabaseRestAdapter<ArtifactTemplateRecord>(config), auditEvents),
    simulatedCompanyObjects: new TenantRepository("simulated_company_objects", new SupabaseRestAdapter<SimulatedCompanyObjectRecord>(config), auditEvents),
  };
}

export function createInMemoryRepositories(): ZigRepositories {
  const auditEvents = new AuditRepository();

  return {
    auditEvents,
    tenants: new TenantRepository("tenants", new InMemoryDatabaseAdapter<TenantRecord>(), auditEvents),
    users: new TenantRepository("users", new InMemoryDatabaseAdapter<UserRecord>(), auditEvents),
    roles: new TenantRepository("roles", new InMemoryDatabaseAdapter<RoleRecord>(), auditEvents),
    projects: new TenantRepository("projects", new InMemoryDatabaseAdapter<ProjectRecord>(), auditEvents),
    projectFrameworks: new TenantRepository("project_frameworks", new InMemoryDatabaseAdapter<ProjectFrameworkRecord>(), auditEvents),
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
    competencies: new TenantRepository("competencies", new InMemoryDatabaseAdapter<CompetencyRecord>(), auditEvents),
    userCompetencies: new TenantRepository("user_competencies", new InMemoryDatabaseAdapter<UserCompetencyRecord>(), auditEvents),
    competencyAssessments: new TenantRepository("competency_assessments", new InMemoryDatabaseAdapter<CompetencyAssessmentRecord>(), auditEvents),
    scenarioTemplates: new TenantRepository("scenario_templates", new InMemoryDatabaseAdapter<ScenarioTemplateRecord>(), auditEvents),
    scenarioAttempts: new TenantRepository("scenario_attempts", new InMemoryDatabaseAdapter<ScenarioAttemptRecord>(), auditEvents),
    scenarioDecisions: new TenantRepository("scenario_decisions", new InMemoryDatabaseAdapter<ScenarioDecisionRecord>(), auditEvents),
    scenarioOutcomes: new TenantRepository("scenario_outcomes", new InMemoryDatabaseAdapter<ScenarioOutcomeRecord>(), auditEvents),
    portfolioArtifacts: new TenantRepository("portfolio_artifacts", new InMemoryDatabaseAdapter<PortfolioArtifactRecord>(), auditEvents),
    artifactVersions: new TenantRepository("artifact_versions", new InMemoryDatabaseAdapter<ArtifactVersionRecord>(), auditEvents),
    artifactTemplates: new TenantRepository("artifact_templates", new InMemoryDatabaseAdapter<ArtifactTemplateRecord>(), auditEvents),
    simulatedCompanyObjects: new TenantRepository("simulated_company_objects", new InMemoryDatabaseAdapter<SimulatedCompanyObjectRecord>(), auditEvents),
  };
}
