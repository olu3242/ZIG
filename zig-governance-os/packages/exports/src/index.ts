export type ExportType = "projects" | "frameworks" | "controls" | "risks" | "issues" | "tasks" | "audits" | "evidence" | "vendors" | "users" | "assets" | "policies" | "compliance_status" | "executive_metrics";
export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";
export type ExportStage = "request" | "authorize" | "generate" | "audit" | "download" | "archive";

export interface ExportRequest {
  tenantId: string;
  requestedByUserId: string;
  type: ExportType;
  format: ExportFormat;
}

export interface ExportManifest {
  id: string;
  tenantId: string;
  requestedByUserId: string;
  type: ExportType;
  format: ExportFormat;
  stages: ExportStage[];
  auditRequired: true;
}

export class ExportPipeline {
  createManifest(request: ExportRequest): ExportManifest {
    if (!request.tenantId || !request.requestedByUserId) {
      throw new Error("tenantId and requestedByUserId are required for exports.");
    }

    return {
      id: crypto.randomUUID(),
      tenantId: request.tenantId,
      requestedByUserId: request.requestedByUserId,
      type: request.type,
      format: request.format,
      stages: ["request", "authorize", "generate", "audit", "download", "archive"],
      auditRequired: true,
    };
  }
}
