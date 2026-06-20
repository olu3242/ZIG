import type { ZigRepositories } from "@zig/data-access";
import { AuditService } from "./AuditService";
import { AssetService } from "./AssetService";
import { CompetencyService } from "./CompetencyService";
import { ControlService } from "./ControlService";
import { EvidenceService } from "./EvidenceService";
import { FrameworkService } from "./FrameworkService";
import { GovernanceService } from "./GovernanceService";
import { LearningImportService } from "./LearningImportService";
import { LearningService } from "./LearningService";
import { PortfolioArtifactService } from "./PortfolioArtifactService";
import { ProjectService } from "./ProjectService";
import { RiskService } from "./RiskService";
import { ScenarioAttemptService } from "./ScenarioAttemptService";
import { ScenarioService } from "./ScenarioService";
import { TenantService } from "./TenantService";
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
  scenarios: ScenarioService;
  governance: GovernanceService;
  competencies: CompetencyService;
  scenarioAttempts: ScenarioAttemptService;
  portfolioArtifacts: PortfolioArtifactService;
  learningImport: LearningImportService;
}

export function createServices(repositories: ZigRepositories): ZigServices {
  const projects = new ProjectService(repositories.projects, repositories.projectFrameworks);
  const assets = new AssetService(repositories.assets);
  const risks = new RiskService(repositories.risks, repositories.riskAssessments);
  const controls = new ControlService(repositories.controls, repositories.controlMappings);
  const evidence = new EvidenceService(repositories.evidence);
  const audit = new AuditService(repositories.auditEvents);
  const scenarios = new ScenarioService(repositories.scenarios, repositories.scenarioRuns);
  const governance = new GovernanceService(repositories.governanceScores, repositories.recommendations);

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
    learning: new LearningService(repositories.learningPaths, repositories.learningModules),
    scenarios,
    governance,
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
