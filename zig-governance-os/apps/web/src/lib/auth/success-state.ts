import { getSession } from "@/app/lib/auth";
import { getSupabaseConfig } from "@/app/lib/supabase";

export interface AuthSuccessState {
  sessionExists: boolean;
  userId?: string;
  email?: string;
  profileExists: boolean;
  organizationExists: boolean;
  membershipExists: boolean;
  next: string;
}

export async function getAuthSuccessState(nextOverride?: string): Promise<AuthSuccessState> {
  const session = await getSession();
  if (!session) {
    return {
      sessionExists: false,
      profileExists: false,
      organizationExists: false,
      membershipExists: false,
      next: "/login?error=session",
    };
  }

  const config = getSupabaseConfig();
  const profile = await getOne<{ organization_default_id?: string }>(config.url, config.serviceRoleKey, "profiles", { user_id: session.userId });
  const membership = await getOne<{ organization_id: string }>(config.url, config.serviceRoleKey, "organization_memberships", { user_id: session.userId });
  const organizationId = membership?.organization_id ?? profile?.organization_default_id;
  const organization = organizationId
    ? await getOne(config.url, config.serviceRoleKey, "organizations", { organization_id: organizationId })
    : null;

  const next = nextOverride ??
    (!profile ? "/onboarding/profile" :
      !organization ? "/onboarding/organization" :
        !membership ? "/onboarding/organization" :
          "/onboarding/experience");

  return {
    sessionExists: true,
    userId: session.userId,
    email: session.email,
    profileExists: Boolean(profile),
    organizationExists: Boolean(organization),
    membershipExists: Boolean(membership),
    next,
  };
}

async function getOne<T>(url: string, serviceRoleKey: string, table: string, query: Record<string, string>): Promise<T | null> {
  const params = new URLSearchParams({ select: "*", limit: "1" });
  for (const [key, value] of Object.entries(query)) {
    params.set(key, `eq.${value}`);
  }

  try {
    const response = await fetch(`${url}/rest/v1/${table}?${params.toString()}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const rows = await response.json() as T[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
