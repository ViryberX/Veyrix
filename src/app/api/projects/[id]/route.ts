import { NextRequest, NextResponse } from "next/server";
import { dbGetProjectById, dbUpdateProject, dbDeleteProject } from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await dbGetProjectById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch project" },
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
    const project = await dbUpdateProject(id, body, user);
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update project" },
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
    await dbDeleteProject(id, user);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    const status = error.message?.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete project" },
      { status }
    );
  }
}
