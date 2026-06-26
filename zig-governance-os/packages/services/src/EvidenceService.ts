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

  /**
   * Advance an Evidence Request's status per EVIDENCE_REQUEST_WORKFLOW.md's transition
   * rules: requested -> assigned -> collected -> reviewed -> approved, with a
   * 'rejected' review sending the request back to 'assigned' rather than forward (the
   * caller is responsible for passing 'assigned' as nextStatus in that case -- this method
   * enforces the transition is one of the documented states, not the rejection branch
   * itself, which depends on evidence_reviews data this method does not query).
   */
  advanceRequestStatus(
    context: TenantContext,
    requestId: string,
    nextStatus: EvidenceRequestRecord["status"],
    patch: Partial<Pick<EvidenceRequestRecord, "resultingEvidenceId">> = {},
  ): Promise<EvidenceRequestRecord | null> {
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

    const latestReview = reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const primaryMapping = mappings.find((mapping) => mapping.coverage === "primary" || mapping.coverage === "sufficient") ?? mappings[0];

    let hasFrameworkMapping = false;
    if (evidence.controlId) {
      const frameworkMappings = await this.controlMappingRepository.findMany(context, { filters: { sourceControlId: evidence.controlId } });
      hasFrameworkMapping = frameworkMappings.length > 0;
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
