"use server";

import { createClient } from "./server";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  requiresEmailVerification?: boolean;
}

export async function signInAction(
  prevState: any,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const supabase = await createClient();
  if (!supabase) {
    // Demo dev mode: Allow instant sign-in
    return { success: true };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect(redirectTo);
}

export async function signUpAction(
  prevState: any,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: true };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "Veyrix Engineer",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      success: false,
      error: "An account with this email address already exists.",
    };
  }

  // If user session is null, email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      requiresEmailVerification: true,
      message: "Please check your inbox to confirm your email address.",
    };
  }

  redirect("/");
}

export async function forgotPasswordAction(
  prevState: any,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: true,
      message: "Password reset link has been dispatched to your email address.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Password reset link has been dispatched to your email address.",
  };
}

export async function resetPasswordAction(
  prevState: any,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "Both password fields are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: true };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/login?reset=success");
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}
