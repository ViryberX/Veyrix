"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { workspaces } from "@/lib/mock-data";
import { Workspace } from "@/types/saas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/components/providers/auth-provider";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeWorkspace,
  setActiveWorkspace,
  mobileOpen = false,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { requireAuth } = useAuth();

  const navLinks = [
    {
      name: "Overview",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderGit2,
      badge: null,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: ListTodo,
      badge: null,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      name: "Team",
      href: "/team",
      icon: Users,
      badge: null,
    },
    {
      name: "Billing",
      href: "/billing",
      icon: CreditCard,
      badge: activeWorkspace.plan,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-[var(--sidebar-bg)] transition-all duration-300 ease-in-out md:static",
          isCollapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-border",
            isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
          )}
        >
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/70 text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-2xs group"
                  aria-label="Expand sidebar (Ctrl+B)"
                  title="Expand sidebar (Ctrl+B)"
                >
                  <ChevronsRight className="h-4 w-4 transition-transform group-hover:scale-115" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand sidebar (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Link
                href="/"
                onClick={() => setMobileOpen?.(false)}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                {/* Geometric Modern Logo */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs shadow-xs">
                  V
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-sm tracking-tight text-foreground">
                    Veyrix
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono tracking-tight leading-none">
                    Build beyond limits
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Workspace Selector */}
        <div className="p-2 border-b border-border/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg p-2 text-left text-xs font-medium hover:bg-secondary transition-colors cursor-pointer border border-transparent hover:border-border",
                  isCollapsed ? "justify-center px-0" : "justify-between"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-mono text-[10px]">
                    {activeWorkspace.name.charAt(0)}
                  </div>
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="truncate text-foreground font-medium text-xs">
                        {activeWorkspace.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {activeWorkspace.plan} Plan
                      </div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-70" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {ws.slug}
                    </span>
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {activeWorkspace.id === ws.id && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  requireAuth(() => {
                    alert("Create Workspace flow: You are currently on the " + activeWorkspace.plan + " plan.");
                  }, "To create new workspaces, please sign in to your account.");
                }}
                className="gap-2 text-primary cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Workspace...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            const content = (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen?.(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors select-none",
                  isActive
                    ? "bg-[var(--sidebar-active)] text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1">{link.name}</span>
                )}
                {!isCollapsed && link.badge && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.2 text-[10px] font-mono",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{link.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return content;
          })}
        </div>

        {/* Footer / System Status */}
        <div className="border-t border-border p-2 space-y-2">
          {/* Status Pill */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between rounded-md bg-secondary/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Operational</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">99.98%</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Operational (99.98%)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Expand Button when collapsed */}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-full flex items-center justify-center p-2 rounded-lg border border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Expand sidebar (Ctrl+B)"
                  title="Expand sidebar (Ctrl+B)"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand sidebar (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
