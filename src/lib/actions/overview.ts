"use server";

import { revalidatePath } from "next/cache";
import {
  dbGetOverviewMetrics,
  dbGetActivities,
  dbGetNotifications,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
} from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";
import { DashboardOverviewData, ActivityItem, NotificationItem } from "@/types/saas";
import { ActionResult } from "./projects";

export async function getOverviewMetricsAction(
  timeRange: string = "ALL"
): Promise<ActionResult<DashboardOverviewData>> {
  try {
    const user = await getServerUser();
    const data = await dbGetOverviewMetrics({ timeRange }, user);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to calculate overview metrics." };
  }
}

export async function getRecentActivitiesAction(
  limit: number = 10
): Promise<ActionResult<ActivityItem[]>> {
  try {
    const user = await getServerUser();
    const data = await dbGetActivities(user, limit);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load activity stream." };
  }
}

export async function getNotificationsAction(): Promise<ActionResult<NotificationItem[]>> {
  try {
    const user = await getServerUser();
    const data = await dbGetNotifications(user);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch notifications." };
  }
}

export async function markNotificationReadAction(
  id: string
): Promise<ActionResult<boolean>> {
  try {
    const user = await getServerUser();
    const res = await dbMarkNotificationRead(id, user);
    revalidatePath("/");
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update notification." };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<boolean>> {
  try {
    const user = await getServerUser();
    const res = await dbMarkAllNotificationsRead(user);
    revalidatePath("/");
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clear notifications." };
  }
}
