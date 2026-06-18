import { BaseService } from "./BaseService";
import type { FrameworkRecord, TenantContext } from "@zig/data-access";

export class FrameworkService extends BaseService<FrameworkRecord> {
  findAvailableFrameworks(context: TenantContext): Promise<FrameworkRecord[]> {
    return this.repository.findMany(context, { filters: { status: "active" } as Partial<FrameworkRecord> });
  }
}
