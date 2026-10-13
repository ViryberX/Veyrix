import { cookies } from "next/headers";
import { UserContext } from "@/lib/db/database";
import { currentUser } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@/types/saas";

export async function getServerUser(request?: any): Promise<UserContext> {
  // 1. Try to read Supabase authenticated user
  try {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Veyrix Engineer",
          email: user.email || "",
          role: (user.user_metadata?.role as Role) || "Owner",
          orgId: "ws_prod_01",
        };
      }
    }
  } catch (err) {
    // Graceful fallback
  }

  // 2. Read role override from request or cookies
  let demoRoleCookie: string | undefined;

  if (request) {
    if (typeof request.cookies?.get === "function") {
      demoRoleCookie = request.cookies.get("veyrix_role")?.value;
    }
    if (!demoRoleCookie && request.headers) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/veyrix_role=([^;]+)/);
      if (match) demoRoleCookie = decodeURIComponent(match[1]);
    }
  }

  if (!demoRoleCookie) {
    try {
      const cookieStore = await cookies();
      demoRoleCookie = cookieStore.get("veyrix_role")?.value;
    } catch {
      // In certain contexts cookies() might not be available
    }
  }

  const role: Role = demoRoleCookie && ["Owner", "Admin", "Member"].includes(demoRoleCookie)
    ? (demoRoleCookie as Role)
    : currentUser.role;

  return {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role,
    orgId: "ws_prod_01",
  };
}
