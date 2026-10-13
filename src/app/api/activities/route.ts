import { NextRequest, NextResponse } from "next/server";
import { dbGetActivities } from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;

    const user = await getServerUser(request);
    const data = await dbGetActivities(user, limit);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
