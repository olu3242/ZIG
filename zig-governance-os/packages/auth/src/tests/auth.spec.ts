import type { AuthEnvironment } from "../env";
import { validateAuthEnvironment } from "../env";

export function authEnvironmentContract(): AuthEnvironment {
  return validateAuthEnvironment();
}

export const requiredAuthEnvironmentKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
