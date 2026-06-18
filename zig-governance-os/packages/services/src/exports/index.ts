import { ExportPipeline, type ExportRequest } from "@zig/exports";

export class ExportsService {
  private readonly pipeline = new ExportPipeline();

  createManifest(request: ExportRequest) {
    return this.pipeline.createManifest(request);
  }
}
