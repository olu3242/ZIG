import { BaseService } from "./BaseService";
import type { RiskAssessmentRecord, RiskRecord, TenantContext, TenantRepository } from "@zig/data-access";

export class RiskService extends BaseService<RiskRecord> {
  constructor(
    riskRepository: TenantRepository<RiskRecord>,
    private readonly assessmentRepository: TenantRepository<RiskAssessmentRecord>,
  ) {
    super(riskRepository);
  }

  findAssessments(context: TenantContext, riskId: string): Promise<RiskAssessmentRecord[]> {
    return this.assessmentRepository.findMany(context, { filters: { riskId } });
  }
}
