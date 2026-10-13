"use server";

import { revalidatePath } from "next/cache";
import {
  dbGetProjects,
  dbGetProjectById,
  dbCreateProject,
  dbUpdateProject,
  dbDeleteProject,
  ProjectFilters,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/db/database";
import { getServerUser } from "@/lib/auth/get-user";
import { Project } from "@/types/saas";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getProjectsAction(
  filters: ProjectFilters = {}
): Promise<ActionResult<{ projects: Project[]; total: number; page: number; totalPages: number }>> {
  try {
    const user = await getServerUser();
    const result = await dbGetProjects(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load projects." };
  }
}

export async function getProjectByIdAction(id: string): Promise<ActionResult<Project>> {
  try {
    const project = await dbGetProjectById(id);
    if (!project) {
      return { success: false, error: "Project not found." };
    }
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch project." };
  }
}

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResult<Project>> {
  try {
    const user = await getServerUser();
    const project = await dbCreateProject(input, user);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create project." };
  }
}

export async function updateProjectAction(
  id: string,
  input: UpdateProjectInput
): Promise<ActionResult<Project>> {
  try {
    const user = await getServerUser();
    const project = await dbUpdateProject(id, input, user);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update project." };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<boolean>> {
  try {
    const user = await getServerUser();
    await dbDeleteProject(id, user);
    revalidatePath("/projects");
    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, data: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete project." };
  }
}
