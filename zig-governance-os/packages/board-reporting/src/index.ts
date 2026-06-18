export type BoardReportType = "board_risk" | "compliance" | "audit" | "vendor_risk" | "certification" | "executive_summary";
export type BoardReportOutput = "pdf" | "powerpoint" | "excel" | "dashboard";

export interface BoardReportManifest {
  type: BoardReportType;
  outputs: BoardReportOutput[];
  requiresApproval: true;
}

export class BoardReportingEngine {
  manifest(type: BoardReportType, outputs: BoardReportOutput[]): BoardReportManifest {
    return { type, outputs, requiresApproval: true };
  }
}
