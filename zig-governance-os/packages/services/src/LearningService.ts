import { BaseService } from "./BaseService";
import type { LearningModuleRecord, LearningPathRecord, TenantContext, TenantRepository } from "@zig/data-access";

export class LearningService extends BaseService<LearningPathRecord> {
  constructor(
    learningPathRepository: TenantRepository<LearningPathRecord>,
    private readonly moduleRepository: TenantRepository<LearningModuleRecord>,
  ) {
    super(learningPathRepository);
  }

  findModules(context: TenantContext, learningPathId: string): Promise<LearningModuleRecord[]> {
    return this.moduleRepository.findMany(context, { filters: { learningPathId } });
  }
}
