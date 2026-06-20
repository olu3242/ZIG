import type { TenantContext, TenantRepository, TrustAccessLogRecord } from "@zig/data-access";

export interface TrustAnalyticsSummary {
  totalEvents: number;
  profileViews: number;
  documentViews: number;
  documentRequests: number;
  questionnaireRequests: number;
  mostRequestedResourceIds: Array<{ resourceId: string; count: number }>;
}

export class TrustAnalyticsService {
  constructor(private readonly trustAccessLogRepository: TenantRepository<TrustAccessLogRecord>) {}

  logEvent(
    context: TenantContext,
    projectId: string,
    input: { eventType: TrustAccessLogRecord["eventType"]; resourceId?: string; visitorEmail?: string },
  ): Promise<TrustAccessLogRecord> {
    return this.trustAccessLogRepository.create(context, { id: crypto.randomUUID(), projectId, occurredAt: new Date(), ...input });
  }

  async getAnalytics(context: TenantContext, projectId: string): Promise<TrustAnalyticsSummary> {
    const logs = await this.trustAccessLogRepository.findMany(context, { filters: { projectId } });

    const resourceCounts = new Map<string, number>();
    for (const log of logs) {
      if (log.resourceId) {
        resourceCounts.set(log.resourceId, (resourceCounts.get(log.resourceId) ?? 0) + 1);
      }
    }

    return {
      totalEvents: logs.length,
      profileViews: logs.filter((log) => log.eventType === "profile_view").length,
      documentViews: logs.filter((log) => log.eventType === "document_view").length,
      documentRequests: logs.filter((log) => log.eventType === "document_request").length,
      questionnaireRequests: logs.filter((log) => log.eventType === "questionnaire_request").length,
      mostRequestedResourceIds: Array.from(resourceCounts.entries())
        .map(([resourceId, count]) => ({ resourceId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
}
