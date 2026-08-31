"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { Field, LegacyInput as Input, PrimaryButton, ErrorNote } from "@/components/ui/form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet in this environment.");
      } else {
        setError("This reset link may have expired. Request a new one.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="mt-6">
        <Field label="New password">
          <Input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <ErrorNote>{error}</ErrorNote>
        <PrimaryButton type="submit" loading={loading}>Update password</PrimaryButton>
      </form>
    </>
  );
}
