import { BaseService } from "./BaseService";
import type { EvidenceRecord, TenantContext } from "@zig/data-access";

export class EvidenceService extends BaseService<EvidenceRecord> {
  findByControl(context: TenantContext, controlId: string): Promise<EvidenceRecord[]> {
    return this.repository.findMany(context, { filters: { controlId } });
  }
}
