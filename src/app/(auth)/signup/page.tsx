"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { Field, Input, PrimaryButton, ErrorNote, SuccessNote } from "@/components/ui/form";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet in this environment. Account creation is unavailable until Supabase credentials are set.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Check your email</h1>
        <SuccessNote>
          We sent a verification link to {email}. Confirm it to activate your RAWI workspace.
        </SuccessNote>
        <Link href="/login" className="text-sm font-bold text-black mt-6 inline-block">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Create your account</h1>
      <p className="text-gray-500 mt-1.5 text-sm">Start delivering work your clients remember.</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <Field label="Full name">
          <Input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirm password">
          <Input type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <label className="flex items-start gap-2.5 text-xs text-gray-600 mt-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
          <span>I agree to the <Link href="/terms" target="_blank" className="font-semibold text-black underline">Terms</Link> and <Link href="/privacy" target="_blank" className="font-semibold text-black underline">Privacy Policy</Link></span>
        </label>
        <ErrorNote>{error}</ErrorNote>
        <PrimaryButton type="submit" loading={loading}>Create account</PrimaryButton>
      </form>

      <p className="text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-black">Sign in</Link>
      </p>
    </>
  );
}
