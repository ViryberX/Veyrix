"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { revenueChartData } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type MetricType = "revenue" | "apiRequests" | "latency";

export function RevenueChart() {
  const [mounted, setMounted] = React.useState(false);
  const [selectedMetric, setSelectedMetric] = React.useState<MetricType>("revenue");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const config = {
    revenue: {
      label: "Revenue",
      color: "#6366f1", // Indigo
      formatter: (val: number) => formatCurrency(val),
    },
    apiRequests: {
      label: "API Requests",
      color: "#10b981", // Emerald
      formatter: (val: number) => `${formatNumber(val)} reqs`,
    },
    latency: {
      label: "Avg Latency",
      color: "#f59e0b", // Amber
      formatter: (val: number) => `${val}ms`,
    },
  };

  const activeConfig = config[selectedMetric];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>System Performance & Growth</CardTitle>
          <CardDescription>
            Historical metric trends across production clusters
          </CardDescription>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center rounded-lg bg-secondary/80 p-0.5 border border-border/60">
          {(["revenue", "apiRequests", "latency"] as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedMetric === metric
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {config[metric].label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full pt-2">
          {!mounted ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeConfig.color}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeConfig.color}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(val) => {
                    if (selectedMetric === "revenue") return `$${val / 1000}k`;
                    if (selectedMetric === "apiRequests") return `${val / 1000000}M`;
                    return `${val}ms`;
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const val = Number(data.value);
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-xs text-xs">
                          <p className="font-semibold text-foreground">{label} 2026</p>
                          <p className="mt-1 text-muted-foreground flex items-center gap-1.5 font-mono">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: activeConfig.color }}
                            />
                            <span>{activeConfig.label}:</span>
                            <span className="font-bold text-foreground">
                              {activeConfig.formatter(val)}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={activeConfig.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
