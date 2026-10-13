"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeSelectorProps {
  align?: "start" | "end" | "center";
  className?: string;
}

export function ThemeSelector({ align = "end", className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground opacity-50">
        <Sun className="h-3.5 w-3.5" />
      </div>
    );
  }

  const getActiveIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-3.5 w-3.5 text-amber-500 transition-all" />;
      case "dark":
        return <Moon className="h-3.5 w-3.5 text-indigo-400 transition-all" />;
      default:
        return <Monitor className="h-3.5 w-3.5 text-muted-foreground transition-all" />;
    }
  };

  const getActiveLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer select-none"
          aria-label={`Theme selector: currently ${getActiveLabel()}`}
          title={`Active theme: ${getActiveLabel()} (Click to change)`}
        >
          {getActiveIcon()}
          <span className="hidden sm:inline capitalize">{getActiveLabel()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
