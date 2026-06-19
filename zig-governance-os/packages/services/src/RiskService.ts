import { BaseService } from "./BaseService";
import type {
  RiskAssessmentRecord,
  RiskRecord,
  TenantContext,
  TenantRepository,
  VendorAssessmentRecord,
  VendorFindingRecord,
  VendorRecord,
} from "@zig/data-access";

export interface CreateVendorInput {
  name: string;
  projectId: string;
  category?: string;
  criticality?: VendorRecord["criticality"];
  contactEmail?: string;
}

export interface VendorFindingInput {
  title: string;
  severity: VendorFindingRecord["severity"];
}

export interface VendorRiskSummary {
  vendorCount: number;
  openFindingCount: number;
  averageRiskScore: number;
}

// Vendor / Third-Party Risk is scoped under the Risk Workspace (module #5), not a
// separate product module - see docs/product/prd.md Section 11. Vendors are assessed
// (producing a risk score) and reviewed (producing findings), the same shape `risks`
// already has via risk_assessments/risk_reviews, so this is an EXTEND of RiskService
// rather than a new VendorService/top-level service key.
export class RiskService extends BaseService<RiskRecord> {
  constructor(
    riskRepository: TenantRepository<RiskRecord>,
    private readonly assessmentRepository: TenantRepository<RiskAssessmentRecord>,
    private readonly vendorRepository: TenantRepository<VendorRecord>,
    private readonly vendorAssessmentRepository: TenantRepository<VendorAssessmentRecord>,
    private readonly vendorFindingRepository: TenantRepository<VendorFindingRecord>,
  ) {
    super(riskRepository);
  }

  findAssessments(context: TenantContext, riskId: string): Promise<RiskAssessmentRecord[]> {
    return this.assessmentRepository.findMany(context, { filters: { riskId } });
  }

  findVendors(context: TenantContext): Promise<VendorRecord[]> {
    return this.vendorRepository.findMany(context);
  }

  createVendor(context: TenantContext, input: CreateVendorInput): Promise<VendorRecord> {
    return this.vendorRepository.create(context, {
      id: crypto.randomUUID(),
      projectId: input.projectId,
      name: input.name,
      category: input.category ?? "other",
      criticality: input.criticality ?? "medium",
      status: "active",
      contactEmail: input.contactEmail,
    });
  }

  findVendorAssessments(context: TenantContext, vendorId: string): Promise<VendorAssessmentRecord[]> {
    return this.vendorAssessmentRepository.findMany(context, { filters: { vendorId } });
  }

  findVendorFindings(context: TenantContext, vendorAssessmentId: string): Promise<VendorFindingRecord[]> {
    return this.vendorFindingRepository.findMany(context, { filters: { vendorAssessmentId } });
  }

  startVendorAssessment(context: TenantContext, vendorId: string): Promise<VendorAssessmentRecord> {
    return this.vendorAssessmentRepository.create(context, {
      id: crypto.randomUUID(),
      vendorId,
      likelihood: 1,
      impact: 1,
      riskScore: 0,
      status: "in_progress",
    });
  }

  async completeVendorAssessment(
    context: TenantContext,
    vendorAssessmentId: string,
    likelihood: number,
    impact: number,
    findings: VendorFindingInput[] = [],
  ): Promise<{ assessment: VendorAssessmentRecord; findings: VendorFindingRecord[] }> {
    const assessmentRepository = this.vendorAssessmentRepository;
    const existing = await assessmentRepository.findById(context, vendorAssessmentId);
    if (!existing) throw new Error(`Vendor assessment ${vendorAssessmentId} not found.`);

    const riskScore = Math.round(((likelihood * impact) / 25) * 100);
    const assessment = await assessmentRepository.update(context, vendorAssessmentId, {
      likelihood,
      impact,
      riskScore,
      status: "completed",
      assessedAt: new Date(),
    });
    if (!assessment) throw new Error(`Failed to update vendor assessment ${vendorAssessmentId}.`);

    const findingRepository = this.vendorFindingRepository;
    const createdFindings = await Promise.all(
      findings.map((finding) =>
        findingRepository.create(context, {
          id: crypto.randomUUID(),
          vendorAssessmentId,
          vendorId: assessment.vendorId,
          title: finding.title,
          severity: finding.severity,
          status: "open",
        }),
      ),
    );

    return { assessment, findings: createdFindings };
  }

  async getVendorRiskSummary(context: TenantContext): Promise<VendorRiskSummary> {
    const vendors = await this.vendorRepository.findMany(context);
    const findings = await this.vendorFindingRepository.findMany(context);
    const assessments = await this.vendorAssessmentRepository.findMany(context);

    const openFindingCount = findings.filter((finding) => finding.status === "open" || finding.status === "remediating").length;
    const completedScores = assessments.filter((assessment) => assessment.status === "completed").map((assessment) => assessment.riskScore);
    const averageRiskScore = completedScores.length
      ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
      : 0;

    return { vendorCount: vendors.length, openFindingCount, averageRiskScore };
  }

}
