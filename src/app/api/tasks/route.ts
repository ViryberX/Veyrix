import { NextRequest, NextResponse } from "next/server";
import { dbGetTasks, dbCreateTask } from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || undefined;
    const sortOrder = (searchParams.get("sortOrder") as any) || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

    const user = await getServerUser(request);
    const result = await dbGetTasks(
      { search, status, priority, projectId, sortBy, sortOrder, page, limit },
      user
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await getServerUser(request);
    const task = await dbCreateTask(body, user);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status }
    );
  }
}
