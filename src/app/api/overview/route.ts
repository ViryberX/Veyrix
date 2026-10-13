import { NextRequest, NextResponse } from "next/server";
import { dbGetOverviewMetrics } from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "ALL";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const user = await getServerUser(request);
    const data = await dbGetOverviewMetrics({ timeRange, startDate, endDate }, user);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate overview metrics" },
      { status: 500 }
    );
  }
}
