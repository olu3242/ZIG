import { FrameworkRegistry } from "@zig/framework-engine";
import { GovernanceScoreEngine } from "@zig/governance-engine";
import type { LearningPath, Project, Recommendation, Task } from "@zig/types";

export const tenantId = "tenant_demo_saas";
export const projectId = "project_saas_governance_launch";

export const frameworks = FrameworkRegistry.list();

export const projects: Project[] = [
  {
    id: projectId,
    tenantId,
    name: "SaaS Governance Launch",
    frameworkId: "framework_iso27001_2022",
    status: "active",
    industry: "SaaS",
    createdAt: new Date("2026-06-01T14:00:00.000Z"),
    updatedAt: new Date("2026-06-17T20:00:00.000Z"),
  },
  {
    id: "project_fintech_readiness",
    tenantId,
    name: "Fintech SOC 2 Readiness",
    frameworkId: "framework_soc2_2022",
    status: "draft",
    industry: "Fintech",
    createdAt: new Date("2026-06-12T14:00:00.000Z"),
    updatedAt: new Date("2026-06-16T20:00:00.000Z"),
  },
];

export const governanceScore = new GovernanceScoreEngine().calculateScore({
  tenantId,
  projectId,
  controlsImplemented: 68,
  evidenceCoverage: 54,
  riskTreatment: 73,
  assessmentCompletion: 61,
});

export const recommendations: Recommendation[] = [
  {
    id: "rec_evidence_access_reviews",
    tenantId,
    projectId,
    severity: "high",
    title: "Attach evidence for quarterly access reviews",
    explanation: "Access review controls are implemented but evidence coverage is below the launch threshold.",
    action: "Request access review exports from the system owner.",
    confidence: 0.88,
    frameworkReference: "ISO27001 A.5.18",
  },
  {
    id: "rec_cloud_asset_owner",
    tenantId,
    projectId,
    severity: "medium",
    title: "Assign owners to cloud production assets",
    explanation: "Two critical assets have no accountable owner, which weakens risk treatment traceability.",
    action: "Assign the platform lead as interim owner.",
    confidence: 0.82,
    frameworkReference: "NIST_CSF GV.OC",
  },
];

export const tasks: Task[] = [
  {
    id: "task_access_review_evidence",
    tenantId,
    projectId,
    title: "Upload Q2 access review evidence",
    status: "in_progress",
    dueAt: new Date("2026-06-24T18:00:00.000Z"),
  },
  {
    id: "task_risk_acceptance",
    tenantId,
    projectId,
    title: "Review accepted vendor risk",
    status: "todo",
    dueAt: new Date("2026-06-27T18:00:00.000Z"),
  },
];

export const learningPaths: LearningPath[] = [
  {
    id: "learning_grc_foundations",
    tenantId,
    title: "GRC Foundations",
    description: "Controls, risks, evidence, and audit-ready governance workflows.",
    progressPercent: 42,
  },
  {
    id: "learning_iso27001_practitioner",
    tenantId,
    title: "ISO 27001 Practitioner",
    description: "Build and operate an ISMS using the Zig governance model.",
    progressPercent: 18,
  },
];

export const dashboardStats = {
  projects: projects.length,
  frameworks: frameworks.length,
  learningProgress: "42%",
  openRisks: 7,
  openTasks: tasks.filter((task) => task.status !== "done").length,
  evidenceStatus: "54%",
};
