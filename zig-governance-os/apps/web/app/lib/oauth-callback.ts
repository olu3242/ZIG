import { NextResponse, type NextRequest } from "next/server";
import { createZigSupabaseClient } from "@zig/auth";
import { setSession, setTenantProfile } from "./auth";
import { createAuthProfile, findTenantProfileByAuthUserId, recordAuthEvent, type AuthSession } from "./supabase";

export async function handleOAuthCallback(request: NextRequest): Promise<NextResponse> {
  console.log("[AUTH STEP]", "STEP_05_OAUTH_CALLBACK_START");
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    console.error("[AUTH ERROR]", error ?? "OAuth callback missing code");
    return redirectTo(request, "/login?error=oauth");
  }

  try {
    const supabase = createZigSupabaseClient();
    console.log("[AUTH STEP]", "STEP_06_EXCHANGE_CODE");
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session?.access_token || !data.user?.id || !data.user.email) {
      console.error("[AUTH ERROR]", exchangeError ?? "OAuth exchange returned incomplete session");
      return redirectTo(request, "/login?error=oauth");
    }

    const session: AuthSession = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
      email: data.user.email,
    };

    await setSession(session);
    await createAuthProfile({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name,
      role: "practitioner",
    });
    await recordAuthEvent({ userId: data.user.id, eventType: "google_login", metadata: { provider: "google" } });

    const profile = await findTenantProfileByAuthUserId(data.user.id);
    if (!profile) {
      return redirectTo(request, "/onboarding");
    }

    await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
    console.log("[AUTH STEP]", "STEP_07_OAUTH_CALLBACK_COMPLETE");
    return redirectTo(request, "/dashboard");
  } catch (callbackError) {
    console.error("[AUTH ERROR]", callbackError);
    return redirectTo(request, "/login?error=oauth");
  }
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.nextUrl.origin));
}
