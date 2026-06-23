"use client";

import { useState, useTransition } from "react";
import { runTestTrigger, type TestTriggerResult } from "./actions";
import type { DomainEventType } from "@zig/agent-trigger-automation";

const TRIGGERS: Array<{ type: DomainEventType; label: string; agents: string }> = [
  { type: "evidence.uploaded", label: "Evidence Uploaded", agents: "reviewEvidence()" },
  { type: "framework.selected", label: "Framework Selected", agents: "runFrameworkMappingAgent()" },
  { type: "risk.created", label: "Risk Created", agents: "runRiskAssessmentAgent()" },
  { type: "risk.scored", label: "Risk Scored", agents: "runControlAdvisorAgent()" },
  { type: "gap.detected", label: "Gap Detected", agents: "runPolicyArtifactAgent() + runRemediationAgent()" },
  { type: "assessment.completed", label: "Assessment Completed", agents: "runReadinessScoringAgent()" },
  { type: "report.requested", label: "Report Requested", agents: "runReportingAgent()" },
  { type: "module.completed", label: "Module Completed", agents: "runLearningPathAgent() + runCareerPortfolioAgent()" },
  { type: "lab.completed", label: "Lab Completed", agents: "runCareerPortfolioAgent()" },
  { type: "agent.failed", label: "Agent Failed", agents: "GovernanceSupervisorAgent.supervise()" },
];

export function TestTriggerPanel() {
  const [results, setResults] = useState<Record<string, TestTriggerResult>>({});
  const [pending, startTransition] = useTransition();
  const [activeType, setActiveType] = useState<DomainEventType | null>(null);

  function fire(type: DomainEventType) {
    setActiveType(type);
    startTransition(async () => {
      const result = await runTestTrigger(type);
      setResults((prev) => ({ ...prev, [type]: result }));
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-950 font-mono text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Domain Event</th>
            <th className="px-4 py-3">Routes To</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Result</th>
          </tr>
        </thead>
        <tbody>
          {TRIGGERS.map((trigger) => {
            const result = results[trigger.type];
            return (
              <tr key={trigger.type} className="border-t border-zinc-800 align-top">
                <td className="px-4 py-4 font-medium">{trigger.label}</td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-500">{trigger.agents}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => fire(trigger.type)}
                    disabled={pending && activeType === trigger.type}
                    className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {pending && activeType === trigger.type ? "Running..." : "Fire Event"}
                  </button>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                  {result ? (
                    <div className="flex flex-col gap-1">
                      <span className={result.status === "ok" ? "text-emerald-400" : "text-red-400"}>{result.status.toUpperCase()}</span>
                      <span>{result.summary}</span>
                      <span className="text-zinc-600">event: {result.eventId}</span>
                      <span className="text-zinc-600">correlation: {result.correlationId}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">Not run yet</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
