"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  FolderGit2,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  BarChart3,
  ListTodo,
  TrendingUp,
  Shield,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ProjectsOverviewChart } from "@/components/dashboard/projects-overview-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HeroBanner } from "@/components/dashboard/hero-banner";
import { DashboardOverviewData } from "@/types/saas";
import { getOverviewMetricsAction } from "@/lib/actions/overview";

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = React.useState<DashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState<string>("ALL");

  const loadMetrics = React.useCallback(async (range: string) => {
    setIsLoading(true);
    try {
      const res = await getOverviewMetricsAction(range);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error("Failed to load statistics", res.error);
      }
    } catch (err: any) {
      toast.error("Database connection error", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadMetrics(timeRange);
  }, [loadMetrics, timeRange]);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
  };

  return (
    <div className="space-y-6">
      {/* Brand Hero Banner */}
      <HeroBanner />

      {/* Top Welcome & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard Overview
            </h1>
            <Badge variant="success" className="text-[11px] font-mono px-2 py-0.5">
              Live Database
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time project telemetry, workload metrics, and organizational activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMetrics(timeRange)}
            className="h-9 gap-1.5"
            title="Refresh statistics from database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5">
            <Link href="/tasks">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span>New Task</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 shadow-sm">
            <Link href="/projects">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Primary Metric Cards: Total, Active, Completed, Overdue */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card className="p-4 hover:border-border/80 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground font-mono">
                  {data?.totalProjects ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">projects registered</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
            <span>Workload Capacity:</span>
            <span className="font-semibold text-foreground">
              {data && data.totalProjects > 0 ? "Operational" : "No records"}
            </span>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="p-4 hover:border-border/80 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-500 font-mono">
                  {data?.activeProjects ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">currently active</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
            <span>Share of Total:</span>
            <span className="font-semibold text-foreground font-mono">
              {data && data.totalProjects > 0
                ? `${Math.round((data.activeProjects / data.totalProjects) * 100)}%`
                : "0%"}
            </span>
          </div>
        </Card>

        {/* Completed Projects */}
        <Card className="p-4 hover:border-border/80 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-500 font-mono">
                  {data?.completedProjects ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">deliverables finished</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
            <span>Completion Rate:</span>
            <span className="font-semibold text-foreground font-mono">
              {data && data.totalProjects > 0
                ? `${Math.round((data.completedProjects / data.totalProjects) * 100)}%`
                : "0%"}
            </span>
          </div>
        </Card>

        {/* Overdue Projects */}
        <Card className="p-4 hover:border-border/80 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Overdue Projects
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-500 font-mono">
                  {data?.overdueProjects ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">past due deadline</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
            <span>Attention Required:</span>
            <span className="font-semibold text-foreground font-mono">
              {data && data.overdueProjects > 0 ? "Immediate Action" : "All On Track"}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Activity Stream Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <ProjectsOverviewChart
          data={data}
          isLoading={isLoading}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
        <ActivityFeed />
      </div>

      {/* Quick Actions Shortcuts & Tasks Summary Banner */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Quick Actions Panel */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-500" />
                Quick Actions
              </span>
              <Badge variant="outline" className="text-[10px]">Shortcuts</Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Direct access to create and manage foundational resources.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild size="sm" variant="secondary" className="h-8 text-xs justify-start px-2.5">
              <Link href="/projects">
                <FolderGit2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                Projects
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-8 text-xs justify-start px-2.5">
              <Link href="/tasks">
                <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                Task Board
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-8 text-xs justify-start px-2.5">
              <Link href="/analytics">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Analytics
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-8 text-xs justify-start px-2.5">
              <Link href="/settings">
                <Shield className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Settings
              </Link>
            </Button>
          </div>
        </Card>

        {/* Real Task Execution Overview */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-blue-500" />
                Task Deliverables
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {data?.totalTasks ?? 0} Total
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Calculated real execution breakdown from tasks database.
            </p>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                In Progress:
              </span>
              <span className="font-semibold text-foreground font-mono">
                {data?.inProgressTasks ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Completed:
              </span>
              <span className="font-semibold text-foreground font-mono">
                {data?.completedTasks ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Overdue:
              </span>
              <span className="font-semibold text-foreground font-mono">
                {data?.overdueTasks ?? 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Database & Authorization Status */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                Data Integrity
              </span>
              <Badge variant="success" className="text-[10px]">Verified</Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              All statistical aggregates are computed synchronously against durable persistent storage.
            </p>
          </div>

          <div className="mt-4 border-t border-border/50 pt-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Workspace Storage:</span>
            <Link
              href="/analytics"
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>Explore Analytics</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
