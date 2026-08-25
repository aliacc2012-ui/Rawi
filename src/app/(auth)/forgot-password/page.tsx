"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { Field, Input, PrimaryButton, ErrorNote, SuccessNote } from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet in this environment. Password reset is unavailable until Supabase credentials are set.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Reset your password</h1>
      <p className="text-gray-500 mt-1.5 text-sm">We&rsquo;ll email you a secure reset link.</p>

      {sent ? (
        <SuccessNote>If an account exists for {email}, a reset link is on its way.</SuccessNote>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <Field label="Email">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <PrimaryButton type="submit" loading={loading}>Send reset link</PrimaryButton>
        </form>
      )}

      <Link href="/login" className="text-sm font-bold text-black mt-6 inline-block">
        Back to sign in
      </Link>
    </>
  );
}
