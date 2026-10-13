"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    if (!supabase) {
      // In local demo mode: simulate successful dispatch
      setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
      }, 500);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSubmitted(true);
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
            <CardTitle className="text-base text-center">Reset your password</CardTitle>
            <CardDescription className="text-center text-xs">
              {submitted
                ? "Check your inbox for reset instructions"
                : "Enter your registered email address and we'll send a password recovery link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    Reset link sent to
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">{email}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Click the link in the email to choose a new password. If you don&apos;t see it within a minute, check your spam folder.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setSubmitted(false)}
                >
                  Resend Email
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
                  <label className="text-xs font-semibold text-foreground">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="name@company.com"
                    autoFocus
                    required
                  />
                </div>

                <Button type="submit" className="w-full mt-3" isLoading={loading}>
                  Send Recovery Link
                </Button>
              </form>
            )}

            <div className="border-t border-border/60 pt-3 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
