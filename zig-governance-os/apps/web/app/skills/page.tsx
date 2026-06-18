import { AdaptiveLearningEngine } from "@zig/adaptive-learning";
import { SkillsGraph } from "@zig/skills-graph";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function SkillsPage() {
  await requireTenantContext();
  const graph = new SkillsGraph();
  const nodes = graph.iso27001Core();
  const recommendations = new AdaptiveLearningEngine().recommend([
    { skillId: "risk-assessment", score: 61, confidence: 0.86 },
    { skillId: "control-mapping", score: 43, confidence: 0.9 },
  ]);

  return (
    <>
      <PageHeader eyebrow="Skills Graph" title="Skills Intelligence" description="Living competency map across governance, risk, compliance, audit, privacy, vendor risk, security, continuity, and leadership." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Skill Nodes" value={nodes.length} detail="Knowledge, skill, competency, proficiency, experience." />
        <StatCard label="Mastery" value={graph.mastery([{ skillId: "risk-assessment", proficiency: 68, experienceHours: 12 }, { skillId: "control-mapping", proficiency: 74, experienceHours: 18 }])} detail="Current sample mastery." />
        <StatCard label="Adaptive Gaps" value={recommendations.length} detail="Weakness-driven actions." tone="attention" />
      </div>
      <Section title="Skill Tree">
        <DataTable columns={["Skill", "Type", "Domain"]} empty="No skills." rows={nodes.map((node) => [node.label, node.type, node.domain])} />
      </Section>
    </>
  );
}
