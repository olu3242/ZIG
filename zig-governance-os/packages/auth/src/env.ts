export interface AuthEnvironment {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

const blockedPlaceholders = [
  ["your_project", "supabase.co"].join("."),
  ["your", "anon-key"].join("-"),
];

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} missing`);
  }
  if (blockedPlaceholders.some((placeholder) => value.includes(placeholder))) {
    throw new Error(`${name} contains a placeholder value`);
  }
  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function validateAuthEnvironment(): AuthEnvironment {
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
