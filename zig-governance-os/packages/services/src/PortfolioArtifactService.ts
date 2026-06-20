import { BaseService } from "./BaseService";
import type { AssetService } from "./AssetService";
import type { AuditService } from "./AuditService";
import type { ControlService } from "./ControlService";
import type { EvidenceService } from "./EvidenceService";
import type { GovernanceService } from "./GovernanceService";
import type { RiskService } from "./RiskService";
import type {
  ArtifactTemplateRecord,
  ArtifactVersionRecord,
  PortfolioArtifactRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export class PortfolioArtifactService extends BaseService<PortfolioArtifactRecord> {
  constructor(
    portfolioArtifactRepository: TenantRepository<PortfolioArtifactRecord>,
    private readonly versionRepository: TenantRepository<ArtifactVersionRecord>,
    private readonly templateRepository: TenantRepository<ArtifactTemplateRecord>,
    private readonly riskService: RiskService,
    private readonly controlService: ControlService,
    private readonly assetService: AssetService,
    private readonly evidenceService: EvidenceService,
    private readonly auditService: AuditService,
    private readonly governanceService: GovernanceService,
  ) {
    super(portfolioArtifactRepository);
  }

  /**
   * Per-artifact-type content read delegates to LEARNING_RUNTIME_ARTIFACT_BUILDER.md's
   * mapping table — this method assembles the typed content object, not the persistence.
   */
  private async buildContent(
    context: TenantContext,
    projectId: string,
    artifactType: PortfolioArtifactRecord["artifactType"],
  ): Promise<{ content: Record<string, unknown>; recordCounts: Record<string, number> }> {
    switch (artifactType) {
      case "riskRegister": {
        const risks = (await this.riskService.findMany(context)).filter((r) => r.projectId === projectId);
        return { content: { risks }, recordCounts: { risks: risks.length } };
      }
      case "assetRegister": {
        const assets = (await this.assetService.findMany(context)).filter((a) => a.projectId === projectId);
        return { content: { assets }, recordCounts: { assets: assets.length } };
      }
      case "controlMatrix": {
        const controls = (await this.controlService.findMany(context)).filter((c) => c.projectId === projectId);
        return { content: { controls }, recordCounts: { controls: controls.length } };
      }
      case "vendorAssessment": {
        const vendors = (await this.assetService.findMany(context)).filter(
          (a) => a.projectId === projectId && a.category === "vendor",
        );
        return { content: { vendors }, recordCounts: { vendors: vendors.length } };
      }
      case "boardReport": {
        const scores = (await this.governanceService.findMany(context)).filter((s) => s.projectId === projectId);
        return { content: { governanceScores: scores }, recordCounts: { governanceScores: scores.length } };
      }
      case "auditPlan":
      case "bia":
        return { content: {}, recordCounts: {} };
      default:
        return { content: {}, recordCounts: {} };
    }
  }

  async createFromProject(
    context: TenantContext,
    params: {
      learnerId: string;
      projectId: string;
      scenarioRunId?: string;
      artifactType: PortfolioArtifactRecord["artifactType"];
      exportFormat: PortfolioArtifactRecord["exportFormat"];
      templateId?: string;
    },
  ): Promise<{ artifact: PortfolioArtifactRecord; version: ArtifactVersionRecord }> {
    const { content, recordCounts } = await this.buildContent(context, params.projectId, params.artifactType);

    const version = await this.versionRepository.create(context, {
      id: crypto.randomUUID(),
      portfolioArtifactId: "",
      versionNumber: 1,
      content,
      sourceSnapshot: { projectId: params.projectId, capturedAt: new Date(), recordCounts },
      generationReason: "initial",
      exportFormat: params.exportFormat,
      createdByUserId: params.learnerId,
    });

    const artifact = await this.repository.create(context, {
      id: crypto.randomUUID(),
      learnerId: params.learnerId,
      projectId: params.projectId,
      scenarioRunId: params.scenarioRunId,
      artifactType: params.artifactType,
      templateId: params.templateId,
      currentVersionId: version.id,
      exportFormat: params.exportFormat,
      status: "generated",
      title: `${params.artifactType} — ${params.projectId}`,
    });

    await this.versionRepository.update(context, version.id, { portfolioArtifactId: artifact.id });

    return { artifact, version: { ...version, portfolioArtifactId: artifact.id } };
  }

  async listForLearner(
    context: TenantContext,
    learnerId: string,
    filters?: { projectId?: string; artifactType?: PortfolioArtifactRecord["artifactType"] },
  ): Promise<PortfolioArtifactRecord[]> {
    const rows = await this.repository.findMany(context, { filters: { learnerId } });
    return rows.filter(
      (row) =>
        (!filters?.projectId || row.projectId === filters.projectId) &&
        (!filters?.artifactType || row.artifactType === filters.artifactType),
    );
  }

  listVersions(context: TenantContext, portfolioArtifactId: string): Promise<ArtifactVersionRecord[]> {
    return this.versionRepository.findMany(context, { filters: { portfolioArtifactId } });
  }

  async createNewVersion(
    context: TenantContext,
    portfolioArtifactId: string,
    params: {
      generationReason: ArtifactVersionRecord["generationReason"];
      feedbackNoteRef?: string;
      createdByUserId?: string;
    },
  ): Promise<ArtifactVersionRecord> {
    const artifact = await this.repository.findById(context, portfolioArtifactId);
    if (!artifact) {
      throw new Error(`portfolio artifact ${portfolioArtifactId} not found`);
    }

    const existingVersions = await this.listVersions(context, portfolioArtifactId);
    const nextVersionNumber = Math.max(0, ...existingVersions.map((v) => v.versionNumber)) + 1;
    const { content, recordCounts } = await this.buildContent(context, artifact.projectId, artifact.artifactType);

    const version = await this.versionRepository.create(context, {
      id: crypto.randomUUID(),
      portfolioArtifactId,
      versionNumber: nextVersionNumber,
      content,
      sourceSnapshot: { projectId: artifact.projectId, capturedAt: new Date(), recordCounts },
      generationReason: params.generationReason,
      feedbackNoteRef: params.feedbackNoteRef,
      exportFormat: artifact.exportFormat,
      createdByUserId: params.createdByUserId,
    });

    await this.repository.update(context, portfolioArtifactId, { currentVersionId: version.id, status: "generated" });

    return version;
  }

  async setCurrentVersion(
    context: TenantContext,
    portfolioArtifactId: string,
    versionId: string,
  ): Promise<PortfolioArtifactRecord | null> {
    return this.repository.update(context, portfolioArtifactId, { currentVersionId: versionId });
  }

  async resolveTemplate(
    context: TenantContext,
    artifactType: PortfolioArtifactRecord["artifactType"],
    templateId?: string,
  ): Promise<ArtifactTemplateRecord | null> {
    if (templateId) {
      return this.templateRepository.findById(context, templateId);
    }

    const templates = await this.templateRepository.findMany(context, { filters: { artifactType } });
    return templates.find((t) => t.isDefault) ?? templates[0] ?? null;
  }
}
