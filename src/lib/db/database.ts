import fs from "fs";
import path from "path";
import {
  Project,
  Task,
  ProjectStatus,
  PriorityLevel,
  TaskStatus,
  Role,
  ActivityItem,
  NotificationItem,
  DashboardOverviewData,
} from "@/types/saas";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: "name" | "createdAt" | "dueDate" | "startDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  orgId?: string;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  sortBy?: "title" | "createdAt" | "dueDate" | "priority" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  orgId?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: PriorityLevel;
  startDate?: string | null;
  dueDate?: string | null;
  environment?: "production" | "staging" | "preview";
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: PriorityLevel;
  startDate?: string | null;
  dueDate?: string | null;
  environment?: "production" | "staging" | "preview";
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  dueDate?: string | null;
  startDate?: string | null;
  projectId?: string | null;
  assignedTo?: string | null;
  assigneeName?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  dueDate?: string | null;
  startDate?: string | null;
  projectId?: string | null;
  assignedTo?: string | null;
  assigneeName?: string | null;
}

interface DatabaseSchema {
  version: number;
  projects: Project[];
  tasks: Task[];
  auditLogs: {
    id: string;
    action: string;
    entity: "project" | "task";
    entityId: string;
    userId: string;
    timestamp: string;
  }[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
}

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: "act_001",
    user: { name: "Alexander Reed", email: "alexander@veyrix.io" },
    action: "completed task",
    target: "Deploy OpenTelemetry Collector DaemonSet",
    timestamp: "2 hours ago",
    type: "task",
  },
  {
    id: "act_002",
    user: { name: "Alexander Reed", email: "alexander@veyrix.io" },
    action: "updated project",
    target: "AI Inference Router",
    timestamp: "4 hours ago",
    type: "project",
  },
  {
    id: "act_003",
    user: { name: "Alexander Reed", email: "alexander@veyrix.io" },
    action: "created task",
    target: "Implement HNSW Index Partitioning",
    timestamp: "Yesterday",
    type: "task",
  },
  {
    id: "act_004",
    user: { name: "Alexander Reed", email: "alexander@veyrix.io" },
    action: "created project",
    target: "Vector Search Gateway",
    timestamp: "3 days ago",
    type: "project",
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_001",
    title: "Cluster Scaling Complete",
    description: "Vector Search Gateway edge proxies autoscaled to handle 18.4M requests.",
    timestamp: "10m ago",
    read: false,
    type: "success",
  },
  {
    id: "notif_002",
    title: "Project Milestone Reached",
    description: "GraphQL Federation has been marked as Completed.",
    timestamp: "1h ago",
    read: false,
    type: "info",
  },
  {
    id: "notif_003",
    title: "Task Approaching Due Date",
    description: "Implement HNSW Index Partitioning is due on Oct 25, 2026.",
    timestamp: "5h ago",
    read: true,
    type: "warning",
  },
];

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "veyrix.db.json");

// Initial Seed Data to ensure instant, rich, functional workspace
const SEED_PROJECTS: Project[] = [
  {
    id: "prj_001",
    name: "Vector Search Gateway",
    slug: "vector-search-gateway",
    description: "Sub-10ms semantic vector indexing and retrieval edge proxy.",
    status: "Active",
    priority: "High",
    startDate: "2026-09-01",
    dueDate: "2026-11-15",
    environment: "production",
    requestsCount: 18450000,
    errorRate: 0.02,
    latencyMs: 38,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-10-10T14:20:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "prj_002",
    name: "Event Mesh Broker",
    slug: "event-mesh-broker",
    description: "Distributed pub/sub pipeline streaming 100k events/sec.",
    status: "Active",
    priority: "High",
    startDate: "2026-09-15",
    dueDate: "2026-12-01",
    environment: "production",
    requestsCount: 14200000,
    errorRate: 0.05,
    latencyMs: 14,
    createdAt: "2026-09-15T08:30:00.000Z",
    updatedAt: "2026-10-11T12:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "prj_003",
    name: "Telemetry Engine",
    slug: "telemetry-engine",
    description: "Real-time metrics aggregator and anomaly detection cluster.",
    status: "Draft",
    priority: "Medium",
    startDate: "2026-10-01",
    dueDate: "2026-11-30",
    environment: "staging",
    requestsCount: 2100000,
    errorRate: 0.12,
    latencyMs: 52,
    createdAt: "2026-10-01T11:15:00.000Z",
    updatedAt: "2026-10-09T09:40:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "prj_004",
    name: "GraphQL Federation",
    slug: "graphql-federation",
    description: "Unified schema stitcher across microservices and external APIs.",
    status: "Completed",
    priority: "Medium",
    startDate: "2026-07-01",
    dueDate: "2026-09-30",
    environment: "production",
    requestsCount: 8900000,
    errorRate: 0.01,
    latencyMs: 29,
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-09-30T18:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "prj_005",
    name: "Legacy Auth Proxy",
    slug: "legacy-auth-proxy",
    description: "Deprecated authentication relay slated for decommission.",
    status: "Archived",
    priority: "Low",
    startDate: "2025-11-01",
    dueDate: "2026-03-31",
    environment: "preview",
    requestsCount: 310000,
    errorRate: 1.45,
    latencyMs: 98,
    createdAt: "2025-11-01T14:00:00.000Z",
    updatedAt: "2026-04-01T08:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "prj_006",
    name: "AI Inference Router",
    slug: "ai-inference-router",
    description: "Smart fallback load balancer for multi-model LLM endpoints.",
    status: "Active",
    priority: "High",
    startDate: "2026-10-05",
    dueDate: "2026-12-15",
    environment: "staging",
    requestsCount: 540000,
    errorRate: 0.03,
    latencyMs: 44,
    createdAt: "2026-10-05T13:20:00.000Z",
    updatedAt: "2026-10-11T16:45:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
];

const SEED_TASKS: Task[] = [
  {
    id: "tsk_001",
    title: "Implement HNSW Index Partitioning",
    description: "Split high-dimensional index across regional memory tiers for faster retrieval.",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-10-25",
    projectId: "prj_001",
    projectName: "Vector Search Gateway",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-10T14:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_002",
    title: "Optimize gRPC Connection Pooling",
    description: "Benchmark HTTP/2 stream multiplexing and adjust keepalive pings.",
    status: "Todo",
    priority: "High",
    dueDate: "2026-10-28",
    projectId: "prj_001",
    projectName: "Vector Search Gateway",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-10-03T11:30:00.000Z",
    updatedAt: "2026-10-03T11:30:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_003",
    title: "Configure Kafka Consumer Backpressure",
    description: "Prevent memory saturation during traffic spikes by dynamic rate limiting.",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2026-11-05",
    projectId: "prj_002",
    projectName: "Event Mesh Broker",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-10-04T09:15:00.000Z",
    updatedAt: "2026-10-11T10:20:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_004",
    title: "Deploy OpenTelemetry Collector DaemonSet",
    description: "Scrape Kubernetes container metrics and stream to central clickhouse cluster.",
    status: "Done",
    priority: "Medium",
    dueDate: "2026-10-08",
    projectId: "prj_003",
    projectName: "Telemetry Engine",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-09-28T14:00:00.000Z",
    updatedAt: "2026-10-08T17:30:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_005",
    title: "Audit Schema Security & Field Directives",
    description: "Verify role-based permission headers are checked at GraphQL subgraphs.",
    status: "Done",
    priority: "Low",
    dueDate: "2026-09-25",
    projectId: "prj_004",
    projectName: "GraphQL Federation",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-09-25T16:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_006",
    title: "Setup LLM Latency & Cost Tracking",
    description: "Track prompt/completion token consumption per project workspace.",
    status: "Todo",
    priority: "High",
    dueDate: "2026-11-12",
    projectId: "prj_006",
    projectName: "AI Inference Router",
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-10-06T15:00:00.000Z",
    updatedAt: "2026-10-06T15:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
  {
    id: "tsk_007",
    title: "Upgrade Root TLS Certificates",
    description: "Rotate wildcard TLS certificates ahead of yearly expiration.",
    status: "Todo",
    priority: "Low",
    dueDate: "2026-11-20",
    projectId: null,
    projectName: null,
    assignedTo: "usr_veyrix_991",
    assigneeName: "Alexander Reed",
    createdAt: "2026-10-08T10:00:00.000Z",
    updatedAt: "2026-10-08T10:00:00.000Z",
    orgId: "ws_prod_01",
    createdBy: "usr_veyrix_991",
  },
];

// Helper to ensure database directory exists and load data
function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        version: 1,
        projects: SEED_PROJECTS,
        tasks: SEED_TASKS,
        auditLogs: [],
        activities: SEED_ACTIVITIES,
        notifications: SEED_NOTIFICATIONS,
      };
      saveDatabase(initialDb);
      return initialDb;
    }

    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content) as DatabaseSchema;
    if (!parsed.activities) {
      parsed.activities = SEED_ACTIVITIES;
    }
    if (!parsed.notifications) {
      parsed.notifications = SEED_NOTIFICATIONS;
    }
    return parsed;
  } catch (error) {
    console.error("[Database] Error reading database file:", error);
    return {
      version: 1,
      projects: SEED_PROJECTS,
      tasks: SEED_TASKS,
      auditLogs: [],
      activities: SEED_ACTIVITIES,
      notifications: SEED_NOTIFICATIONS,
    };
  }
}

// Atomic file write to avoid corruptions
function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error("[Database] Error writing database file:", error);
    throw new Error("Failed to persist database changes to disk.");
  }
}

// Check authorization helper
export function checkAuthorization(
  user: UserContext | null | undefined,
  requiredRoles: Role[] = ["Owner", "Admin", "Member"]
): void {
  if (!user) {
    throw new Error("Authentication required: Please log in to perform this operation.");
  }
  if (!requiredRoles.includes(user.role)) {
    throw new Error(
      `Unauthorized: Role "${user.role}" does not have permission for this operation. Required: ${requiredRoles.join(
        " or "
      )}.`
    );
  }
}

// ============================================================================
// PROJECTS DATABASE OPERATIONS
// ============================================================================

export async function dbGetProjects(
  filters: ProjectFilters = {},
  user?: UserContext
): Promise<{ projects: Project[]; total: number; page: number; totalPages: number }> {
  // If Supabase is configured with credentials, we query Supabase
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    try {
      let query = supabase.from("projects").select("*", { count: "exact" });
      if (filters.status && filters.status !== "all") {
        query = query.ilike("status", filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      const page = Math.max(1, filters.page || 1);
      const limit = Math.max(1, filters.limit || 10);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        const mapped: Project[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          description: d.description || "",
          status: (d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Active") as ProjectStatus,
          priority: (d.priority ? d.priority.charAt(0).toUpperCase() + d.priority.slice(1) : "Medium") as PriorityLevel,
          startDate: d.start_date || null,
          dueDate: d.due_date || null,
          environment: d.environment || "production",
          requestsCount: Number(d.requests_count || 0),
          errorRate: Number(d.error_rate || 0),
          latencyMs: Number(d.latency_ms || 30),
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          orgId: d.org_id,
          createdBy: d.created_by,
        }));
        return {
          projects: mapped,
          total: count || mapped.length,
          page,
          totalPages: Math.ceil((count || mapped.length) / limit),
        };
      }
    } catch (err) {
      console.warn("[Supabase] Query failed, falling back to persistent disk store:", err);
    }
  }

  // Persistent server database
  const db = getDatabase();
  let list = [...db.projects];

  // Filter by search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Filter by status
  if (filters.status && filters.status !== "all") {
    const s = filters.status.toLowerCase();
    list = list.filter((p) => p.status.toLowerCase() === s);
  }

  // Filter by priority
  if (filters.priority && filters.priority !== "all") {
    const pr = filters.priority.toLowerCase();
    list = list.filter((p) => p.priority && p.priority.toLowerCase() === pr);
  }

  // Sorting
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  list.sort((a, b) => {
    let valA = (a as any)[sortBy] || "";
    let valB = (b as any)[sortBy] || "";

    if (sortBy === "priority") {
      const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      valA = priorityWeights[a.priority || "Medium"] || 0;
      valB = priorityWeights[b.priority || "Medium"] || 0;
      return (valA - valB) * sortOrder;
    }

    if (typeof valA === "string") {
      return valA.localeCompare(valB) * sortOrder;
    }
    return (valA - valB) * sortOrder;
  });

  const total = list.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 10);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedProjects = list.slice(startIndex, startIndex + limit);

  return {
    projects: paginatedProjects,
    total,
    page,
    totalPages,
  };
}

export async function dbGetProjectById(id: string): Promise<Project | null> {
  const db = getDatabase();
  return db.projects.find((p) => p.id === id) || null;
}

export async function dbCreateProject(
  input: CreateProjectInput,
  user: UserContext
): Promise<Project> {
  checkAuthorization(user, ["Owner", "Admin", "Member"]);

  // Validation
  if (!input.name || input.name.trim().length < 2) {
    throw new Error("Project name is required and must be at least 2 characters.");
  }

  if (input.startDate && input.dueDate) {
    if (new Date(input.dueDate) < new Date(input.startDate)) {
      throw new Error("Due date cannot be before the start date.");
    }
  }

  const validStatuses = ["Active", "Draft", "Completed", "Archived", "active", "paused", "archived"];
  const rawStatus = input.status || "Active";
  const formattedStatus: ProjectStatus = (
    rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
  ) as ProjectStatus;

  const validPriorities = ["Low", "Medium", "High"];
  const rawPriority = input.priority || "Medium";
  const formattedPriority: PriorityLevel = (
    rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase()
  ) as PriorityLevel;

  const now = new Date().toISOString();
  const id = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newProject: Project = {
    id,
    name: input.name.trim(),
    slug: slug || `project-${id}`,
    description: input.description?.trim() || "",
    status: formattedStatus,
    priority: formattedPriority,
    startDate: input.startDate || null,
    dueDate: input.dueDate || null,
    environment: input.environment || "production",
    requestsCount: 0,
    errorRate: 0.0,
    latencyMs: 32,
    createdAt: now,
    updatedAt: now,
    orgId: user.orgId || "ws_prod_01",
    createdBy: user.id,
  };

  // Check Supabase if configured
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("projects").insert({
        name: newProject.name,
        slug: newProject.slug,
        description: newProject.description,
        status: newProject.status.toLowerCase(),
        priority: (newProject.priority || "Medium").toLowerCase(),
        start_date: newProject.startDate,
        due_date: newProject.dueDate,
        environment: newProject.environment,
        org_id: user.orgId || "ws_prod_01",
      });
    } catch (err) {
      console.warn("[Supabase] Insert failed, persisting to server DB:", err);
    }
  }

  const db = getDatabase();
  db.projects.unshift(newProject);
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "create",
    entity: "project",
    entityId: newProject.id,
    userId: user.id,
    timestamp: now,
  });

  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: "created project",
    target: newProject.name,
    timestamp: "Just now",
    type: "project",
  });

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    title: "New Project Created",
    description: `${user.name} created project "${newProject.name}".`,
    timestamp: "Just now",
    read: false,
    type: "info",
  });

  saveDatabase(db);
  return newProject;
}

export async function dbUpdateProject(
  id: string,
  input: UpdateProjectInput,
  user: UserContext
): Promise<Project> {
  checkAuthorization(user, ["Owner", "Admin", "Member"]);

  const db = getDatabase();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project with ID "${id}" was not found.`);
  }

  const existing = db.projects[index];

  if (input.name !== undefined && input.name.trim().length < 2) {
    throw new Error("Project name must be at least 2 characters.");
  }

  const startDate = input.startDate !== undefined ? input.startDate : existing.startDate;
  const dueDate = input.dueDate !== undefined ? input.dueDate : existing.dueDate;

  if (startDate && dueDate) {
    if (new Date(dueDate) < new Date(startDate)) {
      throw new Error("Due date cannot be before the start date.");
    }
  }

  const formattedStatus: ProjectStatus = input.status
    ? ((input.status.charAt(0).toUpperCase() + input.status.slice(1).toLowerCase()) as ProjectStatus)
    : existing.status;

  const formattedPriority: PriorityLevel = input.priority
    ? ((input.priority.charAt(0).toUpperCase() + input.priority.slice(1).toLowerCase()) as PriorityLevel)
    : (existing.priority || "Medium");

  const now = new Date().toISOString();
  const updatedProject: Project = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    status: formattedStatus,
    priority: formattedPriority,
    startDate: startDate || null,
    dueDate: dueDate || null,
    environment: input.environment || existing.environment,
    updatedAt: now,
  };

  db.projects[index] = updatedProject;

  // Also update tasks that reference this project if project name changed
  if (input.name && input.name.trim() !== existing.name) {
    db.tasks.forEach((t) => {
      if (t.projectId === id) {
        t.projectName = updatedProject.name;
        t.updatedAt = now;
      }
    });
  }

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "update",
    entity: "project",
    entityId: id,
    userId: user.id,
    timestamp: now,
  });

  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: updatedProject.status === "Completed" ? "completed project" : "updated project",
    target: updatedProject.name,
    timestamp: "Just now",
    type: "project",
  });

  saveDatabase(db);
  return updatedProject;
}

export async function dbDeleteProject(id: string, user: UserContext): Promise<boolean> {
  // Authorization check: Only Owners and Admins are permitted to delete projects!
  if (user.role === "Member") {
    throw new Error("Unauthorized: Only workspace Owners and Admins have permission to delete projects.");
  }
  checkAuthorization(user, ["Owner", "Admin"]);

  const db = getDatabase();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project with ID "${id}" was not found.`);
  }

  const existingProjectName = db.projects[index].name;

  // Remove project
  db.projects.splice(index, 1);

  // Unlink associated tasks (or delete cascade)
  db.tasks.forEach((t) => {
    if (t.projectId === id) {
      t.projectId = null;
      t.projectName = null;
    }
  });

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "delete",
    entity: "project",
    entityId: id,
    userId: user.id,
    timestamp: new Date().toISOString(),
  });

  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: "deleted project",
    target: existingProjectName,
    timestamp: "Just now",
    type: "project",
  });

  saveDatabase(db);
  return true;
}

// ============================================================================
// TASKS DATABASE OPERATIONS
// ============================================================================

export async function dbGetTasks(
  filters: TaskFilters = {},
  user?: UserContext
): Promise<{ tasks: Task[]; total: number; page: number; totalPages: number }> {
  const db = getDatabase();
  let list = [...db.tasks];

  // Filter by project
  if (filters.projectId && filters.projectId !== "all") {
    if (filters.projectId === "unassigned") {
      list = list.filter((t) => !t.projectId);
    } else {
      list = list.filter((t) => t.projectId === filters.projectId);
    }
  }

  // Filter by search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q))
    );
  }

  // Filter by status
  if (filters.status && filters.status !== "all") {
    const s = filters.status.toLowerCase().replace(/[\s_-]+/g, "");
    list = list.filter((t) => t.status.toLowerCase().replace(/[\s_-]+/g, "") === s);
  }

  // Filter by priority
  if (filters.priority && filters.priority !== "all") {
    const pr = filters.priority.toLowerCase();
    list = list.filter((t) => t.priority.toLowerCase() === pr);
  }

  // Sorting
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  list.sort((a, b) => {
    let valA = (a as any)[sortBy] || "";
    let valB = (b as any)[sortBy] || "";

    if (sortBy === "priority") {
      const weights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      valA = weights[a.priority] || 0;
      valB = weights[b.priority] || 0;
      return (valA - valB) * sortOrder;
    }

    if (typeof valA === "string") {
      return valA.localeCompare(valB) * sortOrder;
    }
    return (valA - valB) * sortOrder;
  });

  const total = list.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 10);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedTasks = list.slice(startIndex, startIndex + limit);

  return {
    tasks: paginatedTasks,
    total,
    page,
    totalPages,
  };
}

export async function dbGetTaskById(id: string): Promise<Task | null> {
  const db = getDatabase();
  return db.tasks.find((t) => t.id === id) || null;
}

export async function dbCreateTask(
  input: CreateTaskInput,
  user: UserContext
): Promise<Task> {
  checkAuthorization(user, ["Owner", "Admin", "Member"]);

  if (!input.title || input.title.trim().length < 2) {
    throw new Error("Task title is required and must be at least 2 characters.");
  }

  const db = getDatabase();
  let projectName: string | null = null;
  if (input.projectId) {
    const project = db.projects.find((p) => p.id === input.projectId);
    if (!project) {
      throw new Error(`Selected project with ID "${input.projectId}" does not exist.`);
    }
    projectName = project.name;
  }

  const rawStatus = input.status || "Todo";
  let formattedStatus: TaskStatus = "Todo";
  const sLower = rawStatus.toLowerCase();
  if (sLower.includes("progress")) formattedStatus = "In Progress";
  else if (sLower.includes("done")) formattedStatus = "Done";
  else formattedStatus = "Todo";

  const rawPriority = input.priority || "Medium";
  const formattedPriority: PriorityLevel = (
    rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase()
  ) as PriorityLevel;

  const now = new Date().toISOString();
  const id = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newTask: Task = {
    id,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    status: formattedStatus,
    priority: formattedPriority,
    dueDate: input.dueDate || null,
    startDate: input.startDate || null,
    projectId: input.projectId || null,
    projectName,
    assignedTo: input.assignedTo || user.id,
    assigneeName: input.assigneeName || user.name,
    createdAt: now,
    updatedAt: now,
    orgId: user.orgId || "ws_prod_01",
    createdBy: user.id,
  };

  db.tasks.unshift(newTask);
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "create",
    entity: "task",
    entityId: newTask.id,
    userId: user.id,
    timestamp: now,
  });

  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: "created task",
    target: newTask.title,
    timestamp: "Just now",
    type: "task",
  });

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    title: "New Task Created",
    description: `${user.name} created task "${newTask.title}".`,
    timestamp: "Just now",
    read: false,
    type: "info",
  });

  saveDatabase(db);
  return newTask;
}

export async function dbUpdateTask(
  id: string,
  input: UpdateTaskInput,
  user: UserContext
): Promise<Task> {
  checkAuthorization(user, ["Owner", "Admin", "Member"]);

  const db = getDatabase();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Task with ID "${id}" was not found.`);
  }

  const existing = db.tasks[index];

  if (input.title !== undefined && input.title.trim().length < 2) {
    throw new Error("Task title must be at least 2 characters.");
  }

  let projectName = existing.projectName;
  if (input.projectId !== undefined) {
    if (input.projectId === null || input.projectId === "") {
      projectName = null;
    } else {
      const proj = db.projects.find((p) => p.id === input.projectId);
      if (!proj) {
        throw new Error(`Selected project with ID "${input.projectId}" does not exist.`);
      }
      projectName = proj.name;
    }
  }

  let formattedStatus = existing.status;
  if (input.status) {
    const sLower = input.status.toLowerCase();
    if (sLower.includes("progress")) formattedStatus = "In Progress";
    else if (sLower.includes("done")) formattedStatus = "Done";
    else formattedStatus = "Todo";
  }

  const formattedPriority = input.priority
    ? ((input.priority.charAt(0).toUpperCase() + input.priority.slice(1).toLowerCase()) as PriorityLevel)
    : existing.priority;

  const now = new Date().toISOString();
  const updatedTask: Task = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    status: formattedStatus,
    priority: formattedPriority,
    dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
    startDate: input.startDate !== undefined ? input.startDate : existing.startDate,
    projectId: input.projectId !== undefined ? input.projectId : existing.projectId,
    projectName,
    assignedTo: input.assignedTo !== undefined ? input.assignedTo : existing.assignedTo,
    assigneeName: input.assigneeName !== undefined ? input.assigneeName : existing.assigneeName,
    updatedAt: now,
  };

  db.tasks[index] = updatedTask;
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "update",
    entity: "task",
    entityId: id,
    userId: user.id,
    timestamp: now,
  });

  const isCompleted = formattedStatus.toLowerCase().includes("done");
  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: isCompleted ? "completed task" : "updated task",
    target: updatedTask.title,
    timestamp: "Just now",
    type: "task",
  });

  if (isCompleted) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: "Task Completed",
      description: `${user.name} completed "${updatedTask.title}".`,
      timestamp: "Just now",
      read: false,
      type: "success",
    });
  }

  saveDatabase(db);
  return updatedTask;
}

export async function dbDeleteTask(id: string, user: UserContext): Promise<boolean> {
  checkAuthorization(user, ["Owner", "Admin", "Member"]);

  const db = getDatabase();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(`Task with ID "${id}" was not found.`);
  }

  const existingTitle = db.tasks[index].title;

  db.tasks.splice(index, 1);
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "delete",
    entity: "task",
    entityId: id,
    userId: user.id,
    timestamp: new Date().toISOString(),
  });

  db.activities.unshift({
    id: `act_${Date.now()}`,
    user: { name: user.name, email: user.email },
    action: "deleted task",
    target: existingTitle,
    timestamp: "Just now",
    type: "task",
  });

  saveDatabase(db);
  return true;
}

// ============================================================================
// ACTIVITIES & AUDIT STREAM OPERATIONS
// ============================================================================

export async function dbGetActivities(
  user?: UserContext,
  limit: number = 20
): Promise<ActivityItem[]> {
  const db = getDatabase();
  return (db.activities || []).slice(0, limit);
}

// ============================================================================
// NOTIFICATIONS OPERATIONS
// ============================================================================

export async function dbGetNotifications(
  user?: UserContext
): Promise<NotificationItem[]> {
  const db = getDatabase();
  return db.notifications || [];
}

export async function dbMarkNotificationRead(
  id: string,
  user?: UserContext
): Promise<boolean> {
  const db = getDatabase();
  const notif = (db.notifications || []).find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function dbMarkAllNotificationsRead(
  user?: UserContext
): Promise<boolean> {
  const db = getDatabase();
  (db.notifications || []).forEach((n) => {
    n.read = true;
  });
  saveDatabase(db);
  return true;
}

// ============================================================================
// OVERVIEW & REAL DATABASE ANALYTICS CALCULATIONS
// ============================================================================

export async function dbGetOverviewMetrics(
  filters: { timeRange?: string; startDate?: string; endDate?: string } = {},
  user?: UserContext
): Promise<DashboardOverviewData> {
  const db = getDatabase();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  let cutoffDate: Date | null = null;
  const tr = filters.timeRange || "ALL";

  if (tr === "7D") {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (tr === "30D") {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (tr === "90D") {
    cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (tr === "1Y") {
    cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  } else if (filters.startDate) {
    cutoffDate = new Date(filters.startDate);
  }

  // Filter projects by time range
  let projects = [...db.projects];
  let tasks = [...db.tasks];

  if (cutoffDate) {
    projects = projects.filter((p) => new Date(p.createdAt) >= cutoffDate!);
    tasks = tasks.filter((t) => new Date(t.createdAt) >= cutoffDate!);
  }

  // 1. Projects Statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status.toLowerCase() === "active"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status.toLowerCase() === "completed"
  ).length;
  const overdueProjects = projects.filter(
    (p) =>
      p.dueDate &&
      p.dueDate < todayStr &&
      p.status.toLowerCase() !== "completed" &&
      p.status.toLowerCase() !== "archived"
  ).length;

  // 2. Tasks Statistics
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) =>
    t.status.toLowerCase().includes("progress")
  ).length;
  const completedTasks = tasks.filter((t) =>
    t.status.toLowerCase().includes("done")
  ).length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.dueDate < todayStr &&
      !t.status.toLowerCase().includes("done")
  ).length;

  // 3. Project Status Distribution
  const draftProjects = projects.filter(
    (p) => p.status.toLowerCase() === "draft"
  ).length;
  const archivedProjects = projects.filter(
    (p) =>
      p.status.toLowerCase() === "archived" ||
      p.status.toLowerCase() === "paused"
  ).length;

  const projectStatusDistribution = [
    { name: "Active", value: activeProjects, color: "#10b981" },
    { name: "Draft", value: draftProjects, color: "#64748b" },
    { name: "Completed", value: completedProjects, color: "#3b82f6" },
    { name: "Archived", value: archivedProjects, color: "#f59e0b" },
  ].filter((item) => totalProjects === 0 || item.value > 0);

  // 4. Project Creation Trend
  const trendMap: Record<string, { count: number; activeCount: number }> = {};
  projects.forEach((p) => {
    const d = new Date(p.createdAt);
    const key =
      tr === "7D" || tr === "30D"
        ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (!trendMap[key]) {
      trendMap[key] = { count: 0, activeCount: 0 };
    }
    trendMap[key].count += 1;
    if (p.status.toLowerCase() === "active") {
      trendMap[key].activeCount += 1;
    }
  });

  const projectCreationTrend = Object.keys(trendMap).map((date) => ({
    date,
    count: trendMap[date].count,
    activeCount: trendMap[date].activeCount,
  }));

  // 5. Task Status Distribution
  const todoTasks = tasks.filter(
    (t) =>
      !t.status.toLowerCase().includes("progress") &&
      !t.status.toLowerCase().includes("done")
  ).length;

  const taskStatusDistribution = [
    { name: "To Do", value: todoTasks, color: "#94a3b8" },
    { name: "In Progress", value: inProgressTasks, color: "#f59e0b" },
    { name: "Completed", value: completedTasks, color: "#10b981" },
  ].filter((item) => totalTasks === 0 || item.value > 0);

  // 6. Task Priority Breakdown
  const highPriority = tasks.filter(
    (t) => t.priority.toLowerCase() === "high"
  ).length;
  const mediumPriority = tasks.filter(
    (t) => t.priority.toLowerCase() === "medium"
  ).length;
  const lowPriority = tasks.filter(
    (t) => t.priority.toLowerCase() === "low"
  ).length;

  const taskPriorityDistribution = [
    { name: "High", value: highPriority, color: "#f43f5e" },
    { name: "Medium", value: mediumPriority, color: "#f59e0b" },
    { name: "Low", value: lowPriority, color: "#3b82f6" },
  ].filter((item) => totalTasks === 0 || item.value > 0);

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    overdueProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    projectStatusDistribution,
    projectCreationTrend,
    taskStatusDistribution,
    taskPriorityDistribution,
  };
}
