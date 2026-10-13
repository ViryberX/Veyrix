"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
  CreditCard,
  CheckCheck,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeSelector } from "@/components/layout/theme-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock-data";
import { NotificationItem, Workspace } from "@/types/saas";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/overview";

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  activeWorkspace: Workspace;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({
  onOpenSearch,
  onToggleMobileMenu,
  activeWorkspace,
  isCollapsed = false,
  onToggleCollapse,
}: HeaderProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const activeUser = user || currentUser;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notificationsList, setNotificationsList] = React.useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setNotificationsList(res.data);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    fetchNotifications();

    // Check for new notifications periodically
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsReadAction();
  };

  const handleMarkRead = async (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationReadAction(id);
  };

  // Generate dynamic breadcrumb segments
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbName =
    pathSegments.length === 0
      ? "Overview"
      : pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {/* Left: Mobile Toggle, Desktop Collapse Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Desktop Sidebar Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-primary" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors font-medium text-foreground/80"
          >
            {activeWorkspace.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
          <span className="font-semibold text-foreground">{breadcrumbName}</span>
        </nav>
      </div>

      {/* Right: Search, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search commands...</span>
          <kbd className="hidden sm:inline-flex rounded border border-border bg-background px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {loadingNotifications ? (
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-1/2 pt-2" />
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-4/5" />
                </div>
              ) : notificationsList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <Bell className="h-4 w-4 opacity-50" />
                  </div>
                  <p className="text-xs font-medium text-foreground">All caught up!</p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px]">
                    No unread notifications in your workspace right now.
                  </p>
                </div>
              ) : (
                notificationsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !item.read && handleMarkRead(item.id)}
                    className={`p-3 text-xs transition-colors cursor-pointer group relative ${
                      !item.read
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/30 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!item.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <span
                          className={`text-foreground text-xs truncate ${
                            !item.read ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed pl-3">
                      {item.description}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border p-2 text-center">
              <Link
                href="/settings"
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
              >
                Notification Preferences
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Selector (Light, Dark, System) */}
        <ThemeSelector />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary transition-colors cursor-pointer border border-transparent hover:border-border"
              aria-label="User profile menu"
            >
              <Avatar
                src={activeUser.avatar}
                fallback={activeUser.name.charAt(0)}
                size="sm"
              />
              <span className="hidden lg:inline text-xs font-medium text-foreground">
                {activeUser.name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-semibold text-foreground">
                  {activeUser.name}
                </span>
                <span className="text-[11px] text-muted-foreground truncate font-normal">
                  {activeUser.email}
                </span>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono py-0">
                    {activeUser.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing" className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Plans & Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span>API Keys & Security</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
