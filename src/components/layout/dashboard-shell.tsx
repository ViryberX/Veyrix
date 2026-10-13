"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "./command-palette";
import { workspaces } from "@/lib/mock-data";
import { Workspace } from "@/types/saas";
import { useAuth } from "@/components/providers/auth-provider";
import { Database, X, Sparkles } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { isConfigured } = useAuth();
  const [showBanner, setShowBanner] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace>(
    workspaces[0]
  );

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Subtle Supabase Status Banner (Only visible when credentials are not yet configured) */}
        {!isConfigured && showBanner && (
          <div className="flex items-center justify-between border-b border-border/70 bg-secondary/50 px-4 py-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 truncate">
              <Database className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="font-medium text-foreground truncate">
                Local Dev Preview:
              </span>
              <span className="truncate">
                Add <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">.env.local</code> to connect your live Supabase database.
              </span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <Header
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          activeWorkspace={activeWorkspace}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
