import type { ZigRepositories } from "@zig/data-access";
import { AssetService } from "./AssetService";
import { ControlService } from "./ControlService";
import { EvidenceService } from "./EvidenceService";
import { FrameworkService } from "./FrameworkService";
import { GovernanceService } from "./GovernanceService";
import { LearningService } from "./LearningService";
import { ProjectService } from "./ProjectService";
import { RiskService } from "./RiskService";
import { ScenarioService } from "./ScenarioService";

export interface ZigServices {
  frameworks: FrameworkService;
  projects: ProjectService;
  assets: AssetService;
  risks: RiskService;
  controls: ControlService;
  evidence: EvidenceService;
  learning: LearningService;
  scenarios: ScenarioService;
  governance: GovernanceService;
}

export function createServices(repositories: ZigRepositories): ZigServices {
  return {
    frameworks: new FrameworkService(repositories.frameworks),
    projects: new ProjectService(repositories.projects),
    assets: new AssetService(repositories.assets),
    risks: new RiskService(repositories.risks, repositories.riskAssessments),
    controls: new ControlService(repositories.controls, repositories.controlMappings),
    evidence: new EvidenceService(repositories.evidence),
    learning: new LearningService(repositories.learningPaths, repositories.learningModules),
    scenarios: new ScenarioService(repositories.scenarios, repositories.scenarioRuns),
    governance: new GovernanceService(repositories.governanceScores, repositories.recommendations),
  };
}
