export type ImportType = "projects" | "frameworks" | "controls" | "risks" | "issues" | "vendors" | "evidence" | "users" | "assets" | "policies" | "tasks" | "audits";
export type ImportStage = "upload" | "validate" | "preview" | "map_columns" | "transform" | "import" | "verify" | "audit";

export interface ImportValidationRule {
  field: string;
  required: boolean;
  dataType: "string" | "number" | "date" | "email" | "uuid";
}

export interface ImportPreview {
  importType: ImportType;
  rows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
}

export const importStages: ImportStage[] = ["upload", "validate", "preview", "map_columns", "transform", "import", "verify", "audit"];

export class ImportPipeline {
  preview(importType: ImportType, rows: Array<Record<string, unknown>>, rules: ImportValidationRule[]): ImportPreview {
    const errors: string[] = [];
    let validRows = 0;

    rows.forEach((row, index) => {
      const rowErrors = rules.flatMap((rule) => validateRule(rule, row));
      if (rowErrors.length === 0) {
        validRows += 1;
      } else {
        errors.push(...rowErrors.map((error) => `Row ${index + 1}: ${error}`));
      }
    });

    return { importType, rows: rows.length, validRows, invalidRows: rows.length - validRows, errors };
  }
}

function validateRule(rule: ImportValidationRule, row: Record<string, unknown>): string[] {
  const value = row[rule.field];
  if (rule.required && (value === undefined || value === null || value === "")) {
    return [`${rule.field} is required`];
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (rule.dataType === "number" && Number.isNaN(Number(value))) return [`${rule.field} must be a number`];
  if (rule.dataType === "email" && !String(value).includes("@")) return [`${rule.field} must be an email`];
  if (rule.dataType === "uuid" && !/^[0-9a-f-]{36}$/i.test(String(value))) return [`${rule.field} must be a uuid`];
  return [];
}
