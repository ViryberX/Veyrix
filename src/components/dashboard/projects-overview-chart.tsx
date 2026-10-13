"use client";

import * as React from "react";
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
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardOverviewData } from "@/types/saas";
import { FolderGit2, CheckSquare, BarChart2, PieChart as PieIcon, TrendingUp } from "lucide-react";

interface ProjectsOverviewChartProps {
  data: DashboardOverviewData | null;
  isLoading: boolean;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function ProjectsOverviewChart({
  data,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: ProjectsOverviewChartProps) {
  const [activeTab, setActiveTab] = React.useState<"trend" | "projects" | "tasks">("trend");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const timeRanges = [
    { label: "7D", value: "7D" },
    { label: "30D", value: "30D" },
    { label: "90D", value: "90D" },
    { label: "1Y", value: "1Y" },
    { label: "All Time", value: "ALL" },
  ];

  return (
    <Card className="col-span-1 lg:col-span-2 flex flex-col justify-between">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Real-Time Platform Analytics</CardTitle>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Calculated directly from live database project and task records
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Selector */}
          <div className="flex items-center rounded-lg bg-secondary/80 p-0.5 border border-border/60">
            <button
              onClick={() => setActiveTab("trend")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "trend"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              <span>Creation Trend</span>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "projects"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PieIcon className="h-3 w-3" />
              <span>Project Status</span>
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "tasks"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckSquare className="h-3 w-3" />
              <span>Task Status</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/40 text-[11px]">
            {timeRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => onTimeRangeChange(r.value)}
                className={`rounded px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                  timeRange === r.value
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        <div className="h-[290px] w-full">
          {!mounted || isLoading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : !data ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              No database records available.
            </div>
          ) : activeTab === "trend" ? (
            /* Creation Trend Chart */
            data.projectCreationTrend.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-6">
                <FolderGit2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="font-semibold text-foreground">No project creations in this time window</p>
                <p className="mt-1">Try expanding the date range filter or create a new project.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.projectCreationTrend}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="projectTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
                          <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-xs text-xs">
                            <p className="font-semibold text-foreground">{label}</p>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-indigo-500" />
                              <span>Projects Added:</span>
                              <span className="font-bold text-foreground">{payload[0].value}</span>
                            </p>
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
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#projectTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )
          ) : activeTab === "projects" ? (
            /* Project Status Distribution */
            data.projectStatusDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No active projects found for this filter.
              </div>
            ) : (
              <div className="flex h-full flex-col sm:flex-row items-center justify-around gap-4">
                <div className="h-[240px] w-full sm:w-[55%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.projectStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
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
                            return (
                              <div className="rounded-lg border border-border bg-popover/95 p-2 shadow-lg text-xs">
                                <span className="font-semibold text-foreground">{item.name}:</span>{" "}
                                <span className="font-bold">{item.value} Projects</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2.5 text-xs w-full sm:w-[40%] pr-4">
                  <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Status Breakdown ({data.totalProjects} Total)
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
            )
          ) : (
            /* Task Status Distribution */
            data.taskStatusDistribution.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No tasks available for this filter.
              </div>
            ) : (
              <div className="flex h-full flex-col sm:flex-row items-center justify-around gap-4">
                <div className="h-[240px] w-full sm:w-[55%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.taskStatusDistribution} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
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
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2.5 text-xs w-full sm:w-[40%] pr-4">
                  <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Task Deliverables ({data.totalTasks} Total)
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
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
