import { EmployerMatchingEngine } from "@zig/employer-matching";
import { EmploymentOS } from "@zig/employment";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { loadCareer } from "@/app/lib/data";

export default async function CareerRootPage() {
  const { readiness } = await loadCareer();
  const twin = readiness.twin;
  const employment = new EmploymentOS();
  const matcher = new EmployerMatchingEngine();

  const signalRows: [string, number][] = twin
    ? [
        ["Learning Score", twin.learningScore],
        ["Knowledge Score", twin.knowledgeScore],
        ["Skills Score", twin.skillsScore],
        ["Portfolio Score", twin.portfolioScore],
        ["Certification Score", twin.certificationScore],
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Career Advisor"
        title="Career & Employment OS"
        description="Career readiness computed from real learning/assessment/lab signals, plus resume, LinkedIn, portfolio, job matching, internship matching, mock interviews, and employer readiness."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Career Readiness"
          value={readiness.readinessScore}
          detail={twin ? "Average of learning, knowledge, skills, portfolio, certification scores." : "No student_twins row yet — complete a lesson, assessment, or lab first."}
          tone="healthy"
        />
        <StatCard label="Job Match" value={matcher.match("job", readiness.readinessScore)} detail="Employer matching signal, derived from the readiness score above." />
        <StatCard label="Employment Components" value={employment.components().length} detail="Career operating model." />
      </div>
      <Section title="Readiness Inputs">
        <DataTable
          columns={["Signal", "Score"]}
          empty="No readiness signals recorded yet — portfolioScore and certificationScore remain 0 until a future Portfolio Engine writes them."
          rows={signalRows.map(([label, value]) => [label, value])}
        />
      </Section>
      <Section title="Employment Components">
        <DataTable columns={["Component"]} empty="No components." rows={employment.components().map((component) => [component.replaceAll("_", " ")])} />
      </Section>
    </>
  );
}
