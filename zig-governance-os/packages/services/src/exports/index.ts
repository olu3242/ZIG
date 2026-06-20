import { ExportPipeline, LIVE_EXPORT_TYPES, toCsv, type ExportManifest, type ExportRequest, type ExportType } from "@zig/exports";
import type { AuditRecord, ControlRecord, EvidenceRecord, RiskRecord, TenantContext, TenantRepository, VendorRecord } from "@zig/data-access";

export interface GeneratedExport {
  manifest: ExportManifest;
  filename: string;
  contentType: string;
  content: string;
}

// CSV generation is real and live-data-backed for the five entity types most central to
// the Universal Governance Model (controls, risks, evidence, vendors, audits) - the rest
// of ExportType remain catalog-only until a future pass wires them up; see
// docs/certification/DASHBOARD_REPORTING_CONVERGENCE_CERTIFICATION.md for the honest list.
export class ExportsService {
  private readonly pipeline = new ExportPipeline();

  constructor(
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly riskRepository: TenantRepository<RiskRecord>,
    private readonly evidenceRepository: TenantRepository<EvidenceRecord>,
    private readonly vendorRepository: TenantRepository<VendorRecord>,
    private readonly auditRepository: TenantRepository<AuditRecord>,
  ) {}

  createManifest(request: ExportRequest) {
    return this.pipeline.createManifest(request);
  }

  isLive(type: ExportType): boolean {
    return LIVE_EXPORT_TYPES.includes(type);
  }

  async generateExport(context: TenantContext, type: ExportType): Promise<GeneratedExport> {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to generate an export.");
    }
    if (!this.isLive(type)) {
      throw new Error(`Export type "${type}" is cataloged but not yet wired to a live data source.`);
    }

    const manifest = this.pipeline.createManifest({
      tenantId: context.tenantId,
      requestedByUserId: context.actorUserId,
      type,
      format: "csv",
    });

    const rows = await this.rowsFor(context, type);
    return {
      manifest,
      filename: `${type}_${manifest.id}.csv`,
      contentType: "text/csv",
      content: toCsv(rows as unknown as Array<Record<string, unknown>>),
    };
  }

  private async rowsFor(context: TenantContext, type: ExportType) {
    switch (type) {
      case "controls":
        return this.controlRepository.findMany(context);
      case "risks":
        return this.riskRepository.findMany(context);
      case "evidence":
        return this.evidenceRepository.findMany(context);
      case "vendors":
        return this.vendorRepository.findMany(context);
      case "audits":
        return this.auditRepository.findMany(context);
      default:
        throw new Error(`Export type "${type}" has no live row source.`);
    }
  }
}
