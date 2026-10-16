"use server";

import { revalidatePath } from "next/cache";
import {
  dbGetTasks,
  dbGetTaskById,
  dbCreateTask,
  dbUpdateTask,
  dbDeleteTask,
  TaskFilters,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/db/database";
import {
  getServerUser,
  getAuthenticatedServerUser,
  isSupabaseConfigured,
} from "@/lib/auth/get-user";
import { Task, TaskStatus } from "@/types/saas";
import { ActionResult } from "./projects";

export async function getTasksAction(
  filters: TaskFilters = {}
): Promise<ActionResult<{ tasks: Task[]; total: number; page: number; totalPages: number }>> {
  try {
    const user = await getServerUser();
    const result = await dbGetTasks(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load tasks." };
  }
}

export async function getTaskByIdAction(id: string): Promise<ActionResult<Task>> {
  try {
    const task = await dbGetTaskById(id);
    if (!task) {
      return { success: false, error: "Task not found." };
    }
    return { success: true, data: task };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch task." };
  }
}

export async function createTaskAction(
  input: CreateTaskInput
): Promise<ActionResult<Task>> {
  try {
    if (isSupabaseConfigured()) {
      const authUser = await getAuthenticatedServerUser();
      if (!authUser) {
        return {
          success: false,
          error: "Authentication required. Please sign in to create tasks.",
        };
      }
      const task = await dbCreateTask(input, authUser);
      revalidatePath("/tasks");
      revalidatePath("/projects");
      return { success: true, data: task };
    }

    const user = await getServerUser();
    const task = await dbCreateTask(input, user);
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, data: task };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create task." };
  }
}

export async function updateTaskAction(
  id: string,
  input: UpdateTaskInput
): Promise<ActionResult<Task>> {
  try {
    if (isSupabaseConfigured()) {
      const authUser = await getAuthenticatedServerUser();
      if (!authUser) {
        return {
          success: false,
          error: "Authentication required. Please sign in to update tasks.",
        };
      }
      const task = await dbUpdateTask(id, input, authUser);
      revalidatePath("/tasks");
      revalidatePath("/projects");
      return { success: true, data: task };
    }

    const user = await getServerUser();
    const task = await dbUpdateTask(id, input, user);
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, data: task };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update task." };
  }
}

export async function updateTaskStatusAction(
  id: string,
  status: TaskStatus
): Promise<ActionResult<Task>> {
  try {
    if (isSupabaseConfigured()) {
      const authUser = await getAuthenticatedServerUser();
      if (!authUser) {
        return {
          success: false,
          error: "Authentication required. Please sign in to change task status.",
        };
      }
      const task = await dbUpdateTask(id, { status }, authUser);
      revalidatePath("/tasks");
      revalidatePath("/projects");
      return { success: true, data: task };
    }

    const user = await getServerUser();
    const task = await dbUpdateTask(id, { status }, user);
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, data: task };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to change task status." };
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult<boolean>> {
  try {
    if (isSupabaseConfigured()) {
      const authUser = await getAuthenticatedServerUser();
      if (!authUser) {
        return {
          success: false,
          error: "Authentication required. Please sign in to delete tasks.",
        };
      }
      await dbDeleteTask(id, authUser);
      revalidatePath("/tasks");
      revalidatePath("/projects");
      return { success: true, data: true };
    }

    const user = await getServerUser();
    await dbDeleteTask(id, user);
    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, data: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete task." };
  }
}
