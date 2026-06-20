import type {
  AssetRecord,
  ControlRecord,
  EvidenceRecord,
  RiskRecord,
  SimulatedCompanyObjectRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";
import type { AssetService } from "./AssetService";
import type { ControlService } from "./ControlService";
import type { EvidenceService } from "./EvidenceService";
import type { ProjectService } from "./ProjectService";
import type { RiskService } from "./RiskService";

export type ImportableObjectType = "asset" | "control" | "risk" | "evidence";

export interface ImportPreviewItem {
  sourceObjectId: string;
  objectType: ImportableObjectType;
  scenarioId: string;
  scenarioName: string;
  preview: Record<string, unknown>;
  blockedReason?: string;
}

export interface ImportConfirmation {
  sourceObjectId: string;
  confirmed: boolean;
}

/**
 * Implements the import flow specced in docs/architecture/learning-operational-bridge.md.
 * Never invoked automatically — only from an explicit learner action on a completed
 * ScenarioRun. Per that doc's Safeguard 6, clearing a record for Executive Reporting/Audit
 * is a separate action (confirmOperational) from the import itself.
 */
export class LearningImportService {
  constructor(
    private readonly assetService: AssetService,
    private readonly riskService: RiskService,
    private readonly controlService: ControlService,
    private readonly evidenceService: EvidenceService,
    private readonly scenarioObjectRepository: TenantRepository<SimulatedCompanyObjectRecord>,
    private readonly projectService: ProjectService,
  ) {}

  /**
   * Defense in depth per learning-operational-bridge.md §4: even though TenantRepository
   * scopes all reads/writes to context.tenantId, explicitly confirm the destination project
   * itself belongs to that tenant before any preview/import touches it.
   */
  private async assertDestinationProjectInTenant(context: TenantContext, destinationProjectId: string): Promise<void> {
    const project = await this.projectService.findById(context, destinationProjectId);
    if (!project || project.tenantId !== context.tenantId) {
      throw new Error(`destination project ${destinationProjectId} is not in the requesting tenant`);
    }
  }

  async previewImport(
    context: TenantContext,
    scenarioRunId: string,
    destinationProjectId: string,
  ): Promise<ImportPreviewItem[]> {
    await this.assertDestinationProjectInTenant(context, destinationProjectId);
    const objects = await this.scenarioObjectRepository.findMany(context);
    const importedAssetNames = new Set(
      (await this.assetService.findMany(context))
        .filter((a) => a.projectId === destinationProjectId)
        .map((a) => a.name),
    );
    const importedControlTitles = new Set(
      (await this.controlService.findMany(context))
        .filter((c) => c.projectId === destinationProjectId)
        .map((c) => c.title),
    );

    return objects.map((obj) => {
      const objectType = obj.objectType as ImportableObjectType;
      let blockedReason: string | undefined;

      if (objectType === "risk" && !importedAssetNames.has((obj.payload as { assetName?: string }).assetName ?? "")) {
        blockedReason = "asset not yet imported";
      }
      if (objectType === "evidence" && !importedControlTitles.has((obj.payload as { controlTitle?: string }).controlTitle ?? "")) {
        blockedReason = "control not yet imported";
      }

      return {
        sourceObjectId: obj.id,
        objectType,
        scenarioId: scenarioRunId,
        scenarioName: obj.simulatedCompanyId,
        preview: { name: obj.name, ...obj.payload },
        blockedReason,
      };
    });
  }

  async confirmImport(
    context: TenantContext,
    scenarioRunId: string,
    destinationProjectId: string,
    confirmations: ImportConfirmation[],
  ): Promise<{
    assets: AssetRecord[];
    risks: RiskRecord[];
    controls: ControlRecord[];
    evidence: EvidenceRecord[];
  }> {
    await this.assertDestinationProjectInTenant(context, destinationProjectId);
    const confirmedIds = new Set(confirmations.filter((c) => c.confirmed).map((c) => c.sourceObjectId));
    const objects = (await this.scenarioObjectRepository.findMany(context)).filter((o) => confirmedIds.has(o.id));

    const assets: AssetRecord[] = [];
    const risks: RiskRecord[] = [];
    const controls: ControlRecord[] = [];
    const evidence: EvidenceRecord[] = [];

    const importedAt = new Date();
    const importedByUserId = context.actorUserId;

    for (const obj of objects) {
      const payload = obj.payload as Record<string, unknown>;

      if (obj.objectType === "asset") {
        const category = payload.category as string | undefined;
        const criticality = payload.criticality as AssetRecord["criticality"] | undefined;
        if (!category || !criticality) {
          continue;
        }
        assets.push(
          await this.assetService.create(context, {
            id: crypto.randomUUID(),
            projectId: destinationProjectId,
            name: obj.name,
            category,
            criticality,
            sourceType: "learning_import",
            importedFromScenarioId: scenarioRunId,
            importedFromObjectId: obj.id,
            importedByUserId,
            importedAt,
          }),
        );
      }

      if (obj.objectType === "control") {
        controls.push(
          await this.controlService.create(context, {
            id: crypto.randomUUID(),
            projectId: destinationProjectId,
            frameworkId: (payload.frameworkId as string) ?? "",
            controlId: crypto.randomUUID(),
            title: obj.name,
            description: (payload.description as string) ?? "",
            status: (obj.status as ControlRecord["status"]) ?? "planned",
            sourceType: "learning_import",
            importedFromScenarioId: scenarioRunId,
            importedFromObjectId: obj.id,
            importedByUserId,
            importedAt,
          }),
        );
      }

      if (obj.objectType === "risk") {
        const assetId = assets.find((a) => a.name === (payload.assetName as string))?.id;
        if (!assetId) {
          continue;
        }
        risks.push(
          await this.riskService.create(context, {
            id: crypto.randomUUID(),
            projectId: destinationProjectId,
            assetId,
            title: obj.name,
            description: (payload.description as string) ?? "",
            severity: (payload.severity as RiskRecord["severity"]) ?? "medium",
            treatment: (payload.treatment as RiskRecord["treatment"]) ?? "mitigate",
            sourceType: "learning_import",
            importedFromScenarioId: scenarioRunId,
            importedFromObjectId: obj.id,
            importedByUserId,
            importedAt,
          }),
        );
      }

      if (obj.objectType === "evidence") {
        const controlId = controls.find((c) => c.title === (payload.controlTitle as string))?.id;
        if (!controlId) {
          continue;
        }
        evidence.push(
          await this.evidenceService.create(context, {
            id: crypto.randomUUID(),
            projectId: destinationProjectId,
            controlId,
            title: obj.name,
            status: "submitted",
            sourceType: "learning_import",
            importedFromScenarioId: scenarioRunId,
            importedFromObjectId: obj.id,
            importedByUserId,
            importedAt,
          }),
        );
      }
    }

    return { assets, risks, controls, evidence };
  }

  /**
   * Clears a record's provenance-based exclusion from Executive Reporting/Audit export.
   * Does not change sourceType — the import fact is permanent. Caller is responsible for
   * checking the actor has edit rights on the destination project (role check is out of
   * scope for this service per the design doc's open question).
   */
  async confirmOperational(
    context: TenantContext,
    recordType: ImportableObjectType,
    recordId: string,
  ): Promise<void> {
    const patch = { reportingCleared: true as const };
    if (recordType === "asset") {
      await this.assetService.update(context, recordId, patch);
    } else if (recordType === "risk") {
      await this.riskService.update(context, recordId, patch);
    } else if (recordType === "control") {
      await this.controlService.update(context, recordId, patch);
    } else if (recordType === "evidence") {
      await this.evidenceService.update(context, recordId, patch);
    }
  }
}
