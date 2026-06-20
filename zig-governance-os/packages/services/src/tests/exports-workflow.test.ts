import { createInMemoryRepositories } from "@zig/data-access";
import { createServices } from "../factory";

async function assertExportsGenerateRealCsvFromLiveData(): Promise<void> {
  const repositories = createInMemoryRepositories();
  const services = createServices(repositories);
  const context = { tenantId: "tenant_export", actorUserId: "user_export" };

  await services.projects.create(context, {
    id: "project_export",
    name: "Export Project",
    frameworkId: "framework_export",
    status: "active",
  });

  await repositories.controls.create(context, {
    id: "control_export",
    projectId: "project_export",
    frameworkId: "framework_export",
    controlId: "ENC-1",
    title: "Encrypt backups at rest",
    description: "Backups must be encrypted using a managed key.",
    status: "implemented",
    ownerId: "user_export",
  });

  const generated = await services.exports.generateExport(context, "controls");
  if (generated.manifest.type !== "controls" || generated.manifest.format !== "csv") {
    throw new Error("generateExport did not produce a manifest for the requested type/format.");
  }
  if (!generated.content.includes("control_export") || !generated.content.includes("Encrypt backups at rest")) {
    throw new Error(`Expected the generated CSV to contain the real control row, got: ${generated.content}`);
  }
  if (!generated.content.startsWith("id,")) {
    throw new Error(`Expected the CSV to start with a header row, got: ${generated.content.slice(0, 50)}`);
  }

  // --- A catalog-only type must not fabricate data — it should fail loudly, not silently. ---
  let threw = false;
  try {
    await services.exports.generateExport(context, "policies");
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected generateExport to reject a catalog-only export type rather than fabricate content.");
  }
}

void assertExportsGenerateRealCsvFromLiveData();
