import type { AuthResponse, UserResponse } from "@supabase/supabase-js";
import { getSession, getUser, signOut } from "../session";

export type SessionReader = typeof getSession;
export type UserReader = typeof getUser;
export type SessionTerminator = typeof signOut;

export interface SupabaseSessionContract {
  session: AuthResponse["data"]["session"];
  user: UserResponse["data"]["user"];
}
