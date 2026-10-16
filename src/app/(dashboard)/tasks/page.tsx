"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Calendar,
  Clock,
  ArrowUpDown,
  Trash2,
  Edit2,
  CheckSquare,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  Circle,
  Clock3,
  CheckCircle2,
  RefreshCw,
  Columns,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { Task, TaskStatus, PriorityLevel, Project } from "@/types/saas";
import {
  getTasksAction,
  createTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/lib/actions/tasks";
import { getProjectsAction } from "@/lib/actions/projects";

function TasksPageContent() {
  const { toast } = useToast();
  const { user, requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "all";

  // Data state
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projectsList, setProjectsList] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);

  // Filters, search, pagination, view mode
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>(initialProjectId);
  const [sortBy, setSortBy] = React.useState<"createdAt" | "title" | "dueDate" | "priority">("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Active task for Edit / Delete
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Form state
  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: PriorityLevel;
    dueDate: string;
    projectId: string;
  }>({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
    projectId: "",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Fetch projects list for association dropdown
  const loadProjectsForSelect = React.useCallback(async () => {
    try {
      const res = await getProjectsAction({ limit: 100 });
      if (res.success && res.data) {
        setProjectsList(res.data.projects);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch tasks from database
  const loadTasks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTasksAction({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        projectId: projectFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      });

      if (res.success && res.data) {
        setTasks(res.data.tasks);
        setTotalCount(res.data.total);
      } else {
        toast.error("Failed to load tasks", res.error || "Unable to retrieve tasks from database.");
      }
    } catch (err: any) {
      toast.error("Database connection error", err.message || "Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, projectFilter, sortBy, sortOrder, currentPage, pageSize, toast]);

  React.useEffect(() => {
    loadProjectsForSelect();
  }, [loadProjectsForSelect]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title || formData.title.trim().length < 2) {
      errors.title = "Task title is required (at least 2 characters).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    requireAuth(() => {
      setFormData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        dueDate: "",
        projectId: projectFilter !== "all" && projectFilter !== "unassigned" ? projectFilter : "",
      });
      setFormErrors({});
      setIsCreateOpen(true);
    }, "To create a new task, please sign in or create an account.");
  };

  // Open Edit Dialog
  const handleOpenEdit = (task: Task) => {
    requireAuth(() => {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || "",
        projectId: task.projectId || "",
      });
      setFormErrors({});
      setIsEditOpen(true);
    }, "To edit tasks, please sign in to your account.");
  };

  // Open Delete Dialog
  const handleOpenDelete = (task: Task) => {
    requireAuth(() => {
      setSelectedTask(task);
      setIsDeleteOpen(true);
    }, "To delete tasks, please sign in to your account.");
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await createTaskAction({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: formData.projectId || null,
      });

      if (res.success && res.data) {
        toast.success("Task Created", `"${res.data.title}" was saved to the database.`);
        setIsCreateOpen(false);
        loadTasks();
      } else {
        toast.error("Creation Failed", res.error || "Could not save task.");
      }
    } catch (err: any) {
      toast.error("Database Error", err.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await updateTaskAction(selectedTask.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: formData.projectId || null,
      });

      if (res.success && res.data) {
        toast.success("Task Updated", `Changes to "${res.data.title}" were saved.`);
        setIsEditOpen(false);
        loadTasks();
      } else {
        toast.error("Update Failed", res.error || "Failed to save changes.");
      }
    } catch (err: any) {
      toast.error("Database Error", err.message || "Failed to update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Change Status
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    let allowed = false;
    requireAuth(() => {
      allowed = true;
    }, "To update task status, please sign in to your account.");
    if (!allowed) return;

    try {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.success && res.data) {
        toast.success("Status Updated", `Task moved to "${newStatus}".`);
        loadTasks();
      } else {
        toast.error("Failed to update status", res.error);
      }
    } catch (err: any) {
      toast.error("Database Error", err.message);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    try {
      const res = await deleteTaskAction(selectedTask.id);
      if (res.success) {
        toast.success("Task Deleted", `"${selectedTask.title}" was permanently removed.`);
        setIsDeleteOpen(false);
        loadTasks();
      } else {
        toast.error("Deletion Failed", res.error || "Unable to delete task.");
      }
    } catch (err: any) {
      toast.error("Authorization Error", err.message || "Delete operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge Helpers
  const getStatusBadge = (status: TaskStatus, taskId?: string) => {
    const s = status.toLowerCase();
    let variant: "secondary" | "warning" | "success" = "secondary";
    let icon = <Circle className="h-3 w-3 mr-1 text-slate-400" />;

    if (s.includes("progress")) {
      variant = "warning";
      icon = <Clock3 className="h-3 w-3 mr-1 text-amber-500" />;
    } else if (s.includes("done")) {
      variant = "success";
      icon = <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />;
    }

    if (!taskId) {
      return (
        <Badge variant={variant} className="capitalize">
          {icon}
          {status}
        </Badge>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors hover:opacity-80">
            {icon}
            <span>{status}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuItem
            onClick={() => handleQuickStatusChange(taskId, "Todo")}
            className="gap-2 cursor-pointer text-xs"
          >
            <Circle className="h-3.5 w-3.5 text-slate-400" />
            <span>Todo</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickStatusChange(taskId, "In Progress")}
            className="gap-2 cursor-pointer text-xs"
          >
            <Clock3 className="h-3.5 w-3.5 text-amber-500" />
            <span>In Progress</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickStatusChange(taskId, "Done")}
            className="gap-2 cursor-pointer text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Done</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    const p = priority.toLowerCase();
    switch (p) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-500 dark:text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 dark:text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Kanban Columns
  const kanbanColumns: { status: TaskStatus; title: string; count: number }[] = [
    {
      status: "Todo",
      title: "To Do",
      count: tasks.filter((t) => t.status.toLowerCase().replace(/[\s_-]+/g, "") === "todo").length,
    },
    {
      status: "In Progress",
      title: "In Progress",
      count: tasks.filter((t) => t.status.toLowerCase().replace(/[\s_-]+/g, "") === "inprogress").length,
    },
    {
      status: "Done",
      title: "Completed",
      count: tasks.filter((t) => t.status.toLowerCase().replace(/[\s_-]+/g, "") === "done").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tasks
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {totalCount} {totalCount === 1 ? "Item" : "Items"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Organize actionable work items, prioritize sprint backlogs, and link tasks to projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadTasks}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Refresh from Database"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button onClick={handleOpenCreate} className="h-9 gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, description, or project..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer max-w-[180px]"
            >
              <option value="all">All Projects</option>
              <option value="unassigned">Standalone (No Project)</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Sorting & Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 rounded-md border border-input bg-background/60 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex rounded-md border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board View"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Skeleton State */
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={CheckSquare}
          title={searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all" ? "No tasks matching criteria" : "No tasks found"}
          description={
            searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"
              ? "No tasks match your active filters. Try adjusting search or clearing selected filters."
              : "Create your first task to plan work, set priorities, and link deliverables to projects."
          }
          action={
            searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setProjectFilter("all");
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create First Task
              </Button>
            )
          }
        />
      ) : viewMode === "table" ? (
        /* Professional Table View */
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[340px]">Task Details</TableHead>
                  <TableHead>Associated Project</TableHead>
                  <TableHead>Status (Click to change)</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                    {/* Title & Description */}
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => {
                            const next = task.status.toLowerCase().includes("done") ? "Todo" : "Done";
                            handleQuickStatusChange(task.id, next);
                          }}
                          className="mt-1 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                          title="Toggle Completion"
                        >
                          {task.status.toLowerCase().includes("done") ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold text-foreground truncate ${
                              task.status.toLowerCase().includes("done") ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-sm">
                            {task.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Associated Project */}
                    <TableCell>
                      {task.projectName ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/80 px-2 py-0.5 text-xs font-medium text-foreground border border-border/80">
                          <FolderGit2 className="h-3 w-3 text-primary" />
                          {task.projectName}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Standalone</span>
                      )}
                    </TableCell>

                    {/* Interactive Status Changer */}
                    <TableCell>{getStatusBadge(task.status, task.id)}</TableCell>

                    {/* Priority */}
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>

                    {/* Due Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.dueDate ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Assignee */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground/70" />
                        {task.assigneeName || "Alexander Reed"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(task)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Task</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(task)}
                            className="cursor-pointer gap-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Task</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 py-3 gap-3 text-xs text-muted-foreground bg-muted/15">
            <div>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-foreground">{totalCount}</span> tasks
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => {
              const s = t.status.toLowerCase().replace(/[\s_-]+/g, "");
              const colS = col.status.toLowerCase().replace(/[\s_-]+/g, "");
              return s === colS;
            });

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-xl border border-border bg-card/50 p-3.5 min-h-[450px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{col.title}</span>
                    <Badge variant="outline" className="text-[11px] px-1.5 py-0">
                      {colTasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setFormData({
                        title: "",
                        description: "",
                        status: col.status,
                        priority: "Medium",
                        dueDate: "",
                        projectId: "",
                      });
                      setIsCreateOpen(true);
                    }}
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-lg">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-3 hover:border-border/90 transition-all shadow-2xs group relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                            {task.title}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 cursor-pointer"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(task)}
                                className="text-xs cursor-pointer gap-2"
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(task)}
                                className="text-xs cursor-pointer gap-2 text-rose-500 focus:text-rose-500"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}

                        {task.projectName && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                              <FolderGit2 className="h-2.5 w-2.5 text-primary" />
                              {task.projectName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 mt-2.5 text-[11px]">
                          {getPriorityBadge(task.priority)}

                          <div className="flex items-center gap-1 text-muted-foreground">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.dueDate}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Quick move buttons */}
                        <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-border/40 text-[10px]">
                          {col.status !== "Todo" && (
                            <button
                              onClick={() => handleQuickStatusChange(task.id, "Todo")}
                              className="text-muted-foreground hover:text-foreground cursor-pointer underline-offset-2 hover:underline"
                            >
                              ← Todo
                            </button>
                          )}
                          {col.status !== "In Progress" && (
                            <button
                              onClick={() => handleQuickStatusChange(task.id, "In Progress")}
                              className="text-amber-500 hover:text-amber-600 cursor-pointer underline-offset-2 hover:underline ml-2"
                            >
                              → Progress
                            </button>
                          )}
                          {col.status !== "Done" && (
                            <button
                              onClick={() => handleQuickStatusChange(task.id, "Done")}
                              className="text-emerald-500 hover:text-emerald-600 cursor-pointer underline-offset-2 hover:underline ml-2"
                            >
                              ✓ Done
                            </button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE TASK MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>Create New Task</span>
            </DialogTitle>
            <DialogDescription>
              Assign responsibilities, prioritize timeline, and optionally associate with a project.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Audit Redis Sentinel cluster failover"
                className={formErrors.title ? "border-rose-500" : ""}
              />
              {formErrors.title && (
                <p className="text-[11px] text-rose-500 font-medium">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Technical context, acceptance criteria, or links..."
                rows={3}
                className="w-full rounded-md border border-input bg-background/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Project Association */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Associated Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">None (Standalone Task)</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Status, Priority & Due Date */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="text-xs px-2"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT TASK MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              <span>Edit Task</span>
            </DialogTitle>
            <DialogDescription>
              Update task state, project association, and deadlines. Persisted immediately to database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={formErrors.title ? "border-rose-500" : ""}
              />
              {formErrors.title && (
                <p className="text-[11px] text-rose-500 font-medium">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-input bg-background/60 p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Associated Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">None (Standalone Task)</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="text-xs px-2"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-rose-500">Confirm Deletion</DialogTitle>
            <DialogDescription className="space-y-2 pt-1 text-xs">
              <p>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{selectedTask?.title}&rdquo;
                </span>
                ?
              </p>
              <p className="text-muted-foreground">
                This operation is irreversible. The task record will be removed from the database.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleDeleteSubmit}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TasksPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <TasksPageContent />
    </React.Suspense>
  );
}
