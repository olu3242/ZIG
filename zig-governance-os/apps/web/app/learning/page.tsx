import { AdaptiveLearningEngine } from "@zig/adaptive-learning";
import { AssessmentEngine } from "@zig/assessment-engine";
import { LearningAnalytics } from "@zig/learning-analytics";
import { LearningRuntime } from "@zig/learning-runtime";
import { SkillsGraph } from "@zig/skills-graph";
import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { learningPaths } from "@/app/lib/mvp-data";

export default async function LearningPage() {
  await requireTenantContext();
  const skills = new SkillsGraph().iso27001Core();
  const runtime = new LearningRuntime().e2eFlow();
  const recommendations = new AdaptiveLearningEngine().recommend([
    { skillId: "risk-assessment", score: 62, confidence: 0.86 },
    { skillId: "control-mapping", score: 48, confidence: 0.81 },
    { skillId: "internal-audit", score: 74, confidence: 0.78 },
  ]);
  const assessment = new AssessmentEngine().grade("practical_exam", 72, ["control-mapping"]);
  const analyticsScore = new LearningAnalytics().operatingScore({
    learningVelocity: 76,
    skillVelocity: 69,
    completionRate: 72,
    careerReadiness: 64,
    certificationReadiness: 70,
    jobReadiness: 58,
  });

  return (
    <>
      <PageHeader
        eyebrow="Learning OS"
        title="Learning Center"
        description="End-to-end Learning OS for assessment, skills graph, adaptive paths, labs, scenarios, capstones, portfolios, certification, mentorship, and employment outcomes."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Learning Paths" value={learningPaths.length} detail="Structured governance journeys." />
        <StatCard label="Skill Nodes" value={skills.length} detail="Knowledge, skills, competencies, proficiency, experience." />
        <StatCard label="Adaptive Actions" value={recommendations.length} detail="Weakness-driven recommendations." tone="attention" />
        <StatCard label="Learning OS Score" value={analyticsScore} detail="Velocity, completion, career, certification, job readiness." />
      </div>
      <Section title="Learning Runtime">
        <DataTable
          columns={["Stage", "Status"]}
          empty="No runtime stages configured."
          rows={runtime.map((stage) => [
            stage.replaceAll("_", " "),
            <StatusBadge key={stage} tone="success">Enabled</StatusBadge>,
          ])}
        />
      </Section>
      <Section title="Skills Intelligence">
        <DataTable
          columns={["Skill", "Type", "Domain"]}
          empty="No skill graph configured."
          rows={skills.map((skill) => [skill.label, skill.type, skill.domain])}
        />
      </Section>
      <Section title="Adaptive Recommendations">
        <DataTable
          columns={["Skill", "Priority", "Action"]}
          empty="No adaptive recommendations."
          rows={recommendations.map((recommendation) => [
            recommendation.skillId,
            recommendation.priority,
            recommendation.action.replaceAll("_", " "),
          ])}
        />
      </Section>
      <Section title="Assessment Signal">
        <p className="text-sm text-[var(--zig-ink-muted)]">
          Practical exam score: <span className="font-mono text-[var(--zig-teal)]">{assessment.score}</span>. Status: {assessment.passed ? "passed" : "remediation required"}.
        </p>
      </Section>
      <Section title="Learning Paths">
        <div className="grid gap-3 md:grid-cols-2">
          {learningPaths.length === 0 ? (
            <p className="text-sm text-[var(--zig-ink-muted)]">No learning paths have been assigned to this tenant.</p>
          ) : learningPaths.map((path) => (
            <article key={path.id} className="rounded-md border border-[var(--zig-border)] p-4">
              <h2 className="font-display text-lg font-semibold">
                <Link href={`/learning/${path.id}`} className="underline underline-offset-4">{path.title}</Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--zig-ink-muted)]">{path.description}</p>
              <p className="mt-3 font-mono text-xs uppercase text-[var(--zig-teal)]">{path.progress}% complete</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
