import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/workspace";
import { createWorkspace, signOut } from "@/app/(app)/actions";
import { Field, LegacyInput as Input, PrimaryButton } from "@/components/ui/form";

// Depends on the caller's session and Supabase env — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user, workspace } = await getCurrentWorkspace();
  if (!user) redirect("/login");
  if (workspace) redirect("/dashboard");

  async function createWorkspaceAction(formData: FormData) {
    "use server";
    await createWorkspace(formData);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#111111]">
      <div className="w-full max-w-sm">
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">R</span>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em]">Welcome to RAWI.</h1>
        <p className="text-white/40 mt-1.5 text-sm">What should clients see on your galleries?</p>
        <form action={createWorkspaceAction} className="mt-6">
          <Field label="Studio / brand name">
            <Input name="studioName" required placeholder="e.g. CARCLCK" />
          </Field>
          <PrimaryButton type="submit">Create my workspace</PrimaryButton>
        </form>
          <form action={signOut} className="mt-6 text-center">
            <button type="submit" className="text-xs text-white/30 hover:text-white/60 transition">
              Sign out
            </button>
          </form>
        </div>
    </div>
  );
}
