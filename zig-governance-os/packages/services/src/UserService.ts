import { BaseService } from "./BaseService";
import type { TenantContext, TenantRepository, UserRecord } from "@zig/data-access";
import type { Persona, RoleName } from "@zig/types";

export interface CreateUserProfileInput {
  id: string;
  authUserId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: RoleName;
  persona?: Persona;
}

export class UserService extends BaseService<UserRecord> {
  constructor(userRepository: TenantRepository<UserRecord>) {
    super(userRepository);
  }

  async createProfile(context: TenantContext, input: CreateUserProfileInput): Promise<UserRecord> {
    return this.repository.create(context, {
      id: input.id,
      authUserId: input.authUserId,
      email: requireEmail(input.email),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: input.role ?? "Tenant Admin",
      persona: input.persona ?? "Tenant Admin",
      status: "active",
    });
  }

  async findByEmail(context: TenantContext, email: string): Promise<UserRecord | null> {
    const users = await this.repository.findMany(context, { filters: { email: requireEmail(email) } });
    return users[0] ?? null;
  }
}

function requireEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    throw new Error("A valid email is required.");
  }
  return normalized;
}
