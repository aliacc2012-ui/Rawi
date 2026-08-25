"use client";

import { useState, useTransition } from "react";
import { verifyGalleryPassword } from "@/app/g/[slug]/actions";
import { Field, Input, PrimaryButton, ErrorNote } from "@/components/ui/form";

export function PasswordGate({ galleryId, title }: { galleryId: string; title: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyGalleryPassword(galleryId, password);
      if ("error" in result) {
        setError(result.error!);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white grid place-items-center p-6">
      <div className="w-full max-w-sm text-center">
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">R</span>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="text-gray-400 mt-2 text-sm">This gallery is password protected.</p>
        <form onSubmit={handleSubmit} className="mt-6 text-left">
          <Field label="Password">
            <Input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <PrimaryButton type="submit" loading={pending}>Unlock gallery</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
