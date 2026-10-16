"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function AuthModal({ open, onOpenChange, reason }: AuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignIn = () => {
    onOpenChange(false);
    const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname || "/")}`;
    router.push(redirectUrl);
  };

  const handleRegister = () => {
    onOpenChange(false);
    router.push("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border bg-card shadow-2xl">
        <div className="relative p-6 pb-4">
          {/* Subtle gradient background accent */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          {/* Icon badge */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-3.5 shadow-xs">
            <Lock className="h-5 w-5" />
          </div>

          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Sign In to Continue
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {reason ||
                "You are currently browsing Veyrix in Guest Preview mode. Sign in or create an account to start creating projects, managing tasks, and collaborating with your team."}
            </DialogDescription>
          </DialogHeader>

          {/* Quick Perks / reassurance */}
          <div className="mt-4 rounded-lg bg-secondary/50 border border-border/60 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Instant sign up in under 30 seconds</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Create, edit & manage projects and tasks</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Full real-time database synchronization</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border bg-muted/20 p-4 sm:p-5 pt-3 flex flex-col gap-2">
          <Button
            onClick={handleSignIn}
            className="w-full gap-2 shadow-sm font-medium"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleRegister}
            variant="outline"
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Create Free Account</span>
          </Button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
          >
            Continue browsing as guest
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
