"use client";

import * as React from "react";
import {
  GitCommit,
  Key,
  CreditCard,
  UserPlus,
  FolderGit2,
  CheckCircle2,
  CheckSquare,
  RefreshCw,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "@/types/saas";
import { getRecentActivitiesAction } from "@/lib/actions/overview";

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadActivities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRecentActivitiesAction(12);
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getIcon = (type: ActivityItem["type"], action?: string) => {
    if (action?.includes("completed")) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    }
    switch (type) {
      case "project":
        return <FolderGit2 className="h-3.5 w-3.5 text-indigo-500" />;
      case "task":
        return <CheckSquare className="h-3.5 w-3.5 text-blue-500" />;
      case "deploy":
        return <GitCommit className="h-3.5 w-3.5 text-cyan-500" />;
      case "api_key":
        return <Key className="h-3.5 w-3.5 text-amber-500" />;
      case "billing":
        return <CreditCard className="h-3.5 w-3.5 text-emerald-500" />;
      case "member":
        return <UserPlus className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="col-span-1 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Audit & Activity Stream</CardTitle>
          <CardDescription className="text-xs">
            Live database event stream across your workspace
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={loadActivities}
          title="Refresh activities"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {isLoading ? (
          <div className="space-y-3.5 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-4/5" />
                  <Skeleton className="h-2.5 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-lg">
            <Activity className="h-6 w-6 text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-foreground">No recent activity yet</p>
            <p className="mt-1">Actions on projects and tasks will stream here in real time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto pr-1">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <Avatar
                  src={activity.user.avatar}
                  fallback={activity.user.name ? activity.user.name.charAt(0) : "U"}
                  size="sm"
                />
                <div className="flex-1 space-y-0.5 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-semibold">{activity.user.name}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 min-w-0">
                      {getIcon(activity.type, activity.action)}
                      <span className="font-mono text-foreground/80 truncate">
                        {activity.target}
                      </span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
