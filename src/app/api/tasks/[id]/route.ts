import { NextRequest, NextResponse } from "next/server";
import { dbGetTaskById, dbUpdateTask, dbDeleteTask } from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await dbGetTaskById(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await getServerUser(request);
    const task = await dbUpdateTask(id, body, user);
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update task" },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerUser(request);
    await dbDeleteTask(id, user);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete task" },
      { status }
    );
  }
}
