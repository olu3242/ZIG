import { NextResponse, type NextRequest } from "next/server";
import { createZigSupabaseClient } from "@zig/auth";
import type { EmailOtpType } from "@supabase/supabase-js";
import { bootstrapAuthenticatedUser, onboardingRouteForBootstrap } from "@/src/lib/auth/bootstrap";
import { setSession, setTenantProfile } from "./auth";
import { createAuthProfile, findTenantProfileByAuthUserId, recordAuthEvent, type AuthSession } from "./supabase";

export async function handleOAuthCallback(request: NextRequest): Promise<NextResponse> {
  console.log("[AUTH STEP]", "STEP_05_AUTH_CALLBACK_START");
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const error = request.nextUrl.searchParams.get("error");

  console.log("[AUTH FORENSIC]", {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
    callbackPath: request.nextUrl.pathname,
  });

  if (error || (!code && !tokenHash)) {
    console.error("[AUTH ERROR]", error ?? "Auth callback missing code and token_hash");
    return redirectTo(request, "/login?error=callback");
  }

  try {
    const supabase = createZigSupabaseClient();
    console.log("[AUTH STEP]", "STEP_06_SESSION_EXCHANGE_START");
    const { data, error: exchangeError } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash ?? "", type: type ?? "signup" });

    console.log("[AUTH FORENSIC]", {
      exchangeMethod: code ? "exchangeCodeForSession" : "verifyOtp",
      session: Boolean(data.session?.access_token),
      userId: data.user?.id,
    });

    if (exchangeError || !data.session?.access_token || !data.user?.id || !data.user.email) {
      console.error("[AUTH ERROR]", exchangeError ?? "Auth callback returned incomplete session");
      return redirectTo(request, "/login?error=callback");
    }

    const session: AuthSession = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
      email: data.user.email,
    };

    await setSession(session);
    console.log("[AUTH FORENSIC]", { cookieHandoff: "zig_session_set", userId: data.user.id });
    await safeCreateAuthProfile({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name,
      role: "practitioner",
    });
    await safeRecordAuthEvent({ userId: data.user.id, eventType: "LOGIN_SUCCESS", metadata: { provider: "google" } });

    const bootstrap = await bootstrapAuthenticatedUser(session);
    if (bootstrap.status === "complete" && bootstrap.context) {
      await setTenantProfile(bootstrap.context.tenantId, bootstrap.context.userId, bootstrap.context.persona);
      console.log("[AUTH STEP]", "STEP_07_AUTH_CALLBACK_COMPLETE");
      return redirectTo(request, "/auth/success");
    }

    const profile = await safeFindTenantProfileByAuthUserId(data.user.id);
    if (!profile) {
      const destination = onboardingRouteForBootstrap(bootstrap);
      return redirectTo(request, `/auth/success?next=${encodeURIComponent(destination)}`);
    }

    await setTenantProfile(profile.tenantId, profile.userId, profile.persona);
    console.log("[AUTH STEP]", "STEP_07_AUTH_CALLBACK_COMPLETE");
    return redirectTo(request, "/auth/success");
  } catch (callbackError) {
    console.error("[AUTH ERROR]", callbackError);
    return redirectTo(request, "/login?error=callback");
  }
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.nextUrl.origin));
}

async function safeCreateAuthProfile(input: { id: string; email: string; fullName?: string; role?: string }): Promise<void> {
  try {
    await createAuthProfile(input);
  } catch (error) {
    console.error("[AUTH WARN]", "profile bootstrap skipped", error);
  }
}

async function safeRecordAuthEvent(input: { userId?: string; eventType: string; ip?: string; metadata?: Record<string, unknown> }): Promise<void> {
  try {
    await recordAuthEvent(input);
  } catch (error) {
    console.error("[AUTH WARN]", "auth event skipped", error);
  }
}

async function safeFindTenantProfileByAuthUserId(authUserId: string) {
  try {
    return await findTenantProfileByAuthUserId(authUserId);
  } catch (error) {
    console.error("[AUTH WARN]", "tenant profile lookup failed", error);
    return null;
  }
}
