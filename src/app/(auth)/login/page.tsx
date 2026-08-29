"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { Field, Input, PrimaryButton, ErrorNote } from "@/components/ui/form";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setError(null);
    setLoading(true);
    let navigationStarted = false;

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "That email and password don't match our records."
            : signInError.message
        );
        return;
      }
      const requestedDestination = searchParams.get("next");
      const destination =
        requestedDestination?.startsWith("/") && !requestedDestination.startsWith("//")
          ? requestedDestination
          : "/dashboard";

      navigationStarted = true;
      window.location.assign(destination);
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet in this environment. Sign-in is unavailable until Supabase credentials are set.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      if (!navigationStarted) {
        submittingRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Sign in</h1>
      <p className="text-gray-500 mt-1.5 text-sm">Welcome back to your workspace.</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <Field label="Email">
          <Input type="email" required autoComplete="email" disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required autoComplete="current-password" disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="text-right -mt-2">
          <Link href="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-black">
            Forgot password?
          </Link>
        </div>
        <ErrorNote>{error}</ErrorNote>
        <PrimaryButton type="submit" loading={loading} loadingLabel="Signing in…">Sign in</PrimaryButton>
      </form>

      <p className="text-sm text-gray-500 mt-6">
        New to RAWI?{" "}
        <Link href="/signup" className="font-bold text-black">Create an account</Link>
      </p>
    </>
  );
}
