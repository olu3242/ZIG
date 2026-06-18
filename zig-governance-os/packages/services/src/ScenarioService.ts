import { BaseService } from "./BaseService";
import type { ScenarioRecord, ScenarioRunRecord, TenantContext, TenantRepository } from "@zig/data-access";

export class ScenarioService extends BaseService<ScenarioRecord> {
  constructor(
    scenarioRepository: TenantRepository<ScenarioRecord>,
    private readonly runRepository: TenantRepository<ScenarioRunRecord>,
  ) {
    super(scenarioRepository);
  }

  findRuns(context: TenantContext, scenarioId: string): Promise<ScenarioRunRecord[]> {
    return this.runRepository.findMany(context, { filters: { scenarioId } });
  }
}
