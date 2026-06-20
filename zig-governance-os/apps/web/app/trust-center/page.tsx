import { DataTable, FormField, GovernanceScoreWidget, PageHeader, SelectField, Section, StatCard, StatusBadge } from "@zig/ui";
import {
  autoAnswerQuestionnaireAction,
  completeQuestionnaireSubmissionAction,
  createQuestionnaireTemplateAction,
  decideTrustRequestAction,
  fulfillTrustRequestAction,
  publishTrustDocumentAction,
  publishTrustProfileAction,
  startQuestionnaireSubmissionAction,
} from "@/app/lib/actions";
import { loadTrustCenter } from "@/app/lib/data";

const documentCategories = [
  "information_security_policy",
  "acceptable_use_policy",
  "vendor_management_policy",
  "risk_management_policy",
  "incident_response_plan",
  "business_continuity_plan",
  "disaster_recovery_plan",
  "privacy_policy",
  "security_overview",
  "compliance_report",
  "audit_report",
];

export default async function TrustCenterPage() {
  const { project, profile, documents, requests, templates, submissions, complianceCenter, governance, vendorRisk, analytics } = await loadTrustCenter();

  if (!project) {
    return (
      <>
        <PageHeader eyebrow="Trust Center" title="Trust Center" description="Create a project before publishing a Trust Center profile." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Trust Center"
        title="Trust Center & Security Assurance"
        description="Publish your public Trust Portal, manage document and access requests, and automate security questionnaires — built on the same governance, framework, and evidence data as the rest of Zig."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {governance ? <GovernanceScoreWidget score={governance.score} detail={governance.explanation} /> : null}
        {vendorRisk ? <StatCard label="Vendor Risk" value={vendorRisk.averageRiskScore} detail={`${vendorRisk.vendorCount} vendor(s)`} /> : null}
        <StatCard label="Trust Portal Views" value={analytics?.profileViews ?? 0} detail="trust_access_logs: profile_view" />
        <StatCard label="Access Requests" value={requests.length} detail={`${requests.filter((r) => r.status === "pending").length} pending`} />
      </div>

      <Section title="Trust Portal Profile">
        {profile ? (
          <p className="text-sm text-[var(--zig-ink-muted)]">
            Published at <code>/trust/{profile.slug}</code> — {profile.isPublished ? <StatusBadge tone="success">Published</StatusBadge> : <StatusBadge tone="warning">Unpublished</StatusBadge>}
          </p>
        ) : null}
        <form action={publishTrustProfileAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="projectId" value={project.id} />
          <FormField label="Public Slug" name="slug" required defaultValue={profile?.slug} />
          <FormField label="Organization Name" name="organizationName" required defaultValue={profile?.organizationName} />
          <FormField label="Tagline (optional)" name="tagline" defaultValue={profile?.tagline} />
          <FormField label="Support Email (optional)" name="supportEmail" defaultValue={profile?.supportEmail} />
          <div className="flex items-end">
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Publish Profile</button>
          </div>
        </form>
      </Section>

      <Section title="Compliance Status">
        <DataTable
          columns={["Framework", "Coverage", "Roadmap Status"]}
          empty="No frameworks tracked yet."
          rows={complianceCenter.map((row) => [
            row.framework.name,
            `${row.coverage.coveragePercent}%`,
            <StatusBadge key={row.framework.id} tone={row.roadmapStatus === "ready" ? "success" : row.roadmapStatus === "in_progress" ? "warning" : "neutral"}>
              {row.roadmapStatus.replace("_", " ")}
            </StatusBadge>,
          ])}
        />
      </Section>

      <Section title="Publish Document">
        <form action={publishTrustDocumentAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="projectId" value={project.id} />
          <FormField label="Title" name="title" required />
          <SelectField label="Category" name="category" required options={documentCategories.map((value) => ({ label: value.replace(/_/g, " "), value }))} />
          <SelectField
            label="Visibility"
            name="visibility"
            required
            options={[
              { label: "Public", value: "public" },
              { label: "Protected", value: "protected" },
              { label: "NDA Required", value: "nda_required" },
              { label: "Approval Required", value: "approval_required" },
            ]}
          />
          <FormField label="Source URI" name="sourceUri" required />
          <div className="flex items-end">
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Publish Document</button>
          </div>
        </form>
      </Section>

      <Section title="Document Library">
        <DataTable
          columns={["Title", "Category", "Visibility"]}
          empty="No documents published yet."
          rows={documents.map((document) => [document.title, document.category.replace(/_/g, " "), document.visibility.replace(/_/g, " ")])}
        />
      </Section>

      <Section title="Access Requests">
        <DataTable
          columns={["Requester", "Reason", "Status", "Action"]}
          empty="No access requests yet."
          rows={requests.map((request) => [
            `${request.requesterName} (${request.requesterEmail})`,
            request.reason,
            <StatusBadge key={request.id} tone={request.status === "fulfilled" ? "success" : request.status === "denied" ? "warning" : "neutral"}>{request.status}</StatusBadge>,
            request.status === "pending" ? (
              <div key={`${request.id}-decide`} className="flex gap-2">
                <form action={decideTrustRequestAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="decision" value="approved" />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Approve</button>
                </form>
                <form action={decideTrustRequestAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="decision" value="denied" />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Deny</button>
                </form>
              </div>
            ) : request.status === "approved" ? (
              <form key={`${request.id}-fulfill`} action={fulfillTrustRequestAction}>
                <input type="hidden" name="requestId" value={request.id} />
                <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Release Document</button>
              </form>
            ) : (
              "—"
            ),
          ])}
        />
      </Section>

      <Section title="Questionnaire Templates">
        <form action={createQuestionnaireTemplateAction} className="grid gap-4 md:grid-cols-2">
          <FormField label="Template Name" name="name" required />
          <SelectField
            label="Template Type"
            name="templateType"
            required
            options={[
              { label: "SIG", value: "sig" },
              { label: "SIG Lite", value: "sig_lite" },
              { label: "CAIQ", value: "caiq" },
              { label: "HIPAA Vendor Review", value: "hipaa_vendor" },
              { label: "SOC Questionnaire", value: "soc" },
              { label: "Custom", value: "custom" },
            ]}
          />
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            <span>Questions (one per line)</span>
            <textarea name="questions" required rows={4} className="rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2" />
          </label>
          <div className="flex items-end">
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Create Template</button>
          </div>
        </form>
      </Section>

      <Section title="Questionnaire Submissions">
        <form action={startQuestionnaireSubmissionAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="projectId" value={project.id} />
          <SelectField label="Template" name="templateId" required options={templates.map((template) => ({ label: template.name, value: template.id }))} />
          <FormField label="Requester Name" name="requesterName" required />
          <FormField label="Requester Email" name="requesterEmail" required />
          <div className="flex items-end">
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Start Submission</button>
          </div>
        </form>

        <DataTable
          columns={["Requester", "Status", "Action"]}
          empty="No questionnaire submissions yet."
          rows={submissions.map((submission) => [
            `${submission.requesterName} (${submission.requesterEmail})`,
            <StatusBadge key={submission.id} tone={submission.status === "completed" ? "success" : "neutral"}>{submission.status}</StatusBadge>,
            <div key={`${submission.id}-actions`} className="flex gap-2">
              {submission.status === "in_progress" ? (
                <form action={autoAnswerQuestionnaireAction}>
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Auto-Answer</button>
                </form>
              ) : null}
              {submission.status === "submitted" ? (
                <form action={completeQuestionnaireSubmissionAction}>
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <button className="rounded-md border border-[var(--zig-ink)] px-2 py-1 text-xs font-medium">Mark Completed</button>
                </form>
              ) : null}
            </div>,
          ])}
        />
      </Section>
    </>
  );
}
