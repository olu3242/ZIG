import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section, StatusBadge } from "@zig/ui";
import { requireTenantContext } from "@/app/lib/auth";
import { getZigServices } from "@/app/lib/supabase";

export default async function LearningModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { context } = await requireTenantContext();
  const services = getZigServices();

  const module = await services.learning.findModuleById(context, id);
  if (!module) {
    notFound();
  }

  const path = await services.learning.findById(context, module.learningPathId);

  return (
    <>
      <PageHeader
        eyebrow="Learning Module"
        title={module.title}
        description={`Part of ${path?.title ?? "a learning path"}. ${module.durationMinutes} minute ${module.moduleType}.`}
        actions={<StatusBadge tone="success">{module.moduleType}</StatusBadge>}
      />
      <Section title="Navigate">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={`/learning/${module.learningPathId}`} className="font-medium underline underline-offset-4">
            Back to learning path
          </Link>
          {module.moduleType === "lesson" ? (
            <Link href={`/learning/lesson/${module.id}`} className="font-medium underline underline-offset-4">
              Open lesson
            </Link>
          ) : null}
        </div>
      </Section>
    </>
  );
}
