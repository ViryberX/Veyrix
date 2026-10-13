"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [verificationRequired, setVerificationRequired] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    if (!supabase) {
      // In local demo mode: redirect straight to dashboard
      setTimeout(() => {
        setLoading(false);
        router.push("/");
      }, 500);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.user && !data.session) {
      // Supabase requires email verification
      setVerificationRequired(true);
    } else {
      router.push("/");
    }
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
            <CardTitle className="text-base text-center">Create your workspace</CardTitle>
            <CardDescription className="text-center text-xs">
              {verificationRequired
                ? "Verify your email address to continue"
                : "Start building with high-throughput cloud infrastructure"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationRequired ? (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    Confirmation email sent
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">{email}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We sent a confirmation link to your email. Click the link to activate your Veyrix account.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push("/login")}
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Alexander Reed"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Work Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="alexander@company.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Row-level encrypted tenant isolation.</span>
                </div>

                <Button type="submit" className="w-full mt-3" isLoading={loading}>
                  Create Workspace
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
