import { BoardReportingEngine, type BoardReportType, type BoardReportOutput } from "@zig/board-reporting";
import { orchestrateDomainAgent, type DomainAgentOutcome } from "@zig/agent-domain-intelligence";
import type { AccessSubject } from "@zig/governance-engine";
import type { AgentGovernanceGuard } from "@zig/agent-governance";
import type { AgentRuntime, AgentRunRequest } from "@zig/agent-runtime";

export type ReportingTriggeringEvent = "report.requested" | "assessment.completed" | "readiness.updated";

export type ReportingAction = "generate_report" | "request_report_publication_approval";

export interface ReportingInput {
  subjectId: string;
  triggeringEvent: ReportingTriggeringEvent;
  reportType: BoardReportType;
  outputs: BoardReportOutput[];
  aggregateReadiness: number;
  weakAreas: string[];
  /** True when the caller is requesting an official, externally publishable report. */
  isOfficial?: boolean;
}

export interface ReportingRecommendation {
  action: ReportingAction;
  confidence: number;
  rationale: string;
  narrative: string;
  reportType: BoardReportType;
  outputs: BoardReportOutput[];
}

const reportingEngine = new BoardReportingEngine();

export function recommendReport(input: ReportingInput): ReportingRecommendation {
  const manifest = reportingEngine.manifest(input.reportType, input.outputs);

  const narrative =
    `Aggregate readiness is ${input.aggregateReadiness}%` +
    (input.weakAreas.length > 0 ? `, with weak area(s) in ${input.weakAreas.join(", ")}.` : ", with no outstanding weak areas.");

  const rationaleBase =
    `Generated a ${manifest.type} report (outputs: ${manifest.outputs.join(", ")}) from ${input.triggeringEvent}. ${narrative}`;

  if (input.isOfficial) {
    return {
      action: "request_report_publication_approval",
      confidence: 0.8,
      rationale: `${rationaleBase} This is an official report — routing for human approval before publication or export.`,
      narrative,
      reportType: manifest.type,
      outputs: manifest.outputs,
    };
  }

  return {
    action: "generate_report",
    confidence: 0.75,
    rationale: rationaleBase,
    narrative,
    reportType: manifest.type,
    outputs: manifest.outputs,
  };
}

export async function runReportingAgent(
  runtime: AgentRuntime,
  guard: AgentGovernanceGuard,
  subject: AccessSubject,
  input: ReportingInput,
  context: AgentRunRequest["context"],
  eventId: string,
): Promise<DomainAgentOutcome<ReportingRecommendation>> {
  return orchestrateDomainAgent({
    runtime,
    guard,
    subject,
    agentId: "executive",
    resource: "reports",
    tool: "executive-engine",
    action: "view",
    approvalAction: input.isOfficial ? "report_generation" : undefined,
    context,
    eventId,
    domainEventType: input.triggeringEvent,
    goal: `Generate ${input.reportType} report for ${input.subjectId} triggered by ${input.triggeringEvent}.`,
    payload: { ...input },
    produce: () => recommendReport(input),
    toDecision: (recommendation) => ({
      reason: recommendation.rationale,
      confidence: recommendation.confidence,
      dataUsed: [`subject:${input.subjectId}`, `reportType:${input.reportType}`],
      action: recommendation.action,
    }),
  });
}
