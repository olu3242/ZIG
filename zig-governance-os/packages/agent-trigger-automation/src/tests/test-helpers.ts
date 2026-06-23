import type { AccessSubject } from "@zig/governance-engine";
import type { AgentContext } from "@zig/agents";
import { randomId } from "../fixtures";

export function subject(role: AccessSubject["user"]["role"] = "Platform Owner"): AccessSubject {
  const user = { id: randomId("user"), tenantId: randomId("tenant"), role, status: "active" as const };
  return { user, tenantId: user.tenantId };
}

export function contextFor(subj: AccessSubject): AgentContext {
  return { tenantId: subj.tenantId, userId: subj.user.id, organizationId: randomId("org") };
}

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}
