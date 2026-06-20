export type ExportType = "projects" | "frameworks" | "controls" | "risks" | "issues" | "tasks" | "audits" | "evidence" | "vendors" | "users" | "assets" | "policies" | "compliance_status" | "executive_metrics";
export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";
export type ExportStage = "request" | "authorize" | "generate" | "audit" | "download" | "archive";

export const LIVE_EXPORT_TYPES: ExportType[] = ["controls", "risks", "evidence", "vendors", "audits"];

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

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }

  const columns = Object.keys(rows[0]);
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => escape(row[column])).join(","));
  }
  return lines.join("\n");
}
