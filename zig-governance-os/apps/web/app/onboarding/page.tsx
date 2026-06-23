import { redirect } from "next/navigation";
import { requireSession } from "@/app/lib/auth";
import { getSupabaseConfig } from "@/app/lib/supabase";

type OnboardingProgress = {
  current_step?: string;
  completed?: boolean;
};

const stepRoutes: Record<string, string> = {
  profile: "/onboarding/profile",
  organization: "/onboarding/organization",
  experience: "/onboarding/experience",
  frameworks: "/onboarding/frameworks",
  "career-goals": "/onboarding/career-goals",
  review: "/onboarding/review",
  complete: "/dashboard",
};

export default async function OnboardingPage() {
  const session = await requireSession();
  const progress = await getProgress(session.userId);
  if (!progress) {
    redirect("/onboarding/profile");
  }
  if (progress.completed) {
    redirect("/dashboard");
  }
  redirect(stepRoutes[progress.current_step ?? "profile"] ?? "/onboarding/profile");
}

async function getProgress(userId: string): Promise<OnboardingProgress | null> {
  const config = getSupabaseConfig();
  const params = new URLSearchParams({
    select: "current_step,completed",
    user_id: `eq.${userId}`,
    limit: "1",
  });
  try {
    const response = await fetch(`${config.url}/rest/v1/onboarding_progress?${params.toString()}`, {
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const rows = await response.json() as OnboardingProgress[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
