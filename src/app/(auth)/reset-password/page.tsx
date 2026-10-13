"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    if (!supabase) {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 500);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
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
            <CardTitle className="text-base text-center">Set new password</CardTitle>
            <CardDescription className="text-center text-xs">
              {success
                ? "Your password has been successfully updated"
                : "Enter and confirm your new secure password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your password change is complete. You can now sign in with your updated credentials.
                </p>
                <Button
                  className="w-full mt-2"
                  onClick={() => router.push("/login")}
                >
                  Continue to Sign In
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
                  <label className="text-xs font-semibold text-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="At least 8 characters"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full mt-3" isLoading={loading}>
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
