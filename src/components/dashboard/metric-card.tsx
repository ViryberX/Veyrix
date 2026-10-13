import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCardData } from "@/types/saas";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: MetricCardData;
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositive = metric.changeType === "positive";
  const isNegative = metric.changeType === "negative";

  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {metric.title}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium font-mono",
              isPositive &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15",
              isNegative &&
                "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15",
              !isPositive &&
                !isNegative &&
                "bg-muted text-muted-foreground"
            )}
          >
            {isPositive && <ArrowUpRight className="h-3 w-3" />}
            {isNegative && <ArrowDownRight className="h-3 w-3" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
            {metric.change}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {metric.value}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{metric.period}</span>
            <span>•</span>
            <span className="truncate">{metric.description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
