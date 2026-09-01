"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { AuthFormSplitScreen, type LoginFormValues } from "@/components/ui/login";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(data: LoginFormValues) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "That email and password don't match our records."
            : signInError.message
        );
        submittingRef.current = false;
        return;
      }
      const requestedDestination = searchParams.get("next");
      const destination =
        requestedDestination?.startsWith("/") && !requestedDestination.startsWith("//")
          ? requestedDestination
          : "/dashboard";
      window.location.assign(destination);
    } catch (err) {
      submittingRef.current = false;
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet. Sign-in is unavailable until Supabase credentials are set.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  async function handleOAuthSignIn(provider: "google" | "azure") {
    setOauthError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setOauthError(
          error.message || "Could not connect to provider. Please try again."
        );
      }
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setOauthError("RAWI's backend isn't configured yet.");
      } else {
        setOauthError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <AuthFormSplitScreen
      logo={
        <Link href="/" className="flex items-center gap-2.5 font-extrabold w-fit">
          <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-[#F0E050] grid place-items-center text-black font-black -rotate-[8deg] text-sm">
            R
          </span>
          <span className="text-[19px] tracking-[0.12em]">RAWI</span>
        </Link>
      }
      title="Welcome back"
      description="Sign in to your workspace"
      imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      imageAlt="Cinematic mountain landscape at golden hour"
      onSubmit={handleSubmit}
      submitError={error}
      onOAuthSignIn={handleOAuthSignIn}
      oauthError={oauthError}
      forgotPasswordHref="/forgot-password"
      createAccountHref="/signup"
    />
  );
}
