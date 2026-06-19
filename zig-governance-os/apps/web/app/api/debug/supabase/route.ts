import { NextResponse } from "next/server";
import { createZigSupabaseClient } from "@zig/auth";

export async function GET() {
  console.log("[AUTH STEP]", "DEBUG_SUPABASE_SESSION_START");
  try {
    const { data, error } = await createZigSupabaseClient().auth.getSession();
    if (error) {
      console.error("[AUTH ERROR]", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log("[AUTH STEP]", "DEBUG_SUPABASE_SESSION_COMPLETE");
    return NextResponse.json({ ok: true, hasSession: Boolean(data.session) });
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown Supabase session failure" },
      { status: 500 },
    );
  }
}
