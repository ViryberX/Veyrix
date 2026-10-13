"use client";

import * as React from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Download,
  Calendar,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  CheckSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ListFilter,
  Flame,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOverviewMetricsAction } from "@/lib/actions/overview";
import { DashboardOverviewData } from "@/types/saas";

export default function AnalyticsPage() {
  const [mounted, setMounted] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<"7D" | "30D" | "90D" | "1Y" | "ALL">("30D");
  const [data, setData] = React.useState<DashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMetrics = React.useCallback(async (range: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getOverviewMetricsAction(range);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load database analytics.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    fetchMetrics(timeRange);
  }, [fetchMetrics, timeRange]);

  const handleTimeRangeChange = (range: "7D" | "30D" | "90D" | "1Y" | "ALL") => {
    setTimeRange(range);
  };

  const handleExportCSV = () => {
    if (!data) return;

    const summaryRows = [
      ["Metric", "Value"],
      ["Time Range", timeRange],
      ["Total Projects", data.totalProjects],
      ["Active Projects", data.activeProjects],
      ["Completed Projects", data.completedProjects],
      ["Overdue Projects", data.overdueProjects],
      ["Total Tasks", data.totalTasks],
      ["In Progress Tasks", data.inProgressTasks],
      ["Completed Tasks", data.completedTasks],
      ["Overdue Tasks", data.overdueTasks],
      [],
      ["Project Status", "Count"],
      ...data.projectStatusDistribution.map((s) => [s.name, s.value]),
      [],
      ["Task Status", "Count"],
      ...data.taskStatusDistribution.map((s) => [s.name, s.value]),
      [],
      ["Task Priority", "Count"],
      ...data.taskPriorityDistribution.map((p) => [p.name, p.value]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      summaryRows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `veyrix-analytics-${timeRange.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const projectCompletionRate =
    data && data.totalProjects > 0
      ? Math.round((data.completedProjects / data.totalProjects) * 100)
      : 0;

  const taskCompletionRate =
    data && data.totalTasks > 0
      ? Math.round((data.completedTasks / data.totalTasks) * 100)
      : 0;

  const totalOverdue = (data?.overdueProjects || 0) + (data?.overdueTasks || 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Workspace Analytics & Metrics
            </h1>
            <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider font-semibold">
              Live Database
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real delivery velocity, project statuses, and task throughput calculated directly from authorized workspace records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range switcher */}
          <div className="flex items-center rounded-lg bg-secondary/80 p-0.5 border border-border/60">
            {(["7D", "30D", "90D", "1Y", "ALL"] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  timeRange === range
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "ALL" ? "All Time" : range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!data || isLoading}
            className="cursor-pointer"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchMetrics(timeRange)}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Highlights: Real database counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Projects */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Projects</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FolderGit2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {isLoading || !data ? <Skeleton className="h-7 w-12 inline-block" /> : data.activeProjects}
              </span>
              <span className="text-xs text-muted-foreground">
                of {data?.totalProjects || 0} total
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data && data.totalProjects > 0
                ? `${Math.round((data.activeProjects / data.totalProjects) * 100)}% of portfolio currently active`
                : "No active projects"}
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Project Completion */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Project Completion</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {isLoading || !data ? <Skeleton className="h-7 w-12 inline-block" /> : `${projectCompletionRate}%`}
              </span>
              <span className="text-xs text-muted-foreground">
                {data?.completedProjects || 0} completed
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${projectCompletionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Task Throughput */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Task Throughput</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {isLoading || !data ? <Skeleton className="h-7 w-12 inline-block" /> : `${taskCompletionRate}%`}
              </span>
              <span className="text-xs text-muted-foreground">
                {data?.completedTasks || 0} of {data?.totalTasks || 0} closed
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Overdue Deliverables */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Overdue Deliverables</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                totalOverdue > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground"
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${totalOverdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                {isLoading || !data ? <Skeleton className="h-7 w-12 inline-block" /> : totalOverdue}
              </span>
              <span className="text-xs text-muted-foreground">past due date</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data ? `${data.overdueProjects} projects, ${data.overdueTasks} tasks` : "Checking schedule..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend: Project Creation Volume over Time */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Project Creation & Velocity Trend
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Historical count of new projects initiated during the selected {timeRange} range
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-[11px] font-mono">
            {data?.projectCreationTrend.reduce((acc, curr) => acc + curr.count, 0) || 0} Created in Window
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-[290px] w-full pt-2">
            {!mounted || isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : !data || data.projectCreationTrend.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-6">
                <FolderGit2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground">No project creations recorded in this time range</p>
                <p className="mt-1">Try switching to &quot;All Time&quot; or create a project to generate velocity trends.</p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/projects">Create Project</Link>
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.projectCreationTrend}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-xs text-xs font-mono">
                            <p className="font-semibold text-foreground mb-1">Period: {label}</p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                              <span>Projects Added:</span>
                              <span>{payload[0].value}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Projects Created"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Grid: Project Status Distribution & Task Status Distribution */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart 1: Project Status Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Project Status Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Portfolio balance across Active, Draft, Completed, and Archived states
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {data?.totalProjects || 0} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              {!mounted || isLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : !data || data.projectStatusDistribution.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-6">
                  <p className="font-semibold text-foreground">No projects found</p>
                  <p className="mt-1">Add your first project to view status distributions.</p>
                </div>
              ) : (
                <div className="flex h-full flex-col sm:flex-row items-center justify-around gap-4">
                  <div className="h-[220px] w-full sm:w-[55%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.projectStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.projectStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0];
                              const total = data.totalProjects || 1;
                              const pct = Math.round(((Number(item.value) || 0) / total) * 100);
                              return (
                                <div className="rounded-lg border border-border bg-popover/95 p-2 shadow-lg text-xs">
                                  <span className="font-semibold text-foreground">{item.name}:</span>{" "}
                                  <span className="font-bold">{item.value} Projects ({pct}%)</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs w-full sm:w-[45%] pr-2">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Status Breakdown
                    </p>
                    {data.projectStatusDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground font-mono">
                          {item.value} ({Math.round((item.value / Math.max(1, data.totalProjects)) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Task Status Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Task Status Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  Workload stages across To Do, In Progress, and Completed
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {data?.totalTasks || 0} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              {!mounted || isLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : !data || data.taskStatusDistribution.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-6">
                  <p className="font-semibold text-foreground">No tasks found</p>
                  <p className="mt-1">Create tasks to visualize workload progression.</p>
                </div>
              ) : (
                <div className="flex h-full flex-col sm:flex-row items-center justify-around gap-4">
                  <div className="h-[220px] w-full sm:w-[55%]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.taskStatusDistribution}
                        margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border border-border bg-popover/95 p-2 shadow-lg text-xs">
                                  <span className="font-semibold text-foreground">{label}:</span>{" "}
                                  <span className="font-bold">{payload[0].value} Tasks</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {data.taskStatusDistribution.map((entry, index) => (
                            <Cell key={`task-status-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs w-full sm:w-[45%] pr-2">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Workload Stages
                    </p>
                    {data.taskStatusDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground font-mono">
                          {item.value} ({Math.round((item.value / Math.max(1, data.totalTasks)) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Priority Breakdown & Portfolio Health Matrix */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Task Priority Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-500" />
                  Task Priority Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Workload urgency breakdown across High, Medium, and Low priorities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              {!mounted || isLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : !data || data.taskPriorityDistribution.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No priority data recorded.
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {data.taskPriorityDistribution.map((item) => {
                    const total = Math.max(1, data.totalTasks);
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name} Priority
                          </span>
                          <span className="font-mono text-muted-foreground font-semibold">
                            {item.value} tasks ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Health & Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Execution Health & Quality Matrix
            </CardTitle>
            <CardDescription className="text-xs">
              Systematic overview of scheduling integrity and team deliverables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Project Schedule Adherence</span>
                  <p className="text-[11px] text-muted-foreground">Projects delivered on or before due date</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-foreground">
                    {data && data.totalProjects > 0
                      ? `${Math.round(((data.totalProjects - data.overdueProjects) / data.totalProjects) * 100)}%`
                      : "100%"}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">on track</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Task Completion Velocity</span>
                  <p className="text-[11px] text-muted-foreground">Closed deliverables vs pending backlog</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-foreground">
                    {data && data.totalTasks > 0
                      ? `${data.completedTasks}/${data.totalTasks}`
                      : "0/0"}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">completed</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Overdue Risk Exposure</span>
                  <p className="text-[11px] text-muted-foreground">Total items requiring immediate triage</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${totalOverdue > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                    {totalOverdue} items
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {totalOverdue > 0 ? "action needed" : "all on schedule"}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
                <Link href="/projects" className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
                  Manage Projects <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Link href="/tasks" className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
                  Manage Tasks <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
