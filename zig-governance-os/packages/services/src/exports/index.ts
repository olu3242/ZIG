import { ExportPipeline, LIVE_EXPORT_TYPES, toCsv, type ExportManifest, type ExportRequest, type ExportType } from "@zig/exports";
import { computeFrameworkCoverage } from "../frameworkIntelligence";
import type {
  AuditRecord,
  ControlEvidenceRecord,
  ControlRecord,
  EvidenceRecord,
  EvidenceReviewRecord,
  FrameworkControlRecord,
  FrameworkRecord,
  QuestionnaireAnswerRecord,
  QuestionnaireSubmissionRecord,
  RiskRecord,
  TenantContext,
  TenantRepository,
  VendorRecord,
} from "@zig/data-access";

export interface GeneratedExport {
  manifest: ExportManifest;
  filename: string;
  contentType: string;
  content: string;
}

// CSV generation is real and live-data-backed for controls/risks/evidence/vendors/audits
// (Phase 11.2) plus, as of Phase 11.5, compliance_status/trust_report/
// framework_coverage_report/questionnaire_package - all four computed at read time by
// reusing computeFrameworkCoverage from frameworkIntelligence.ts (the same function
// FrameworkCoverageService calls), never re-deriving coverage logic. The rest of
// ExportType remain catalog-only; see docs/certification/TRUST_CENTER_CERTIFICATION.md.
export class ExportsService {
  private readonly pipeline = new ExportPipeline();

  constructor(
    private readonly controlRepository: TenantRepository<ControlRecord>,
    private readonly riskRepository: TenantRepository<RiskRecord>,
    private readonly evidenceRepository: TenantRepository<EvidenceRecord>,
    private readonly vendorRepository: TenantRepository<VendorRecord>,
    private readonly auditRepository: TenantRepository<AuditRecord>,
    private readonly frameworkRepository: TenantRepository<FrameworkRecord>,
    private readonly frameworkControlRepository: TenantRepository<FrameworkControlRecord>,
    private readonly controlEvidenceRepository: TenantRepository<ControlEvidenceRecord>,
    private readonly evidenceReviewRepository: TenantRepository<EvidenceReviewRecord>,
    private readonly questionnaireSubmissionRepository: TenantRepository<QuestionnaireSubmissionRecord>,
    private readonly questionnaireAnswerRepository: TenantRepository<QuestionnaireAnswerRecord>,
  ) {}

  createManifest(request: ExportRequest) {
    return this.pipeline.createManifest(request);
  }

  isLive(type: ExportType): boolean {
    return LIVE_EXPORT_TYPES.includes(type);
  }

  async generateExport(context: TenantContext, type: ExportType): Promise<GeneratedExport> {
    if (!context.actorUserId) {
      throw new Error("A signed-in actor is required to generate an export.");
    }
    if (!this.isLive(type)) {
      throw new Error(`Export type "${type}" is cataloged but not yet wired to a live data source.`);
    }

    const manifest = this.pipeline.createManifest({
      tenantId: context.tenantId,
      requestedByUserId: context.actorUserId,
      type,
      format: "csv",
    });

    const rows = await this.rowsFor(context, type);
    return {
      manifest,
      filename: `${type}_${manifest.id}.csv`,
      contentType: "text/csv",
      content: toCsv(rows as unknown as Array<Record<string, unknown>>),
    };
  }

  private async rowsFor(context: TenantContext, type: ExportType) {
    switch (type) {
      case "controls":
        return this.controlRepository.findMany(context);
      case "risks":
        return this.riskRepository.findMany(context);
      case "evidence":
        return this.evidenceRepository.findMany(context);
      case "vendors":
        return this.vendorRepository.findMany(context);
      case "audits":
        return this.auditRepository.findMany(context);
      case "compliance_status":
        return this.complianceStatusRows(context);
      case "framework_coverage_report":
        return this.frameworkCoverageRows(context);
      case "trust_report":
        return this.trustReportRows(context);
      case "questionnaire_package":
        return this.questionnairePackageRows(context);
      default:
        throw new Error(`Export type "${type}" has no live row source.`);
    }
  }

  private async coverageByFramework(context: TenantContext) {
    const [frameworks, frameworkControls, controls, controlEvidenceLinks, evidenceReviews] = await Promise.all([
      this.frameworkRepository.findMany(context),
      this.frameworkControlRepository.findMany(context),
      this.controlRepository.findMany(context),
      this.controlEvidenceRepository.findMany(context),
      this.evidenceReviewRepository.findMany(context),
    ]);

    return frameworks.map((framework) => {
      const ownFrameworkControls = frameworkControls.filter((control) => control.frameworkId === framework.id);
      const ownControls = controls.filter((control) => control.frameworkId === framework.id);
      const coverage = computeFrameworkCoverage(ownFrameworkControls, ownControls, controlEvidenceLinks, evidenceReviews);
      return { framework, coverage };
    });
  }

  private async complianceStatusRows(context: TenantContext) {
    const rows = await this.coverageByFramework(context);
    return rows.map(({ framework, coverage }) => ({
      frameworkCode: framework.code,
      frameworkName: framework.name,
      totalControlCount: coverage.totalControlCount,
      implementedControlCount: coverage.implementedControlCount,
      partialControlCount: coverage.partialControlCount,
      missingControlCount: coverage.missingControlCount,
      coveragePercent: coverage.coveragePercent,
    }));
  }

  private async frameworkCoverageRows(context: TenantContext) {
    const rows = await this.coverageByFramework(context);
    return rows.flatMap(({ framework, coverage }) =>
      coverage.controls.map((control) => ({
        frameworkCode: framework.code,
        frameworkName: framework.name,
        controlCode: control.controlCode,
        title: control.title,
        status: control.status,
        hasApprovedEvidence: control.hasApprovedEvidence,
      })),
    );
  }

  private async trustReportRows(context: TenantContext) {
    const [complianceStatus, vendors, evidence] = await Promise.all([
      this.complianceStatusRows(context),
      this.vendorRepository.findMany(context),
      this.evidenceRepository.findMany(context),
    ]);

    const averageCoverage = complianceStatus.length === 0
      ? 0
      : Math.round(complianceStatus.reduce((sum, row) => sum + row.coveragePercent, 0) / complianceStatus.length);
    const approvedEvidenceCount = evidence.filter((row) => row.status === "approved").length;

    const summaryRows = [
      { section: "Security Health", metric: "Frameworks Tracked", value: complianceStatus.length },
      { section: "Security Health", metric: "Average Framework Coverage %", value: averageCoverage },
      { section: "Vendor Risk", metric: "Vendors Registered", value: vendors.length },
      { section: "Evidence Readiness", metric: "Approved Evidence Items", value: approvedEvidenceCount },
      { section: "Evidence Readiness", metric: "Total Evidence Items", value: evidence.length },
    ];

    return [
      ...summaryRows,
      ...complianceStatus.map((row) => ({ section: "Framework Coverage", metric: `${row.frameworkCode} — ${row.frameworkName}`, value: `${row.coveragePercent}%` })),
    ];
  }

  private async questionnairePackageRows(context: TenantContext) {
    const [submissions, answers] = await Promise.all([
      this.questionnaireSubmissionRepository.findMany(context),
      this.questionnaireAnswerRepository.findMany(context),
    ]);
    const submissionsById = new Map(submissions.map((submission) => [submission.id, submission]));

    return answers.map((answer) => {
      const submission = submissionsById.get(answer.submissionId);
      return {
        submissionId: answer.submissionId,
        requesterName: submission?.requesterName ?? "",
        requesterEmail: submission?.requesterEmail ?? "",
        status: submission?.status ?? "",
        questionKey: answer.questionKey,
        questionText: answer.questionText,
        answerText: answer.answerText,
        aiGenerated: answer.aiGenerated,
        confidence: answer.confidence,
      };
    });
  }
}
