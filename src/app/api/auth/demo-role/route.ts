import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();
    if (!["Owner", "Admin", "Member"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, role });
    response.cookies.set({
      name: "veyrix_role",
      value: role,
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
