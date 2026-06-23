import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";

let cachedClient: SupabaseClient | undefined;

export function createZigSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }
  const env = getPublicSupabaseEnv();
  cachedClient = createClient(env.url, env.anonKey);
  return cachedClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(createZigSupabaseClient(), property, receiver);
  },
});
