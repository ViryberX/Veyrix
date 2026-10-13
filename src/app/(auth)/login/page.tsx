"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, Sparkles, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const resetSuccess = searchParams.get("reset") === "success";

  const { isConfigured } = useAuth();
  const [email, setEmail] = React.useState("alexander@veyrix.io");
  const [password, setPassword] = React.useState("••••••••••••");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    if (!supabase) {
      // Demo / Dev Mode: Instant login
      setTimeout(() => {
        setLoading(false);
        router.push(redirectTo);
      }, 500);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push(redirectTo);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("veyrix-demo-pass");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(redirectTo);
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm shadow-xs">
              V
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Veyrix
            </span>
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            Build beyond limits.
          </p>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center text-xs">
              Enter your credentials to access your workspaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resetSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Password updated. You can now sign in with your new password.</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="alexander@veyrix.io"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Sign In
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">
                  Instant Demo Access
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs cursor-pointer"
                onClick={() => handleQuickDemo("alexander@veyrix.io")}
              >
                <span>Continue as Alexander Reed</span>
                <Badge variant="outline" className="text-[10px] py-0 font-mono">Owner</Badge>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs cursor-pointer"
                onClick={() => handleQuickDemo("sophia@veyrix.io")}
              >
                <span>Continue as Sophia Martinez</span>
                <Badge variant="outline" className="text-[10px] py-0 font-mono">Admin</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
