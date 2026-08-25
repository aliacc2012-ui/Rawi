import { getCurrentWorkspace } from "@/lib/workspace";
import { BrandingForm } from "@/components/app-shell/BrandingForm";

export default async function SettingsPage() {
  const { workspace } = await getCurrentWorkspace();

  return (
    <div>
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">CREATOR WORKSPACE</span>
        <h1 className="text-[28px] md:text-[34px] tracking-[-0.04em] mt-1.5">Branding</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6">
        <h3 className="text-[19px] font-semibold mb-1">Studio identity</h3>
        <p className="text-sm text-gray-400 mb-6">Control how clients experience your galleries.</p>
        <BrandingForm
          workspaceId={workspace!.id}
          initialName={workspace!.name}
          initialAccent={workspace!.accent_color}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 mt-4">
        <h3 className="text-[19px] font-semibold mb-1">Plan</h3>
        <p className="text-sm text-gray-400 mb-4">
          You&rsquo;re currently on <strong className="text-black uppercase">{workspace!.plan}</strong>.
        </p>
        <p className="text-xs text-gray-400">
          Billing isn&rsquo;t connected yet in this deployment — plan changes will go through Stripe once configured.
        </p>
      </div>
    </div>
  );
}
