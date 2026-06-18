import { LearningAgentWorkforce } from "@zig/learning-agents";
import { LearningOperatingSystem } from "@zig/learning-os";
import { StudentDigitalTwin } from "@zig/student-twin";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function AcademyPage() {
  await requireTenantContext();
  const os = new LearningOperatingSystem();
  const agents = new LearningAgentWorkforce().list();
  const twin = new StudentDigitalTwin();
  const health = twin.health({
    learnerId: "current",
    scores: {
      knowledge: 74,
      skills: 68,
      competency: 70,
      portfolio: 62,
      certification: 71,
      career: 65,
      behavior: 82,
      confidence: 66,
      learning: 78,
    },
  });

  return (
    <>
      <PageHeader eyebrow="Learning OS" title="Academy" description="AI-native apprenticeship platform with tutor, instructor, mentor, coach, reviewer, auditor, interviewer, and career advisor agents." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Mission Stages" value={os.missionPath().length} detail={os.missionPath().join(" -> ")} />
        <StatCard label="Student Twin Health" value={health} detail="Knowledge through career twin." tone="healthy" />
        <StatCard label="Agents" value={agents.length} detail="Autonomous learning workforce." />
        <StatCard label="Twin Components" value={twin.components().length} detail="Persistent student representation." />
      </div>
      <Section title="Learning Agent Workforce">
        <DataTable columns={["Agent", "Mission", "Outputs"]} empty="No agents." rows={agents.map((agent) => [agent.key, agent.mission, agent.outputs.join(", ")])} />
      </Section>
      <Section title="Mission Path">
        <DataTable columns={["Stage", "Status"]} empty="No stages." rows={os.missionPath().map((stage) => [stage, <StatusBadge key={stage} tone="success">Enabled</StatusBadge>])} />
      </Section>
    </>
  );
}
