import { readFileSync } from "node:fs";
import { join } from "node:path";

type RepairStatus = "PASS" | "FAIL" | "WARNING";

interface RepairLine {
  status: RepairStatus;
  object: string;
  detail: string;
}

const requiredObjects = ["profiles", "auth_events", "organizations", "organization_memberships", "roles"] as const;
const defaultRoles = [
  ["student", "Learning and practice access."],
  ["professional", "Operational GRC practitioner access."],
  ["instructor", "Learning and lab management access."],
  ["manager", "Manager access for workspace oversight."],
  ["admin", "Workspace administration access."],
  ["super_admin", "Platform-level administration access."],
] as const;

async function main() {
  const env = parseEnv(readFileSync(join(process.cwd(), ".env.local"), "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = env.AUTH_REPAIR_USER_ID;
  const email = env.AUTH_REPAIR_EMAIL;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const report: RepairLine[] = [];
  report.push(...await scanObjects(url, key));

  if (userId && email) {
    report.push(...await repairUser(url, key, userId, email));
  } else {
    report.push({
      status: "WARNING",
      object: "user-repair",
      detail: "Skipped user repair. Set AUTH_REPAIR_USER_ID and AUTH_REPAIR_EMAIL to repair one user.",
    });
  }

  for (const line of report) {
    console.log(`${line.status.padEnd(7)} ${line.object.padEnd(28)} ${line.detail}`);
  }

  if (report.some((line) => line.status === "FAIL")) {
    process.exitCode = 1;
  }
}

async function scanObjects(url: string, key: string): Promise<RepairLine[]> {
  const report: RepairLine[] = [];
  for (const object of requiredObjects) {
    const response = await rest(url, key, `${object}?select=*&limit=1`, { method: "GET" });
    report.push({
      status: response.ok ? "PASS" : "FAIL",
      object,
      detail: `REST ${response.status}`,
    });
  }
  return report;
}

async function repairUser(url: string, key: string, userId: string, email: string): Promise<RepairLine[]> {
  const report: RepairLine[] = [];
  const slug = workspaceSlug(email, userId);
  const fullName = fullNameFromEmail(email);
  const organizationId = crypto.randomUUID();

  report.push(await upsert(url, key, "profiles", "user_id", {
    user_id: userId,
    email,
    full_name: fullName,
    status: "active",
  }));

  for (const [roleName, description] of defaultRoles) {
    report.push(await upsert(url, key, "roles", "role_name", {
      role_name: roleName,
      description,
    }));
  }

  const organization = await upsert(url, key, "organizations", "slug", {
    organization_id: organizationId,
    name: `${fullName} Workspace`,
    slug,
    status: "active",
  });
  report.push(organization);

  report.push(await upsert(url, key, "profiles", "user_id", {
    user_id: userId,
    email,
    full_name: fullName,
    organization_default_id: organizationId,
    status: "active",
  }));

  report.push(await upsert(url, key, "organization_memberships", "organization_id,user_id", {
    organization_id: organizationId,
    user_id: userId,
    role_name: "admin",
    status: "active",
  }));

  return report;
}

async function upsert(url: string, key: string, table: string, conflictTarget: string, payload: Record<string, unknown>): Promise<RepairLine> {
  const response = await rest(url, key, `${table}?on_conflict=${encodeURIComponent(conflictTarget)}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(payload),
  });
  return {
    status: response.ok ? "PASS" : "FAIL",
    object: `repair:${table}`,
    detail: `REST ${response.status}`,
  };
}

async function rest(url: string, key: string, path: string, init: RequestInit): Promise<Response> {
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function parseEnv(source: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) {
      continue;
    }
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function workspaceSlug(email: string, userId: string): string {
  const prefix = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "zig-user";
  return `${prefix}-${userId.slice(0, 8)}`;
}

function fullNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Zig User";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Zig User";
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
