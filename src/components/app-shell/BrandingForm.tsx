"use client";

import { useState, useTransition } from "react";
import { updateBranding } from "@/app/(app)/actions";
import { Field, LegacyInput as Input, PrimaryButton, ErrorNote, SuccessNote } from "@/components/ui/form";

export function BrandingForm({
  workspaceId,
  initialName,
  initialAccent,
}: {
  workspaceId: string;
  initialName: string;
  initialAccent: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateBranding(workspaceId, formData);
      if (result && "error" in result) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-xl">
      <Field label="Studio name">
        <Input name="studioName" defaultValue={initialName} required />
      </Field>
      <Field label="Accent color">
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            name="accentColor"
            defaultValue={initialAccent}
            className="w-[38px] h-[38px] rounded-[10px] border border-white/[.10] p-0.5"
          />
        </div>
      </Field>
      {error && <ErrorNote>{error}</ErrorNote>}
      {success && <SuccessNote>Branding updated.</SuccessNote>}
      <PrimaryButton type="submit" loading={pending} className="!w-auto px-6">Save branding</PrimaryButton>
    </form>
  );
}
