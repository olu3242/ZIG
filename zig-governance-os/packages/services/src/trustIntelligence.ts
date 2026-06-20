/**
 * Shared pure-function derivation layer for the Trust Center (Phase 11.5), mirroring
 * frameworkIntelligence.ts / certificationEligibility.ts: no service-to-service composition
 * exists in this codebase, so logic shared across QuestionnaireService, the Trust Dashboard
 * data loader (apps/web/app/lib/data.ts), and CoachService's trust-advisor branch lives here
 * as plain functions over already-fetched rows. Nothing here re-derives governance score or
 * framework coverage math — those stay solely in GovernanceService.calculateScore and
 * computeFrameworkCoverage; this module only composes their outputs and adds the one new
 * metric Trust Center introduces (document readiness).
 */

export const TRUST_DOCUMENT_CATEGORIES = [
  "information_security_policy",
  "acceptable_use_policy",
  "vendor_management_policy",
  "risk_management_policy",
  "incident_response_plan",
  "business_continuity_plan",
  "disaster_recovery_plan",
  "privacy_policy",
  "security_overview",
  "compliance_report",
  "audit_report",
] as const;

export interface TrustDocumentInput {
  category: string;
  visibility: string;
  expiresAt?: Date;
}

export interface DocumentReadiness {
  totalCategories: number;
  publishedCategoryCount: number;
  readinessPercent: number;
  missingCategories: string[];
}

export function computeDocumentReadiness(documents: TrustDocumentInput[]): DocumentReadiness {
  const now = new Date();
  const publishedCategories = new Set(
    documents.filter((document) => !document.expiresAt || document.expiresAt > now).map((document) => document.category),
  );

  const missingCategories = TRUST_DOCUMENT_CATEGORIES.filter((category) => !publishedCategories.has(category));
  const totalCategories = TRUST_DOCUMENT_CATEGORIES.length;
  const publishedCategoryCount = totalCategories - missingCategories.length;

  return {
    totalCategories,
    publishedCategoryCount,
    readinessPercent: Math.round((publishedCategoryCount / totalCategories) * 100),
    missingCategories,
  };
}

export interface FrameworkCoverageSummaryInput {
  frameworkCode: string;
  frameworkName: string;
  coveragePercent: number;
}

export interface QuestionnaireQuestionInput {
  key: string;
  text: string;
  category?: string;
}

export interface QuestionnaireAnswerSuggestion {
  questionKey: string;
  answerText: string;
  confidence: number;
  reasoning: string;
}

/**
 * Deterministic, explainable questionnaire auto-answering (no LLM client exists in this
 * repo, same constraint CoachService documents) - matches question keywords against the
 * tenant's own live framework coverage / vendor risk / evidence data, exactly the inputs
 * the spec names ("Controls, Evidence, Audit Results, Framework Coverage, Governance
 * Scores, Vendor Assessments"), and cites the real numbers behind the answer.
 */
export function generateQuestionnaireAnswer(
  question: QuestionnaireQuestionInput,
  inputs: {
    frameworkCoverages: FrameworkCoverageSummaryInput[];
    governanceScore?: number;
    evidenceApprovedCount: number;
    evidenceTotalCount: number;
    vendorCount: number;
    vendorOpenFindingCount: number;
  },
): QuestionnaireAnswerSuggestion {
  const text = question.text.toLowerCase();
  const matchedFramework = inputs.frameworkCoverages.find((framework) =>
    text.includes(framework.frameworkCode.toLowerCase()) || text.includes(framework.frameworkName.toLowerCase()),
  );

  if (matchedFramework) {
    return {
      questionKey: question.key,
      answerText: `Our ${matchedFramework.frameworkName} (${matchedFramework.frameworkCode}) control coverage is currently ${matchedFramework.coveragePercent}%, computed live from our framework control catalogue and approved evidence.`,
      confidence: 0.8,
      reasoning: `Matched question text to framework ${matchedFramework.frameworkCode} and answered with its live coverage percent.`,
    };
  }

  if (text.includes("vendor") || text.includes("third part") || text.includes("third-party")) {
    return {
      questionKey: question.key,
      answerText: `We maintain a register of ${inputs.vendorCount} vendor(s) under active risk assessment, with ${inputs.vendorOpenFindingCount} open finding(s) currently being remediated.`,
      confidence: 0.7,
      reasoning: "Answered from the live vendor register and open vendor finding count.",
    };
  }

  if (text.includes("evidence") || text.includes("audit") || text.includes("review")) {
    return {
      questionKey: question.key,
      answerText: `${inputs.evidenceApprovedCount} of ${inputs.evidenceTotalCount} evidence item(s) on file are reviewed and approved.`,
      confidence: 0.7,
      reasoning: "Answered from the live evidence/evidence_reviews approval counts.",
    };
  }

  if (inputs.governanceScore !== undefined && (text.includes("governance") || text.includes("maturity") || text.includes("program"))) {
    return {
      questionKey: question.key,
      answerText: `Our current governance score is ${inputs.governanceScore}/100, computed from live control, risk, evidence, and framework coverage inputs.`,
      confidence: 0.65,
      reasoning: "Answered from the live GovernanceService.calculateScore output.",
    };
  }

  return {
    questionKey: question.key,
    answerText: "This question requires manual review — no matching live governance data was found to answer it automatically.",
    confidence: 0.2,
    reasoning: "No keyword in the question matched a framework, vendor, evidence, or governance metric this tenant has live data for.",
  };
}
