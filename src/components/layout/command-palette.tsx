"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  CheckSquare,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Plus,
  Moon,
  Sun,
  Monitor,
  Shield,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCreateProject?: () => void;
  onOpenCreateTask?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenCreateProject,
  onOpenCreateTask,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const navigationItems = [
    { name: "Executive Overview", path: "/", icon: LayoutDashboard, category: "Navigation" },
    { name: "Projects & Deployments", path: "/projects", icon: FolderGit2, category: "Navigation" },
    { name: "Tasks & Deliverables", path: "/tasks", icon: ListTodo, category: "Navigation" },
    { name: "System Analytics & Latency", path: "/analytics", icon: BarChart3, category: "Navigation" },
    { name: "Team & Access Control", path: "/team", icon: Users, category: "Navigation" },
    { name: "Billing & Plan Quota", path: "/billing", icon: CreditCard, category: "Navigation" },
    { name: "Workspace Settings & API Keys", path: "/settings", icon: Settings, category: "Navigation" },
  ];

  const actionItems = [
    {
      name: "Create New Project",
      action: () => {
        onOpenChange(false);
        if (onOpenCreateProject) {
          onOpenCreateProject();
        } else {
          router.push("/projects");
        }
      },
      icon: Plus,
      category: "Actions",
    },
    {
      name: "Create New Task",
      action: () => {
        onOpenChange(false);
        if (onOpenCreateTask) {
          onOpenCreateTask();
        } else {
          router.push("/tasks");
        }
      },
      icon: CheckSquare,
      category: "Actions",
    },
    {
      name: "Set Theme: Light Mode",
      action: () => {
        setTheme("light");
        onOpenChange(false);
      },
      icon: Sun,
      category: "Theme",
    },
    {
      name: "Set Theme: Dark Mode",
      action: () => {
        setTheme("dark");
        onOpenChange(false);
      },
      icon: Moon,
      category: "Theme",
    },
    {
      name: "Set Theme: System Preference",
      action: () => {
        setTheme("system");
        onOpenChange(false);
      },
      icon: Monitor,
      category: "Theme",
    },
    {
      name: "View System Security Audit",
      action: () => {
        router.push("/settings");
        onOpenChange(false);
      },
      icon: Shield,
      category: "Actions",
    },
  ];

  const filteredNavigation = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-lg border-border bg-card shadow-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center border-b border-border px-3 py-2.5">
          <Search className="mr-2.5 h-4 w-4 text-muted-foreground shrink-0" />
          <input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredNavigation.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        onOpenChange(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.name}</span>
                      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredActions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-foreground hover:bg-secondary transition-colors text-left cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNavigation.length === 0 && filteredActions.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
