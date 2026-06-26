import { BaseService } from "./BaseService";
import {
  computeEvidenceHealthScore,
  resolveEvidenceHealth,
  type EvidenceHealthResolutionInput,
  type EvidenceHealthScoreBreakdown,
} from "@zig/evidence-health";
import type {
  ControlEvidenceRecord,
  ControlMappingRecord,
  CreateRecord,
  EvidenceAlertRecord,
  EvidenceCollectionRecord,
  EvidenceRecord,
  EvidenceRequestRecord,
  EvidenceReviewRecord,
  EvidenceSourceRecord,
  TenantContext,
  TenantRepository,
} from "@zig/data-access";

export class EvidenceService extends BaseService<EvidenceRecord> {
  constructor(
    evidenceRepository: TenantRepository<EvidenceRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
    private readonly evidenceCollectionRepository: TenantRepository<EvidenceCollectionRecord>,
    private readonly evidenceSourceRepository: TenantRepository<EvidenceSourceRecord>,
    private readonly evidenceRequestRepository: TenantRepository<EvidenceRequestRecord>,
    private readonly evidenceAlertRepository: TenantRepository<EvidenceAlertRecord>,
    private readonly controlMappingRepository: TenantRepository<ControlMappingRecord>,
  ) {
    super(evidenceRepository);
  }

  findByControl(context: TenantContext, controlId: string): Promise<EvidenceRecord[]> {
    return this.repository.findMany(context, { filters: { controlId } });
  }

  // --- Evidence Mapping (control_evidence) -- canonical many-to-many mapping table per
  // EVIDENCE_DATA_MODEL.md. evidence.control_id remains the legacy single-control
  // convenience field; this is the authoritative mapping going forward.

  findMappingsForEvidence(context: TenantContext, evidenceId: string): Promise<ControlEvidenceRecord[]> {
    return this.controlEvidenceRepository.findMany(context, { filters: { evidenceId } });
  }

  findMappingsForControl(context: TenantContext, controlId: string): Promise<ControlEvidenceRecord[]> {
    return this.controlEvidenceRepository.findMany(context, { filters: { controlId } });
  }

  createMapping(context: TenantContext, record: CreateRecord<ControlEvidenceRecord>): Promise<ControlEvidenceRecord> {
    return this.controlEvidenceRepository.create(context, record);
  }

  // --- Evidence Review (evidence_reviews) -- existing table, first service wiring.

  findReviewsForEvidence(context: TenantContext, evidenceId: string): Promise<EvidenceReviewRecord[]> {
    return this.evidenceReviewRepository.findMany(context, { filters: { evidenceId } });
  }

  createReview(context: TenantContext, record: CreateRecord<EvidenceReviewRecord>): Promise<EvidenceReviewRecord> {
    return this.evidenceReviewRepository.create(context, record);
  }

  // --- Evidence Collection (evidence_collections) -- existing table, first service wiring.

  findCollections(context: TenantContext): Promise<EvidenceCollectionRecord[]> {
    return this.evidenceCollectionRepository.findMany(context);
  }

  createCollection(context: TenantContext, record: CreateRecord<EvidenceCollectionRecord>): Promise<EvidenceCollectionRecord> {
    return this.evidenceCollectionRepository.create(context, record);
  }

  // --- Evidence Source -- net-new entity (EVIDENCE_DATA_MODEL.md "Evidence Source").

  findSourcesForEvidence(context: TenantContext, evidenceId: string): Promise<EvidenceSourceRecord[]> {
    return this.evidenceSourceRepository.findMany(context, { filters: { evidenceId } });
  }

  createSource(context: TenantContext, record: CreateRecord<EvidenceSourceRecord>): Promise<EvidenceSourceRecord> {
    return this.evidenceSourceRepository.create(context, record);
  }

  // --- Evidence Request -- net-new entity, Request -> Assign -> Collect -> Review ->
  // Approve -> Map lifecycle per EVIDENCE_REQUEST_WORKFLOW.md.

  findRequestsForControl(context: TenantContext, controlId: string): Promise<EvidenceRequestRecord[]> {
    return this.evidenceRequestRepository.findMany(context, { filters: { controlId } });
  }

  createRequest(
    context: TenantContext,
    record: Omit<CreateRecord<EvidenceRequestRecord>, "status"> & { status?: EvidenceRequestRecord["status"] },
  ): Promise<EvidenceRequestRecord> {
    return this.evidenceRequestRepository.create(context, { ...record, status: record.status ?? "requested" });
  }

  // Forward order of EVIDENCE_REQUEST_WORKFLOW.md's lifecycle. A 'rejected' review sends
  // the request back to 'assigned' -- the one allowed backward transition.
  private static readonly REQUEST_STATUS_ORDER: EvidenceRequestRecord["status"][] = [
    "requested",
    "assigned",
    "collected",
    "reviewed",
    "approved",
  ];

  /**
   * Advance an Evidence Request's status per EVIDENCE_REQUEST_WORKFLOW.md's transition
   * rules: requested -> assigned -> collected -> reviewed -> approved, one step at a time,
   * or reviewed -> assigned on rejection. Rejects any other jump (e.g. requested ->
   * approved) so a request can't appear approved without having gone through assignment,
   * collection, and review.
   */
  async advanceRequestStatus(
    context: TenantContext,
    requestId: string,
    nextStatus: EvidenceRequestRecord["status"],
    patch: Partial<Pick<EvidenceRequestRecord, "resultingEvidenceId">> = {},
  ): Promise<EvidenceRequestRecord | null> {
    const requests = await this.evidenceRequestRepository.findMany(context, { filters: { id: requestId } });
    const current = requests[0];
    if (!current) {
      return null;
    }

    const currentIndex = EvidenceService.REQUEST_STATUS_ORDER.indexOf(current.status);
    const nextIndex = EvidenceService.REQUEST_STATUS_ORDER.indexOf(nextStatus);
    const isForwardStep = nextIndex === currentIndex + 1;
    const isRejectionRollback = current.status === "reviewed" && nextStatus === "assigned";

    if (!isForwardStep && !isRejectionRollback) {
      throw new Error(
        `Invalid evidence request transition: ${current.status} -> ${nextStatus}. ` +
          `Expected the next step in requested -> assigned -> collected -> reviewed -> approved, ` +
          `or reviewed -> assigned on rejection.`,
      );
    }

    return this.evidenceRequestRepository.update(context, requestId, { status: nextStatus, ...patch });
  }

  // --- Evidence Expiration alert log -- net-new entity (alert log only; expiration state
  // itself derives from evidence.expires_at + health, per EVIDENCE_DATA_MODEL.md).

  findAlertsForEvidence(context: TenantContext, evidenceId: string): Promise<EvidenceAlertRecord[]> {
    return this.evidenceAlertRepository.findMany(context, { filters: { evidenceId } });
  }

  createAlert(context: TenantContext, record: CreateRecord<EvidenceAlertRecord>): Promise<EvidenceAlertRecord> {
    return this.evidenceAlertRepository.create(context, record);
  }

  // --- Evidence Health -- routes to the two existing engines as input signals via
  // @zig/evidence-health's resolveEvidenceHealth(), then persists evidence.health.
  // Neither EvidenceManagementEngine nor AutonomousEvidenceEngine is duplicated here.

  async resolveAndPersistHealth(
    context: TenantContext,
    evidenceId: string,
    input: EvidenceHealthResolutionInput,
    now: Date = new Date(),
  ): Promise<EvidenceRecord | null> {
    const health = resolveEvidenceHealth(input, now);
    return this.repository.update(context, evidenceId, { health });
  }

  // --- Evidence Health Score -- the separate weighted 0-100 aggregate quality signal
  // (Freshness 30 / Review Status 25 / Usage 15 / Coverage 15 / Mapping 15), per
  // EVIDENCE_HEALTH_MODEL.md. Gathers its inputs from the now-wired control_evidence and
  // evidence_reviews tables plus ControlService's existing findMappings, then optionally
  // persists the result onto evidence.health_score.

  async computeHealthScore(
    context: TenantContext,
    evidence: EvidenceRecord,
  ): Promise<EvidenceHealthScoreBreakdown> {
    const [mappings, reviews] = await Promise.all([
      this.controlEvidenceRepository.findMany(context, { filters: { evidenceId: evidence.id } }),
      this.evidenceReviewRepository.findMany(context, { filters: { evidenceId: evidence.id } }),
    ]);

    // The supabase repository adapter only camel-cases keys, not value types, so
    // createdAt/reviewedAt may arrive as ISO strings rather than Date instances at
    // runtime even though the type says Date. Normalize before comparing.
    const toTime = (value: Date | string) => new Date(value).getTime();
    const latestReview = [...reviews].sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))[0];
    const primaryMapping = mappings.find((mapping) => mapping.coverage === "primary" || mapping.coverage === "sufficient") ?? mappings[0];

    // Check every control this evidence is mapped to (via the canonical control_evidence
    // table, plus the legacy evidence.controlId for evidence that predates that mapping)
    // for a framework crosswalk -- not just the legacy single-control field, so evidence
    // reused across controls via createMapping() doesn't lose the Mapping component.
    const candidateControlIds = Array.from(
      new Set([evidence.controlId, ...mappings.map((mapping) => mapping.controlId)].filter((id): id is string => Boolean(id))),
    );
    let hasFrameworkMapping = false;
    if (candidateControlIds.length > 0) {
      const frameworkMappingResults = await Promise.all(
        candidateControlIds.map((controlId) =>
          this.controlMappingRepository.findMany(context, { filters: { sourceControlId: controlId } }),
        ),
      );
      hasFrameworkMapping = frameworkMappingResults.some((result) => result.length > 0);
    }

    return computeEvidenceHealthScore({
      health: evidence.health ?? "missing",
      reviewStatus: latestReview?.status as "pending_review" | "approved" | "rejected" | undefined,
      controlEvidenceCount: mappings.length,
      coverage: primaryMapping?.coverage,
      hasFrameworkMapping,
    });
  }

  async computeAndPersistHealthScore(context: TenantContext, evidence: EvidenceRecord): Promise<EvidenceRecord | null> {
    const breakdown = await this.computeHealthScore(context, evidence);
    return this.repository.update(context, evidence.id, { healthScore: breakdown.total });
  }
}
