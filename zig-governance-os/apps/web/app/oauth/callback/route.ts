import type { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/app/lib/oauth-callback";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request);
}
