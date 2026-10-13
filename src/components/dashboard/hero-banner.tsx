"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  FolderPlus,
  CheckSquare,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroBanner() {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-[#070A12] via-[#090E1C] to-[#0A1326] p-6 sm:p-8 shadow-2xl transition-all duration-300">
      {/* Dismiss Button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 z-20 rounded-md p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Dismiss banner"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Background Cyber Tech Grid Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Ambient Neon Lighting Flares (Cyan & Indigo palette) */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Decorative Corner Accents */}
      <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-cyan-500/60" />
      <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-indigo-500/60" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-indigo-500/60" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-cyan-500/60" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          {/* Top Pill / Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-cyan-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen SaaS Platform</span>
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
              <ShieldCheck className="mr-1 h-3 w-3" /> Supabase RLS
            </Badge>
            <Badge variant="outline" className="text-[11px] font-mono border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
              <Cpu className="mr-1 h-3 w-3" /> Next.js 16 • React 19
            </Badge>
          </div>

          {/* Brand Heading & Tagline */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
                <Zap className="h-6 w-6 text-white fill-white" />
              </div>
              <h1 className="text-3xl font-black tracking-widest text-white sm:text-4xl font-sans">
                VEYRIX
              </h1>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-wide text-zinc-100 sm:text-xl">
              Build beyond limits<span className="text-cyan-400">.</span>
            </p>
          </div>

          <p className="text-xs text-zinc-400 sm:text-sm leading-relaxed max-w-xl">
            Unified workspace for high-velocity software engineering. Monitor real-time telemetry, orchestrate development sprints, and govern role-based access from an interactive command center.
          </p>

          {/* Quick Stats Micro-Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>Hybrid Live/Demo Engine</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Role-Based Multi-Tenancy</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Command Palette (⌘K)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
          <Button asChild size="default" className="h-10 px-5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/20 border-0">
            <Link href="/projects">
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>

          <Button asChild variant="outline" size="default" className="h-10 px-5 border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white">
            <Link href="/tasks">
              <CheckSquare className="mr-2 h-4 w-4 text-cyan-400" />
              New Sprint Task
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5">
            <Link href="/analytics">
              Explore Analytics <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
