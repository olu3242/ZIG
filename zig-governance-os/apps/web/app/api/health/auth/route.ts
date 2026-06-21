import { NextResponse } from "next/server";
import { getAuthHealth } from "@/src/lib/auth/health";

export async function GET() {
  try {
    const report = await getAuthHealth();
    return NextResponse.json(report, { status: report.status === "healthy" ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        checks: [
          {
            name: "auth-health",
            status: "degraded",
            detail: error instanceof Error ? error.message : "Unknown auth health failure",
          },
        ],
        metrics: {
          dailyLogins: 0,
          failedLogins: 0,
          bootstrapRepairs: 0,
          profileGaps: 0,
          membershipGaps: 0,
        },
      },
      { status: 503 },
    );
  }
}
