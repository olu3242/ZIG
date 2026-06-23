import { createZigSupabaseClient } from "./supabase";

export async function getSession() {
  return createZigSupabaseClient().auth.getSession();
}

export async function getUser() {
  return createZigSupabaseClient().auth.getUser();
}

export async function signOut() {
  return createZigSupabaseClient().auth.signOut();
}
