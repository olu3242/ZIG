import type { ExportType } from "@zig/exports";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }): Promise<Response> {
  const { type } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const generated = await services.exports.generateExport(context, type as ExportType);
  await services.audit.recordAction(context, "create", "export_manifests", generated.manifest.id, `export:${type}`);

  return new Response(generated.content, {
    headers: {
      "Content-Type": generated.contentType,
      "Content-Disposition": `attachment; filename="${generated.filename}"`,
    },
  });
}
