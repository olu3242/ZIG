import { getSupabaseConfig } from "@/app/lib/supabase";

export interface AuthHealthCheck {
  name: string;
  status: "healthy" | "degraded";
  detail: string;
}

export interface AuthHealthReport {
  status: "healthy" | "degraded";
  checks: AuthHealthCheck[];
  metrics: {
    dailyLogins: number;
    failedLogins: number;
    bootstrapRepairs: number;
    profileGaps: number;
    membershipGaps: number;
  };
}

const expectedObjects = ["profiles", "organizations", "organization_memberships", "roles", "auth_events"] as const;

export async function getAuthHealth(): Promise<AuthHealthReport> {
  const config = getSupabaseConfig();
  const checks: AuthHealthCheck[] = [];

  for (const objectName of expectedObjects) {
    checks.push(await probeRestObject(config.url, config.serviceRoleKey, objectName));
  }

  const metrics = await authMetrics(config.url, config.serviceRoleKey);
  const status = checks.every((check) => check.status === "healthy") ? "healthy" : "degraded";

  return { status, checks, metrics };
}

async function probeRestObject(url: string, serviceRoleKey: string, objectName: string): Promise<AuthHealthCheck> {
  try {
    const response = await fetch(`${url}/rest/v1/${objectName}?select=*&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });
    return {
      name: objectName,
      status: response.ok ? "healthy" : "degraded",
      detail: `REST ${response.status}`,
    };
  } catch (error) {
    return {
      name: objectName,
      status: "degraded",
      detail: error instanceof Error ? error.message : "Unknown probe error",
    };
  }
}

async function authMetrics(url: string, serviceRoleKey: string): Promise<AuthHealthReport["metrics"]> {
  const eventCounts = await countAuthEvents(url, serviceRoleKey);
  return {
    dailyLogins: eventCounts.LOGIN_SUCCESS ?? 0,
    failedLogins: eventCounts.LOGIN_FAILURE ?? 0,
    bootstrapRepairs:
      (eventCounts.PROFILE_CREATED ?? 0) +
      (eventCounts.ORG_CREATED ?? 0) +
      (eventCounts.MEMBERSHIP_CREATED ?? 0) +
      (eventCounts.ROLE_ASSIGNED ?? 0) +
      (eventCounts.SESSION_RECOVERED ?? 0),
    profileGaps: eventCounts.PROFILE_GAP ?? 0,
    membershipGaps: eventCounts.MEMBERSHIP_GAP ?? 0,
  };
}

async function countAuthEvents(url: string, serviceRoleKey: string): Promise<Record<string, number>> {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      select: "event_type",
      created_at: `gte.${since}`,
    });
    const response = await fetch(`${url}/rest/v1/auth_events?${params.toString()}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return {};
    }
    const rows = await response.json() as Array<{ event_type: string }>;
    return rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.event_type] = (counts[row.event_type] ?? 0) + 1;
      return counts;
    }, {});
  } catch {
    return {};
  }
}
