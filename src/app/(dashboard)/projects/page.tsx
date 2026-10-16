"use client";

import * as React from "react";
import Link from "next/link";
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
  FolderGit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  CheckCircle2,
  ListTodo,
  RefreshCw,
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
import { Project, ProjectStatus, PriorityLevel, Role } from "@/types/saas";
import {
  getProjectsAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "@/lib/actions/projects";

export default function ProjectsPage() {
  const { toast } = useToast();
  const { user, switchDemoRole, requireAuth } = useAuth();

  // Data state
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);

  // Filters, search, pagination, view mode
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"createdAt" | "name" | "dueDate" | "priority">("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");

  // Modal dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Active item for Edit / Delete
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

  // Form fields state
  const [formData, setFormData] = React.useState<{
    name: string;
    description: string;
    status: ProjectStatus;
    priority: PriorityLevel;
    startDate: string;
    dueDate: string;
  }>({
    name: "",
    description: "",
    status: "Active",
    priority: "Medium",
    startDate: "",
    dueDate: "",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Fetch projects from database
  const loadProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProjectsAction({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      });

      if (res.success && res.data) {
        setProjects(res.data.projects);
        setTotalCount(res.data.total);
      } else {
        toast.error("Error loading projects", res.error || "Failed to load projects from database.");
      }
    } catch (err: any) {
      toast.error("Database connection error", err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, sortBy, sortOrder, currentPage, pageSize, toast]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Project name is required (at least 2 characters).";
    }
    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        errors.dueDate = "Due date cannot be earlier than start date.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    requireAuth(() => {
      setFormData({
        name: "",
        description: "",
        status: "Active",
        priority: "Medium",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "",
      });
      setFormErrors({});
      setIsCreateOpen(true);
    }, "To create a new project, please sign in or create an account.");
  };

  // Open Edit Dialog
  const handleOpenEdit = (project: Project) => {
    requireAuth(() => {
      setSelectedProject(project);
      setFormData({
        name: project.name,
        description: project.description || "",
        status: (project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase()) as ProjectStatus,
        priority: (project.priority ? (project.priority.charAt(0).toUpperCase() + project.priority.slice(1).toLowerCase()) : "Medium") as PriorityLevel,
        startDate: project.startDate || "",
        dueDate: project.dueDate || "",
      });
      setFormErrors({});
      setIsEditOpen(true);
    }, "To edit projects, please sign in to your account.");
  };

  // Open Delete Dialog
  const handleOpenDelete = (project: Project) => {
    requireAuth(() => {
      setSelectedProject(project);
      setIsDeleteOpen(true);
    }, "To delete projects, please sign in to your account.");
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await createProjectAction({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
      });

      if (res.success && res.data) {
        toast.success("Project Created", `"${res.data.name}" was successfully saved to the database.`);
        setIsCreateOpen(false);
        loadProjects();
      } else {
        toast.error("Creation Failed", res.error || "Unable to save project to database.");
      }
    } catch (err: any) {
      toast.error("Database Error", err.message || "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await updateProjectAction(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
      });

      if (res.success && res.data) {
        toast.success("Project Updated", `Changes to "${res.data.name}" were persisted to the database.`);
        setIsEditOpen(false);
        loadProjects();
      } else {
        toast.error("Update Failed", res.error || "Failed to persist changes.");
      }
    } catch (err: any) {
      toast.error("Database Error", err.message || "Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    if (!selectedProject) return;

    setIsSubmitting(true);
    try {
      const res = await deleteProjectAction(selectedProject.id);

      if (res.success) {
        toast.success("Project Deleted", `"${selectedProject.name}" has been permanently removed.`);
        setIsDeleteOpen(false);
        loadProjects();
      } else {
        toast.error("Deletion Rejected", res.error || "Unable to delete project.");
      }
    } catch (err: any) {
      toast.error("Authorization Error", err.message || "Delete operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge Helpers
  const getStatusBadge = (status: ProjectStatus) => {
    const s = status.toLowerCase();
    switch (s) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "completed":
        return <Badge variant="info">Completed</Badge>;
      case "archived":
      case "paused":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: PriorityLevel) => {
    const p = (priority || "Medium").toLowerCase();
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Projects
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {totalCount} {totalCount === 1 ? "Record" : "Records"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create, track, and manage company initiatives and infrastructure deployments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Authorization Role Indicator & Quick Switcher for testing */}
          {user && switchDemoRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Role: <span className="font-semibold">{user.role}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Simulate Authorization Role:
                </div>
                {(["Owner", "Admin", "Member"] as Role[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => {
                      switchDemoRole(r);
                      toast.info(`Switched role to ${r}`, `Permissions updated for authorization testing.`);
                    }}
                    className={user.role === r ? "font-semibold bg-accent text-accent-foreground" : ""}
                  >
                    {r} {r === "Member" && "(Cannot delete)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={loadProjects}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Refresh from Database"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button onClick={handleOpenCreate} className="h-9 gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Sorters, View Mode */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by project name or description..."
              className="pl-9 text-xs"
            />
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
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
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
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
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
              <option value="name">Name</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
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
              onClick={() => setViewMode("grid")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Skeleton Loading State */
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={FolderGit2}
          title={searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? "No matching projects" : "No projects yet"}
          description={
            searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "We couldn't find any projects matching your current filters. Try resetting search or filter options."
              : "Create your first project to get started organizing services, repositories, and deliverables."
          }
          action={
            searchQuery || statusFilter !== "all" || priorityFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create First Project
              </Button>
            )
          }
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[320px]">Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/20 transition-colors">
                    {/* Project Name & Description */}
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-secondary/60 text-primary">
                          <FolderGit2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {project.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-sm">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(project.status)}</TableCell>

                    {/* Priority */}
                    <TableCell>{getPriorityBadge(project.priority)}</TableCell>

                    {/* Start Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {project.startDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
                          {project.startDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {project.dueDate ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          {project.dueDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "—"}
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(project)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/tasks?projectId=${project.id}`} className="flex items-center gap-2">
                              <ListTodo className="h-3.5 w-3.5" />
                              <span>View Tasks</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDelete(project)}
                            className="cursor-pointer gap-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 py-3 gap-3 text-xs text-muted-foreground bg-muted/15">
            <div>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-foreground">{totalCount}</span> projects
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
        /* Grid Card View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col justify-between hover:border-border/90 transition-all shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
                        <FolderGit2 className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {project.slug}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                    <span className="text-muted-foreground">Priority:</span>
                    {getPriorityBadge(project.priority)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Due Date:</span>
                    <span>{project.dueDate || "Not set"}</span>
                  </div>
                </CardContent>
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-muted/15 text-xs">
                  <Link
                    href={`/tasks?projectId=${project.id}`}
                    className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                  >
                    <ListTodo className="h-3.5 w-3.5" />
                    <span>Tasks</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleOpenEdit(project)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => handleOpenDelete(project)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Grid View Pagination */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium text-foreground">{totalCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE PROJECT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              <span>Create New Project</span>
            </DialogTitle>
            <DialogDescription>
              Add a new project to your workspace. All fields are validated and persisted to the database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Distributed Cache Mesh"
                className={formErrors.name ? "border-rose-500" : ""}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of project scope, architecture, or objectives..."
                rows={3}
                className="w-full rounded-md border border-input bg-background/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Start Date & Due Date Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`text-xs ${formErrors.dueDate ? "border-rose-500" : ""}`}
                />
                {formErrors.dueDate && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.dueDate}</p>
                )}
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
                Save Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT PROJECT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              <span>Edit Project</span>
            </DialogTitle>
            <DialogDescription>
              Update project attributes and timeline. Changes will immediately persist to the database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "border-rose-500" : ""}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="h-9 w-full rounded-md border border-input bg-background/60 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`text-xs ${formErrors.dueDate ? "border-rose-500" : ""}`}
                />
                {formErrors.dueDate && (
                  <p className="text-[11px] text-rose-500 font-medium">{formErrors.dueDate}</p>
                )}
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
                  &ldquo;{selectedProject?.name}&rdquo;
                </span>
                ?
              </p>
              <p className="text-muted-foreground">
                This action is destructive and cannot be undone. Any tasks associated with this project will be unlinked.
              </p>
              {user?.role === "Member" && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <span className="font-medium">Note:</span> Your current role is &ldquo;Member&rdquo;. Deleting requires &ldquo;Owner&rdquo; or &ldquo;Admin&rdquo; authority.
                </div>
              )}
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
