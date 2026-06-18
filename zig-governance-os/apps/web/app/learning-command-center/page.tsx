import { AgentPerformanceEngine } from "@zig/agent-performance";
import { AssessmentOS } from "@zig/assessment-os";
import { CertificationReadinessEngine } from "@zig/certification-readiness";
import { LearningKernel } from "@zig/learning-kernel";
import { LearningOrchestrator } from "@zig/learning-orchestrator";
import { LearningTelemetry } from "@zig/learning-telemetry";
import { StudentLifecycleEngine } from "@zig/student-lifecycle";
import { StudentDigitalTwin } from "@zig/student-twin";
import { PageHeader, Section, StatCard, DataTable } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function LearningCommandCenterPage() {
  await requireTenantContext();
  const kernel = new LearningKernel();
  const lifecycle = new StudentLifecycleEngine();
  const telemetry = new LearningTelemetry();
  const twin = new StudentDigitalTwin();
  const assessment = new AssessmentOS().composite({ knowledge: 77, skill: 71, competency: 73, confidence: 66, mastery: 70 });
  const certification = new CertificationReadinessEngine().score({ knowledge: 78, practicalSkills: 72, labCompletion: 84, scenarioCompletion: 69, capstones: 64, interviewReadiness: 70 });
  const agentScore = new AgentPerformanceEngine().score({ teachingQuality: 88, studentSuccess: 74, assessmentAccuracy: 80, certificationSuccess: 71, employmentSuccess: 62, mentorEffectiveness: 82 });

  return (
    <>
      <PageHeader eyebrow="Learning Kernel" title="Learning Command Center" description="Student twin, agent workforce, learning progress, certification readiness, career readiness, employment readiness, and agent health." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Kernel Functions" value={kernel.responsibilities().length} detail="Registration through employment tracking." />
        <StatCard label="Twin Components" value={twin.components().length} detail="Student digital twin." />
        <StatCard label="Assessment Score" value={assessment} detail="Knowledge, skills, competency, confidence, mastery." />
        <StatCard label="Certification Readiness" value={certification} detail="Certification engine signal." tone="healthy" />
        <StatCard label="Agent Health" value={agentScore} detail="Agent workforce performance." />
        <StatCard label="Lifecycle Stages" value={lifecycle.stages().length} detail="Prospect through instructor." />
        <StatCard label="Escalation" value={new LearningOrchestrator().route("low_progress")} detail="Low progress intervention." tone="attention" />
        <StatCard label="Telemetry Metrics" value={telemetry.metrics().length} detail="Learning through employment progress." />
      </div>
      <Section title="Kernel Responsibilities">
        <DataTable columns={["Responsibility"]} empty="No responsibilities." rows={kernel.responsibilities().map((item) => [item.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
