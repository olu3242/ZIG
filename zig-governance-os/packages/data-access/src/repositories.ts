import { AuditRepository } from "./AuditRepository";
import { InMemoryDatabaseAdapter } from "./InMemoryDatabaseAdapter";
import { TenantRepository } from "./TenantRepository";
import { SupabaseAuditSink, SupabaseRestAdapter, type SupabaseRestConfig } from "./SupabaseRestAdapter";
import type {
  AssetRecord,
  AssessmentRecord,
  AuditRecord,
  CapstoneProjectRecord,
  CertificationAwardRecord,
  CoachConversationRecord,
  CoachMessageRecord,
  ControlEvidenceRecord,
  ControlMappingRecord,
  ControlRecord,
  EvidenceRecord,
  EvidenceReviewRecord,
  FrameworkRecord,
  FrameworkControlRecord,
  FrameworkCrosswalkRecord,
  FrameworkDomainRecord,
  FrameworkMappingRecord,
  FrameworkRequirementRecord,
  GovernanceScoreRecord,
  LabArtifactRecord,
  LabTaskRecord,
  LabTaskSubmissionRecord,
  LearningAssessmentRecord,
  LearningAssessmentQuestionRecord,
  LearningAssessmentResultRecord,
  LearningModuleRecord,
  LearningPathRecord,
  LearnerPortfolioRecord,
  ProjectRecord,
  ProjectFrameworkRecord,
  QuestionnaireAnswerRecord,
  QuestionnaireSubmissionRecord,
  QuestionnaireTemplateRecord,
  RecommendationRecord,
  RiskAssessmentRecord,
  RiskRecord,
  RoleRecord,
  ScenarioRecord,
  ScenarioRunRecord,
  StudentTwinRecord,
  TaskRecord,
  TenantRecord,
  TrustAccessLogRecord,
  TrustCenterProfileRecord,
  TrustDocumentRecord,
  TrustRequestRecord,
  UserProgressRecord,
  UserRecord,
  VendorAssessmentRecord,
  VendorFindingRecord,
  VendorRecord,
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
  frameworkDomains: TenantRepository<FrameworkDomainRecord>;
  frameworkControls: TenantRepository<FrameworkControlRecord>;
  frameworkRequirements: TenantRepository<FrameworkRequirementRecord>;
  frameworkMappings: TenantRepository<FrameworkMappingRecord>;
  frameworkCrosswalks: TenantRepository<FrameworkCrosswalkRecord>;
  assets: TenantRepository<AssetRecord>;
  risks: TenantRepository<RiskRecord>;
  riskAssessments: TenantRepository<RiskAssessmentRecord>;
  evidence: TenantRepository<EvidenceRecord>;
  controlEvidence: TenantRepository<ControlEvidenceRecord>;
  evidenceReviews: TenantRepository<EvidenceReviewRecord>;
  tasks: TenantRepository<TaskRecord>;
  audits: TenantRepository<AuditRecord>;
  assessments: TenantRepository<AssessmentRecord>;
  learningPaths: TenantRepository<LearningPathRecord>;
  learningModules: TenantRepository<LearningModuleRecord>;
  learningAssessments: TenantRepository<LearningAssessmentRecord>;
  learningAssessmentQuestions: TenantRepository<LearningAssessmentQuestionRecord>;
  learningAssessmentResults: TenantRepository<LearningAssessmentResultRecord>;
  userProgress: TenantRepository<UserProgressRecord>;
  studentTwins: TenantRepository<StudentTwinRecord>;
  scenarios: TenantRepository<ScenarioRecord>;
  scenarioRuns: TenantRepository<ScenarioRunRecord>;
  labTasks: TenantRepository<LabTaskRecord>;
  labTaskSubmissions: TenantRepository<LabTaskSubmissionRecord>;
  labArtifacts: TenantRepository<LabArtifactRecord>;
  vendors: TenantRepository<VendorRecord>;
  vendorAssessments: TenantRepository<VendorAssessmentRecord>;
  vendorFindings: TenantRepository<VendorFindingRecord>;
  governanceScores: TenantRepository<GovernanceScoreRecord>;
  recommendations: TenantRepository<RecommendationRecord>;
  coachConversations: TenantRepository<CoachConversationRecord>;
  coachMessages: TenantRepository<CoachMessageRecord>;
  capstoneProjects: TenantRepository<CapstoneProjectRecord>;
  learnerPortfolios: TenantRepository<LearnerPortfolioRecord>;
  certificationAwards: TenantRepository<CertificationAwardRecord>;
  trustCenterProfiles: TenantRepository<TrustCenterProfileRecord>;
  trustDocuments: TenantRepository<TrustDocumentRecord>;
  trustRequests: TenantRepository<TrustRequestRecord>;
  questionnaireTemplates: TenantRepository<QuestionnaireTemplateRecord>;
  questionnaireSubmissions: TenantRepository<QuestionnaireSubmissionRecord>;
  questionnaireAnswers: TenantRepository<QuestionnaireAnswerRecord>;
  trustAccessLogs: TenantRepository<TrustAccessLogRecord>;
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
    frameworkDomains: new TenantRepository("framework_domains", new SupabaseRestAdapter<FrameworkDomainRecord>(config), auditEvents),
    frameworkControls: new TenantRepository("framework_controls", new SupabaseRestAdapter<FrameworkControlRecord>(config), auditEvents),
    frameworkRequirements: new TenantRepository("framework_requirements", new SupabaseRestAdapter<FrameworkRequirementRecord>(config), auditEvents),
    frameworkMappings: new TenantRepository("framework_mappings", new SupabaseRestAdapter<FrameworkMappingRecord>(config), auditEvents),
    frameworkCrosswalks: new TenantRepository("framework_crosswalks", new SupabaseRestAdapter<FrameworkCrosswalkRecord>(config), auditEvents),
    assets: new TenantRepository("assets", new SupabaseRestAdapter<AssetRecord>(config), auditEvents),
    risks: new TenantRepository("risks", new SupabaseRestAdapter<RiskRecord>(config), auditEvents),
    riskAssessments: new TenantRepository("risk_assessments", new SupabaseRestAdapter<RiskAssessmentRecord>(config), auditEvents),
    evidence: new TenantRepository("evidence", new SupabaseRestAdapter<EvidenceRecord>(config), auditEvents),
    controlEvidence: new TenantRepository("control_evidence", new SupabaseRestAdapter<ControlEvidenceRecord>(config), auditEvents),
    evidenceReviews: new TenantRepository("evidence_reviews", new SupabaseRestAdapter<EvidenceReviewRecord>(config), auditEvents),
    tasks: new TenantRepository("tasks", new SupabaseRestAdapter<TaskRecord>(config), auditEvents),
    audits: new TenantRepository("audits", new SupabaseRestAdapter<AuditRecord>(config), auditEvents),
    assessments: new TenantRepository("assessments", new SupabaseRestAdapter<AssessmentRecord>(config), auditEvents),
    learningPaths: new TenantRepository("learning_paths", new SupabaseRestAdapter<LearningPathRecord>(config), auditEvents),
    learningModules: new TenantRepository("learning_modules", new SupabaseRestAdapter<LearningModuleRecord>(config), auditEvents),
    learningAssessments: new TenantRepository("learning_assessments", new SupabaseRestAdapter<LearningAssessmentRecord>(config), auditEvents),
    learningAssessmentQuestions: new TenantRepository("learning_assessment_questions", new SupabaseRestAdapter<LearningAssessmentQuestionRecord>(config), auditEvents),
    learningAssessmentResults: new TenantRepository("learning_assessment_results", new SupabaseRestAdapter<LearningAssessmentResultRecord>(config), auditEvents),
    userProgress: new TenantRepository("user_progress", new SupabaseRestAdapter<UserProgressRecord>(config), auditEvents),
    studentTwins: new TenantRepository("student_twins", new SupabaseRestAdapter<StudentTwinRecord>(config), auditEvents),
    scenarios: new TenantRepository("scenarios", new SupabaseRestAdapter<ScenarioRecord>(config), auditEvents),
    scenarioRuns: new TenantRepository("scenario_runs", new SupabaseRestAdapter<ScenarioRunRecord>(config), auditEvents),
    labTasks: new TenantRepository("lab_tasks", new SupabaseRestAdapter<LabTaskRecord>(config), auditEvents),
    labTaskSubmissions: new TenantRepository("lab_task_submissions", new SupabaseRestAdapter<LabTaskSubmissionRecord>(config), auditEvents),
    labArtifacts: new TenantRepository("lab_artifacts", new SupabaseRestAdapter<LabArtifactRecord>(config), auditEvents),
    vendors: new TenantRepository("vendors", new SupabaseRestAdapter<VendorRecord>(config), auditEvents),
    vendorAssessments: new TenantRepository("vendor_assessments", new SupabaseRestAdapter<VendorAssessmentRecord>(config), auditEvents),
    vendorFindings: new TenantRepository("vendor_findings", new SupabaseRestAdapter<VendorFindingRecord>(config), auditEvents),
    governanceScores: new TenantRepository("governance_scores", new SupabaseRestAdapter<GovernanceScoreRecord>(config), auditEvents),
    recommendations: new TenantRepository("recommendations", new SupabaseRestAdapter<RecommendationRecord>(config), auditEvents),
    coachConversations: new TenantRepository("coach_conversations", new SupabaseRestAdapter<CoachConversationRecord>(config), auditEvents),
    coachMessages: new TenantRepository("coach_messages", new SupabaseRestAdapter<CoachMessageRecord>(config), auditEvents),
    capstoneProjects: new TenantRepository("capstone_projects", new SupabaseRestAdapter<CapstoneProjectRecord>(config), auditEvents),
    learnerPortfolios: new TenantRepository("learner_portfolios", new SupabaseRestAdapter<LearnerPortfolioRecord>(config), auditEvents),
    certificationAwards: new TenantRepository("certification_awards", new SupabaseRestAdapter<CertificationAwardRecord>(config), auditEvents),
    trustCenterProfiles: new TenantRepository("trust_center_profiles", new SupabaseRestAdapter<TrustCenterProfileRecord>(config), auditEvents),
    trustDocuments: new TenantRepository("trust_documents", new SupabaseRestAdapter<TrustDocumentRecord>(config), auditEvents),
    trustRequests: new TenantRepository("trust_requests", new SupabaseRestAdapter<TrustRequestRecord>(config), auditEvents),
    questionnaireTemplates: new TenantRepository("questionnaire_templates", new SupabaseRestAdapter<QuestionnaireTemplateRecord>(config), auditEvents),
    questionnaireSubmissions: new TenantRepository("questionnaire_submissions", new SupabaseRestAdapter<QuestionnaireSubmissionRecord>(config), auditEvents),
    questionnaireAnswers: new TenantRepository("questionnaire_answers", new SupabaseRestAdapter<QuestionnaireAnswerRecord>(config), auditEvents),
    trustAccessLogs: new TenantRepository("trust_access_logs", new SupabaseRestAdapter<TrustAccessLogRecord>(config), auditEvents),
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
    frameworkDomains: new TenantRepository("framework_domains", new InMemoryDatabaseAdapter<FrameworkDomainRecord>(), auditEvents),
    frameworkControls: new TenantRepository("framework_controls", new InMemoryDatabaseAdapter<FrameworkControlRecord>(), auditEvents),
    frameworkRequirements: new TenantRepository("framework_requirements", new InMemoryDatabaseAdapter<FrameworkRequirementRecord>(), auditEvents),
    frameworkMappings: new TenantRepository("framework_mappings", new InMemoryDatabaseAdapter<FrameworkMappingRecord>(), auditEvents),
    frameworkCrosswalks: new TenantRepository("framework_crosswalks", new InMemoryDatabaseAdapter<FrameworkCrosswalkRecord>(), auditEvents),
    assets: new TenantRepository("assets", new InMemoryDatabaseAdapter<AssetRecord>(), auditEvents),
    risks: new TenantRepository("risks", new InMemoryDatabaseAdapter<RiskRecord>(), auditEvents),
    riskAssessments: new TenantRepository("risk_assessments", new InMemoryDatabaseAdapter<RiskAssessmentRecord>(), auditEvents),
    evidence: new TenantRepository("evidence", new InMemoryDatabaseAdapter<EvidenceRecord>(), auditEvents),
    controlEvidence: new TenantRepository("control_evidence", new InMemoryDatabaseAdapter<ControlEvidenceRecord>(), auditEvents),
    evidenceReviews: new TenantRepository("evidence_reviews", new InMemoryDatabaseAdapter<EvidenceReviewRecord>(), auditEvents),
    tasks: new TenantRepository("tasks", new InMemoryDatabaseAdapter<TaskRecord>(), auditEvents),
    audits: new TenantRepository("audits", new InMemoryDatabaseAdapter<AuditRecord>(), auditEvents),
    assessments: new TenantRepository("assessments", new InMemoryDatabaseAdapter<AssessmentRecord>(), auditEvents),
    learningPaths: new TenantRepository("learning_paths", new InMemoryDatabaseAdapter<LearningPathRecord>(), auditEvents),
    learningModules: new TenantRepository("learning_modules", new InMemoryDatabaseAdapter<LearningModuleRecord>(), auditEvents),
    learningAssessments: new TenantRepository("learning_assessments", new InMemoryDatabaseAdapter<LearningAssessmentRecord>(), auditEvents),
    learningAssessmentQuestions: new TenantRepository("learning_assessment_questions", new InMemoryDatabaseAdapter<LearningAssessmentQuestionRecord>(), auditEvents),
    learningAssessmentResults: new TenantRepository("learning_assessment_results", new InMemoryDatabaseAdapter<LearningAssessmentResultRecord>(), auditEvents),
    userProgress: new TenantRepository("user_progress", new InMemoryDatabaseAdapter<UserProgressRecord>(), auditEvents),
    studentTwins: new TenantRepository("student_twins", new InMemoryDatabaseAdapter<StudentTwinRecord>(), auditEvents),
    scenarios: new TenantRepository("scenarios", new InMemoryDatabaseAdapter<ScenarioRecord>(), auditEvents),
    scenarioRuns: new TenantRepository("scenario_runs", new InMemoryDatabaseAdapter<ScenarioRunRecord>(), auditEvents),
    labTasks: new TenantRepository("lab_tasks", new InMemoryDatabaseAdapter<LabTaskRecord>(), auditEvents),
    labTaskSubmissions: new TenantRepository("lab_task_submissions", new InMemoryDatabaseAdapter<LabTaskSubmissionRecord>(), auditEvents),
    labArtifacts: new TenantRepository("lab_artifacts", new InMemoryDatabaseAdapter<LabArtifactRecord>(), auditEvents),
    vendors: new TenantRepository("vendors", new InMemoryDatabaseAdapter<VendorRecord>(), auditEvents),
    vendorAssessments: new TenantRepository("vendor_assessments", new InMemoryDatabaseAdapter<VendorAssessmentRecord>(), auditEvents),
    vendorFindings: new TenantRepository("vendor_findings", new InMemoryDatabaseAdapter<VendorFindingRecord>(), auditEvents),
    governanceScores: new TenantRepository("governance_scores", new InMemoryDatabaseAdapter<GovernanceScoreRecord>(), auditEvents),
    recommendations: new TenantRepository("recommendations", new InMemoryDatabaseAdapter<RecommendationRecord>(), auditEvents),
    coachConversations: new TenantRepository("coach_conversations", new InMemoryDatabaseAdapter<CoachConversationRecord>(), auditEvents),
    coachMessages: new TenantRepository("coach_messages", new InMemoryDatabaseAdapter<CoachMessageRecord>(), auditEvents),
    capstoneProjects: new TenantRepository("capstone_projects", new InMemoryDatabaseAdapter<CapstoneProjectRecord>(), auditEvents),
    learnerPortfolios: new TenantRepository("learner_portfolios", new InMemoryDatabaseAdapter<LearnerPortfolioRecord>(), auditEvents),
    certificationAwards: new TenantRepository("certification_awards", new InMemoryDatabaseAdapter<CertificationAwardRecord>(), auditEvents),
    trustCenterProfiles: new TenantRepository("trust_center_profiles", new InMemoryDatabaseAdapter<TrustCenterProfileRecord>(), auditEvents),
    trustDocuments: new TenantRepository("trust_documents", new InMemoryDatabaseAdapter<TrustDocumentRecord>(), auditEvents),
    trustRequests: new TenantRepository("trust_requests", new InMemoryDatabaseAdapter<TrustRequestRecord>(), auditEvents),
    questionnaireTemplates: new TenantRepository("questionnaire_templates", new InMemoryDatabaseAdapter<QuestionnaireTemplateRecord>(), auditEvents),
    questionnaireSubmissions: new TenantRepository("questionnaire_submissions", new InMemoryDatabaseAdapter<QuestionnaireSubmissionRecord>(), auditEvents),
    questionnaireAnswers: new TenantRepository("questionnaire_answers", new InMemoryDatabaseAdapter<QuestionnaireAnswerRecord>(), auditEvents),
    trustAccessLogs: new TenantRepository("trust_access_logs", new InMemoryDatabaseAdapter<TrustAccessLogRecord>(), auditEvents),
  };
}
