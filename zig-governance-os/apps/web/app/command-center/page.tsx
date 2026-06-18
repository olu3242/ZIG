import { AuditManagementEngine } from "@zig/audits";
import { ControlManagementEngine } from "@zig/controls";
import { PolicyManagementEngine } from "@zig/policies";
import { RiskManagementEngine } from "@zig/risks";
import { PageHeader, StatCard } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";

export default async function CommandCenterPage() {
  await requireTenantContext();
  const control = new ControlManagementEngine().assess({ implementation: 74, testPassRate: 69, evidenceCoverage: 71, maturity: 62, hasOpenException: false });
  const risk = new RiskManagementEngine().score({ likelihood: 4, impact: 4, controlEffectiveness: control.effectiveness, treatmentEffectiveness: 55 });
  const auditReadiness = new AuditManagementEngine().readiness({ evidenceCoverage: 71, controlEffectiveness: control.effectiveness, openFindings: 4, remediationOverdue: 1 });
  const policyCoverage = new PolicyManagementEngine().coverage({ requiredPolicies: 24, publishedPolicies: 20, overdueReviews: 1 });

  return (
    <>
      <PageHeader eyebrow="Executive" title="Compliance Command Center" description="Executive view of compliance score, risk score, audit readiness, evidence health, controls, policies, findings, risks, and framework progress." />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Compliance Score" value={Math.round((control.effectiveness + auditReadiness + policyCoverage) / 3)} detail="Composite compliance posture." tone="healthy" />
        <StatCard label="Risk Score" value={risk.residualRisk} detail={`Residual risk band: ${risk.band}.`} />
        <StatCard label="Audit Readiness" value={auditReadiness} detail="Evidence, controls, findings, remediation." />
        <StatCard label="Control Effectiveness" value={control.effectiveness} detail={control.score.replaceAll("_", " ")} />
        <StatCard label="Policy Coverage" value={policyCoverage} detail="Published policy coverage." />
        <StatCard label="Evidence Health" value="Approved" detail="Current sample evidence state." tone="healthy" />
        <StatCard label="Open Findings" value={4} detail="Findings requiring remediation." tone="attention" />
        <StatCard label="Framework Progress" value="68" detail="Framework readiness rollup." />
      </div>
    </>
  );
}
