import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { risks, scoreRisk } from "@/app/lib/mvp-data";

const bands = ["Low", "Medium", "High", "Critical"];

export default async function RiskHeatmapPage() {
  await requireTenantContext();
  const critical = risks.filter((risk) => scoreRisk(risk) >= 20).length;

  return (
    <>
      <PageHeader eyebrow="Risk Heatmap" title="Likelihood x Impact Matrix" description="Visual risk matrix with score bands for low, medium, high, and critical exposure." />
      <div className="grid gap-4 md:grid-cols-4">
        {bands.map((band) => (
          <StatCard key={band} label={band} value={countBand(band)} detail="Risks in this exposure band." tone={band === "Critical" ? "attention" : band === "Low" ? "healthy" : "neutral"} />
        ))}
      </div>
      <Section title="Heatmap Data">
        <DataTable
          columns={["Risk", "Likelihood", "Impact", "Score", "Band"]}
          empty="No risks."
          rows={risks.map((risk) => [risk.title, risk.likelihood, risk.impact, scoreRisk(risk), bandFor(scoreRisk(risk))])}
        />
      </Section>
      <Section title="Critical Exposure">
        <p className="text-sm text-[var(--zig-ink-muted)]">{critical} risks require immediate treatment planning or executive acceptance.</p>
      </Section>
    </>
  );
}

function bandFor(score: number) {
  if (score >= 20) return "Critical";
  if (score >= 15) return "High";
  if (score >= 8) return "Medium";
  return "Low";
}

function countBand(band: string) {
  return risks.filter((risk) => bandFor(scoreRisk(risk)) === band).length;
}
