import { BaseService } from "./BaseService";
import type { GovernanceScoreRecord, RecommendationRecord, TenantContext, TenantRepository } from "@zig/data-access";

export class GovernanceService extends BaseService<GovernanceScoreRecord> {
  constructor(
    governanceScoreRepository: TenantRepository<GovernanceScoreRecord>,
    private readonly recommendationRepository: TenantRepository<RecommendationRecord>,
  ) {
    super(governanceScoreRepository);
  }

  findRecommendations(context: TenantContext, projectId: string): Promise<RecommendationRecord[]> {
    return this.recommendationRepository.findMany(context, { filters: { projectId } });
  }
}
