import { BaseService } from "./BaseService";
import type { ControlMappingRecord, ControlRecord, TenantContext, TenantRepository } from "@zig/data-access";

export class ControlService extends BaseService<ControlRecord> {
  constructor(
    controlRepository: TenantRepository<ControlRecord>,
    private readonly mappingRepository: TenantRepository<ControlMappingRecord>,
  ) {
    super(controlRepository);
  }

  findMappings(context: TenantContext, sourceControlId: string): Promise<ControlMappingRecord[]> {
    return this.mappingRepository.findMany(context, { filters: { sourceControlId } });
  }
}
