import { NextRequest, NextResponse } from "next/server";
import {
  dbGetNotifications,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
} from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    const data = await dbGetNotifications(user);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await getServerUser(request);

    if (body.all || body.markAll) {
      await dbMarkAllNotificationsRead(user);
      return NextResponse.json({ success: true, all: true });
    }

    if (body.id) {
      const res = await dbMarkNotificationRead(body.id, user);
      return NextResponse.json({ success: true, updated: res });
    }

    return NextResponse.json({ success: false, error: "Missing notification id or all flag" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
