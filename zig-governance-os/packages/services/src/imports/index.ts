import { ImportPipeline, type ImportType, type ImportValidationRule } from "@zig/imports";

export class ImportsService {
  private readonly pipeline = new ImportPipeline();

  preview(importType: ImportType, rows: Array<Record<string, unknown>>, rules: ImportValidationRule[]) {
    return this.pipeline.preview(importType, rows, rules);
  }
}
