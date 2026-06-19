import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertVendorRiskWorkflowAssessesAndPersistsFindings(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_vendor", actorUserId: "user_vendor" };

  await services.projects.create(context, {
    id: "project_vendor",
    name: "Vendor Project",
    frameworkId: "framework_vendor",
    status: "active",
  });

  // --- Create: real vendors row persisted. ---
  const vendor = await services.risks.createVendor(context, {
    name: "Acme Cloud Hosting",
    projectId: "project_vendor",
    category: "cloud_infrastructure",
    criticality: "high",
    contactEmail: "security@acmecloud.example",
  });
  if (vendor.status !== "active" || vendor.criticality !== "high") {
    throw new Error("createVendor did not persist the expected vendor record.");
  }

  const vendors = await services.risks.findVendors(context);
  if (vendors.length !== 1 || vendors[0].id !== vendor.id) {
    throw new Error("findVendors did not return the persisted vendor.");
  }

  // --- Start assessment: real vendor_assessments row, in_progress. ---
  const started = await services.risks.startVendorAssessment(context, vendor.id);
  if (started.status !== "in_progress" || started.vendorId !== vendor.id) {
    throw new Error("startVendorAssessment did not persist an in_progress assessment.");
  }

  // --- Complete assessment: real score computed from likelihood/impact, findings persisted. ---
  const outcome = await services.risks.completeVendorAssessment(context, started.id, 5, 5, [
    { title: "No SOC 2 report on file", severity: "high" },
  ]);
  if (outcome.assessment.status !== "completed" || outcome.assessment.riskScore !== 100) {
    throw new Error(`Expected a completed assessment with riskScore 100, got ${outcome.assessment.status}/${outcome.assessment.riskScore}.`);
  }
  if (outcome.findings.length !== 1 || outcome.findings[0].vendorId !== vendor.id) {
    throw new Error("completeVendorAssessment did not persist the expected finding.");
  }

  const persistedFindings = await services.risks.findVendorFindings(context, started.id);
  if (persistedFindings.length !== 1 || persistedFindings[0].status !== "open") {
    throw new Error("findVendorFindings did not return the persisted, open finding.");
  }

  // --- Lower-risk assessment on a second vendor, confirm score is a real function of inputs. ---
  const lowRiskVendor = await services.risks.createVendor(context, {
    name: "Low Risk Co",
    projectId: "project_vendor",
  });
  const lowRiskAssessment = await services.risks.startVendorAssessment(context, lowRiskVendor.id);
  const lowRiskOutcome = await services.risks.completeVendorAssessment(context, lowRiskAssessment.id, 1, 1);
  if (lowRiskOutcome.assessment.riskScore !== 4) {
    throw new Error(`Expected riskScore 4 for likelihood=1/impact=1, got ${lowRiskOutcome.assessment.riskScore}.`);
  }

  // --- Summary: aggregates real persisted state, not hardcoded numbers. ---
  const summary = await services.risks.getVendorRiskSummary(context);
  if (summary.vendorCount !== 2) {
    throw new Error(`Expected vendorCount 2, got ${summary.vendorCount}.`);
  }
  if (summary.openFindingCount !== 1) {
    throw new Error(`Expected openFindingCount 1, got ${summary.openFindingCount}.`);
  }
  if (summary.averageRiskScore !== 52) {
    throw new Error(`Expected averageRiskScore 52 ((100+4)/2 rounded), got ${summary.averageRiskScore}.`);
  }
}

void assertVendorRiskWorkflowAssessesAndPersistsFindings();
