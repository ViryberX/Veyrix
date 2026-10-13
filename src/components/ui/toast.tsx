"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
  };
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const duration = item.duration ?? 4500;
      const newToast: ToastItem = { ...item, id };

      setToasts((prev) => [newToast, ...prev].slice(0, 6));

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (title: string, message?: string) =>
        addToast({ type: "success", title, message }),
      error: (title: string, message?: string) =>
        addToast({ type: "error", title, message, duration: 6000 }),
      info: (title: string, message?: string) =>
        addToast({ type: "info", title, message }),
      warning: (title: string, message?: string) =>
        addToast({ type: "warning", title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast Viewport */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-2 pointer-events-none sm:bottom-6 sm:right-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in-0",
              item.type === "success" &&
                "border-emerald-500/30 bg-emerald-950/80 text-emerald-100 dark:bg-emerald-950/90",
              item.type === "error" &&
                "border-rose-500/30 bg-rose-950/80 text-rose-100 dark:bg-rose-950/90",
              item.type === "warning" &&
                "border-amber-500/30 bg-amber-950/80 text-amber-100 dark:bg-amber-950/90",
              item.type === "info" &&
                "border-blue-500/30 bg-slate-900/90 text-slate-100"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {item.type === "success" && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}
              {item.type === "error" && (
                <AlertCircle className="h-5 w-5 text-rose-400" />
              )}
              {item.type === "warning" && (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
              {item.type === "info" && (
                <Info className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              {item.message && (
                <p className="text-xs text-foreground/80 opacity-90 leading-relaxed">
                  {item.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              title="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
