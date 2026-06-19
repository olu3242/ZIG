import { createZigSupabaseClient } from "./supabase";

export async function startGoogleOAuth(redirectTo: string) {
  const { data, error } = await createZigSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }
  if (!data.url) {
    throw new Error("Google OAuth did not return a redirect URL.");
  }

  return data.url;
}
