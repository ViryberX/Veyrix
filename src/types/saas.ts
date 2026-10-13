export type Role = "Owner" | "Admin" | "Member";

export type ProjectStatus =
  | "Active"
  | "Draft"
  | "Completed"
  | "Archived"
  | "active"
  | "paused"
  | "archived";

export type PriorityLevel = "Low" | "Medium" | "High";

export type TaskStatus =
  | "Todo"
  | "In Progress"
  | "Done"
  | "todo"
  | "in_progress"
  | "done";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "Starter" | "Pro" | "Scale";
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  priority?: PriorityLevel;
  startDate?: string | null;
  dueDate?: string | null;
  environment?: "production" | "staging" | "preview";
  requestsCount?: number;
  errorRate?: number;
  latencyMs?: number;
  updatedAt: string;
  createdAt: string;
  orgId?: string;
  createdBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate?: string | null;
  startDate?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  assignedTo?: string | null;
  assigneeName?: string | null;
  createdAt: string;
  updatedAt: string;
  orgId?: string;
  createdBy?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  period: string;
  description: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  activeUsers: number;
  apiRequests: number;
  latency: number;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    email?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: "deploy" | "api_key" | "billing" | "member" | "project" | "task";
  metadata?: Record<string, any>;
}

export interface DashboardOverviewData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  projectStatusDistribution: { name: string; value: number; color: string }[];
  projectCreationTrend: { date: string; count: number; activeCount: number }[];
  taskStatusDistribution: { name: string; value: number; color: string }[];
  taskPriorityDistribution: { name: string; value: number; color: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: "Active" | "Invited";
  joinedDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export interface Invoice {
  id: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  pdfUrl: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}
