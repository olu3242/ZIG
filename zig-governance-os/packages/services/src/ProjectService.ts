import { BaseService } from "./BaseService";
import type { ProjectFrameworkRecord, ProjectRecord, TenantContext, TenantRepository } from "@zig/data-access";

export interface CreateProjectInput {
  name: string;
  industry?: string;
  frameworkId: string;
}

export class ProjectService extends BaseService<ProjectRecord> {
  constructor(
    projectRepository: TenantRepository<ProjectRecord>,
    private readonly projectFrameworkRepository?: TenantRepository<ProjectFrameworkRecord>,
  ) {
    super(projectRepository);
  }

  async createGovernanceProject(context: TenantContext, input: CreateProjectInput): Promise<ProjectRecord> {
    const project = await this.repository.create(context, {
      id: crypto.randomUUID(),
      name: requireName(input.name),
      industry: input.industry?.trim(),
      frameworkId: requireName(input.frameworkId),
      status: "active",
    });

    if (this.projectFrameworkRepository) {
      await this.projectFrameworkRepository.create(context, {
        id: crypto.randomUUID(),
        projectId: project.id,
        frameworkId: project.frameworkId,
        assignedByUserId: context.actorUserId,
        assignedAt: new Date(),
      });
    }

    return project;
  }
}

function requireName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Project name and framework are required.");
  }
  return trimmed;
}
