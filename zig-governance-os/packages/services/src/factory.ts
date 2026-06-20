import type { ZigRepositories } from "@zig/data-access";
import { AuditService } from "./AuditService";
import { AssessmentService } from "./AssessmentService";
import { AssetService } from "./AssetService";
import { CertificationAwardService } from "./CertificationAwardService";
import { CertificationEligibilityService } from "./CertificationEligibilityService";
import { CertificationProgressService } from "./CertificationProgressService";
import { CoachService } from "./CoachService";
import { ComplianceStatusService } from "./ComplianceStatusService";
import { CompetencyService } from "./CompetencyService";
import { ControlService } from "./ControlService";
import { EvidenceReuseService } from "./EvidenceReuseService";
import { EvidenceService } from "./EvidenceService";
import { ExportsService } from "./exports";
import { FrameworkCoverageService } from "./FrameworkCoverageService";
import { FrameworkGapService } from "./FrameworkGapService";
import { FrameworkMappingService } from "./FrameworkMappingService";
import { FrameworkRoadmapService } from "./FrameworkRoadmapService";
import { FrameworkService } from "./FrameworkService";
import { GovernanceService } from "./GovernanceService";
import { LearningImportService } from "./LearningImportService";
import { LearningService } from "./LearningService";
import { PortfolioService } from "./PortfolioService";
import { PortfolioArtifactService } from "./PortfolioArtifactService";
import { ProjectService } from "./ProjectService";
import { QuestionnaireService } from "./QuestionnaireService";
import { RiskService } from "./RiskService";
import { ScenarioAttemptService } from "./ScenarioAttemptService";
import { ScenarioService } from "./ScenarioService";
import { TenantService } from "./TenantService";
import { TrustAnalyticsService } from "./TrustAnalyticsService";
import { TrustCenterService } from "./TrustCenterService";
import { TrustDocumentService } from "./TrustDocumentService";
import { TrustRequestService } from "./TrustRequestService";
import { UserService } from "./UserService";

export interface ZigServices {
  tenants: TenantService;
  users: UserService;
  audit: AuditService;
  frameworks: FrameworkService;
  projects: ProjectService;
  assets: AssetService;
  risks: RiskService;
  controls: ControlService;
  evidence: EvidenceService;
  learning: LearningService;
  assessments: AssessmentService;
  scenarios: ScenarioService;
  portfolio: PortfolioService;
  certificationEligibility: CertificationEligibilityService;
  certificationProgress: CertificationProgressService;
  certificationAwards: CertificationAwardService;
  governance: GovernanceService;
  coach: CoachService;
  exports: ExportsService;
  frameworkCoverage: FrameworkCoverageService;
  frameworkGaps: FrameworkGapService;
  frameworkMappings: FrameworkMappingService;
  frameworkRoadmaps: FrameworkRoadmapService;
  evidenceReuse: EvidenceReuseService;
  trustCenter: TrustCenterService;
  complianceStatus: ComplianceStatusService;
  trustDocuments: TrustDocumentService;
  trustRequests: TrustRequestService;
  questionnaires: QuestionnaireService;
  trustAnalytics: TrustAnalyticsService;
  competencies: CompetencyService;
  scenarioAttempts: ScenarioAttemptService;
  portfolioArtifacts: PortfolioArtifactService;
  learningImport: LearningImportService;
}

export function createServices(repositories: ZigRepositories): ZigServices {
  const projects = new ProjectService(repositories.projects, repositories.projectFrameworks);
  const assets = new AssetService(repositories.assets);
  const risks = new RiskService(
    repositories.risks,
    repositories.riskAssessments,
    repositories.vendors,
    repositories.vendorAssessments,
    repositories.vendorFindings,
  );
  const controls = new ControlService(repositories.controls, repositories.controlMappings);
  const evidence = new EvidenceService(
    repositories.evidence,
    repositories.controlEvidence,
    repositories.evidenceReviews,
    repositories.controls,
  );
  const audit = new AuditService(repositories.auditEvents);
  const scenarios = new ScenarioService(
    repositories.scenarios,
    repositories.scenarioRuns,
    repositories.labTasks,
    repositories.labTaskSubmissions,
    repositories.labArtifacts,
    repositories.studentTwins,
  );
  const governance = new GovernanceService(
    repositories.governanceScores,
    repositories.recommendations,
    repositories.controls,
    repositories.risks,
    repositories.riskAssessments,
    repositories.evidence,
    repositories.evidenceReviews,
    repositories.projectFrameworks,
    repositories.vendors,
    repositories.vendorAssessments,
  );

  return {
    tenants: new TenantService(repositories.tenants, repositories.users),
    users: new UserService(repositories.users),
    audit,
    frameworks: new FrameworkService(repositories.frameworks),
    projects,
    assets,
    risks,
    controls,
    evidence,
    learning: new LearningService(
      repositories.learningPaths,
      repositories.learningModules,
      repositories.userProgress,
      repositories.studentTwins,
    ),
    assessments: new AssessmentService(
      repositories.learningAssessments,
      repositories.learningAssessmentQuestions,
      repositories.learningAssessmentResults,
      repositories.studentTwins,
    ),
    scenarios,
    portfolio: new PortfolioService(
      repositories.learnerPortfolios,
      repositories.userProgress,
      repositories.learningModules,
      repositories.learningAssessmentResults,
      repositories.labArtifacts,
      repositories.capstoneProjects,
      repositories.studentTwins,
    ),
    certificationEligibility: new CertificationEligibilityService(
      repositories.studentTwins,
      repositories.userProgress,
      repositories.learningModules,
      repositories.capstoneProjects,
    ),
    certificationProgress: new CertificationProgressService(
      repositories.studentTwins,
      repositories.userProgress,
      repositories.learningModules,
      repositories.capstoneProjects,
    ),
    certificationAwards: new CertificationAwardService(
      repositories.certificationAwards,
      repositories.studentTwins,
      repositories.userProgress,
      repositories.learningModules,
      repositories.capstoneProjects,
    ),
    governance,
    coach: new CoachService(
      repositories.coachConversations,
      repositories.coachMessages,
      repositories.risks,
      repositories.controls,
      repositories.studentTwins,
      repositories.frameworkControls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
      repositories.trustDocuments,
      repositories.learnerPortfolios,
    ),
    exports: new ExportsService(
      repositories.controls,
      repositories.risks,
      repositories.evidence,
      repositories.vendors,
      repositories.audits,
      repositories.frameworks,
      repositories.frameworkControls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
      repositories.questionnaireSubmissions,
      repositories.questionnaireAnswers,
    ),
    frameworkCoverage: new FrameworkCoverageService(
      repositories.frameworkControls,
      repositories.controls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
    ),
    frameworkGaps: new FrameworkGapService(
      repositories.frameworkControls,
      repositories.controls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
    ),
    frameworkMappings: new FrameworkMappingService(
      repositories.frameworkMappings,
      repositories.frameworkControls,
    ),
    frameworkRoadmaps: new FrameworkRoadmapService(
      repositories.frameworkControls,
      repositories.frameworkMappings,
      repositories.controls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
    ),
    evidenceReuse: new EvidenceReuseService(
      repositories.controlEvidence,
      repositories.controls,
      repositories.frameworkControls,
      repositories.frameworkMappings,
    ),
    trustCenter: new TrustCenterService(repositories.trustCenterProfiles),
    complianceStatus: new ComplianceStatusService(
      repositories.frameworks,
      repositories.frameworkControls,
      repositories.controls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
    ),
    trustDocuments: new TrustDocumentService(repositories.trustDocuments),
    trustRequests: new TrustRequestService(repositories.trustRequests),
    questionnaires: new QuestionnaireService(
      repositories.questionnaireTemplates,
      repositories.questionnaireSubmissions,
      repositories.questionnaireAnswers,
      repositories.frameworks,
      repositories.frameworkControls,
      repositories.controls,
      repositories.controlEvidence,
      repositories.evidenceReviews,
      repositories.evidence,
      repositories.vendors,
      repositories.vendorAssessments,
      repositories.governanceScores,
    ),
    trustAnalytics: new TrustAnalyticsService(repositories.trustAccessLogs),
    competencies: new CompetencyService(
      repositories.competencies,
      repositories.userCompetencies,
      repositories.competencyAssessments,
    ),
    scenarioAttempts: new ScenarioAttemptService(
      repositories.scenarioAttempts,
      repositories.scenarioDecisions,
      repositories.scenarioOutcomes,
      repositories.scenarioRuns,
      repositories.scenarioTemplates,
      scenarios,
      governance,
    ),
    portfolioArtifacts: new PortfolioArtifactService(
      repositories.portfolioArtifacts,
      repositories.artifactVersions,
      repositories.artifactTemplates,
      risks,
      controls,
      assets,
      evidence,
      audit,
      governance,
    ),
    learningImport: new LearningImportService(
      assets,
      risks,
      controls,
      evidence,
      repositories.simulatedCompanyObjects,
      projects,
    ),
  };
}
