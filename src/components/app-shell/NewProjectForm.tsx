"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createProject } from "@/app/(app)/actions";
import { Field, Input, PrimaryButton, ErrorNote } from "@/components/ui/form";

type ClientOption = { id: string; name: string };

const PROJECT_TYPES = [
  ["photography", "Photography"],
  ["video", "Video"],
  ["photo_video", "Photo + Video"],
  ["automotive", "Automotive"],
  ["wedding", "Wedding"],
  ["event", "Event"],
  ["real_estate", "Real Estate"],
  ["commercial", "Commercial"],
  ["other", "Other"],
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return <PrimaryButton type="submit" loading={pending}>Create project</PrimaryButton>;
}

export function NewProjectForm({ workspaceId, clients }: { workspaceId: string; clients: ClientOption[] }) {
  const [open, setOpen] = useState(false);
  const boundAction = createProject.bind(null, workspaceId);
  const [state, formAction] = useActionState(async (_: unknown, formData: FormData) => boundAction(formData), null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-rawi-yellow text-black font-extrabold rounded-full px-4 py-2.5 text-sm"
      >
        + New project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <form action={formAction} className="relative bg-white rounded-3xl p-7 w-full max-w-md z-10">
        <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">NEW PROJECT</span>
        <h2 className="text-[28px] tracking-[-0.03em] mt-2 mb-2">Create a delivery.</h2>

        <Field label="Project name">
          <Input name="projectName" required placeholder="e.g. BMW M3 Dubai Night Shoot" />
        </Field>

        {clients.length > 0 ? (
          <Field label="Client">
            <select name="clientId" className="w-full mt-2 border border-gray-300 rounded-xl px-3.5 py-3 bg-[#fafafa] text-sm">
              <option value="">— Select or add new below —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="New client (optional)">
          <Input name="newClientName" placeholder="e.g. Ahmed" />
        </Field>

        <Field label="Project type">
          <select name="projectType" className="w-full mt-2 border border-gray-300 rounded-xl px-3.5 py-3 bg-[#fafafa] text-sm">
            {PROJECT_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Date">
          <Input type="date" name="projectDate" />
        </Field>

        {state && "error" in state && <ErrorNote>{state.error}</ErrorNote>}

        <div className="flex justify-end gap-2.5 mt-6">
          <button type="button" onClick={() => setOpen(false)} className="border border-gray-300 rounded-full px-4 py-2.5 text-sm">
            Cancel
          </button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
