import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "@/components/app-shell/BrandingForm";
import { SocialLinksForm } from "@/components/app-shell/SocialLinksForm";

export default async function SettingsPage() {
  const { workspace } = await getCurrentWorkspace();
  const accent = workspace!.accent_color || "#FFD400";
  const supabase = await createClient();

  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspace!.id);

  const projectIds = (projectRows ?? []).map((project) => project.id);
  let activeGalleries = 0;
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from("galleries")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .eq("status", "published");
    activeGalleries = count ?? 0;
  }

  const usedBytes = workspace!.storage_used_bytes || 0;
  const limitBytes = workspace!.storage_limit_bytes || 1;
  const usedGb = usedBytes / 1024 ** 3;
  const limitGb = limitBytes / 1024 ** 3;
  const storagePct = Math.min(100, (usedBytes / Math.max(1, limitBytes)) * 100);
  const freeGb = Math.max(0, limitGb - usedGb);

  return (
    <div className="max-w-[1500px] mx-auto pb-8">
      <div className="mb-7">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">CREATOR WORKSPACE</span>
        <h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">Branding</h1>
        <p className="text-gray-400 mt-2">Shape how clients experience your studio before they even see the first photo.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div><h2 className="text-xl font-bold">Studio identity</h2><p className="text-sm text-gray-400 mt-1">Update your public studio name and signature accent.</p></div>
              <div className="w-11 h-11 rounded-xl grid place-items-center font-black text-black -rotate-[7deg]" style={{ backgroundColor: accent }}>R</div>
            </div>
            <BrandingForm workspaceId={workspace!.id} initialName={workspace!.name} initialAccent={accent} />
          </div>

          <div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Social presence</h2><p className="text-sm text-gray-400 mt-1">Add your profiles so you can jump to each social page instantly.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">ACTIVE</span></div>
            <SocialLinksForm workspaceId={workspace!.id} />
          </div>
        </div>

        <div className="xl:sticky xl:top-6 self-start">
          <div className="bg-white border border-gray-200 rounded-[22px] p-4 shadow-sm">
            <div className="flex items-center justify-between px-2 pb-4"><div><div className="text-[10px] tracking-[.16em] text-gray-400 font-bold">LIVE PREVIEW</div><div className="text-sm font-bold mt-1">Client gallery cover</div></div><span className="text-[10px] rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 font-bold">PREVIEW</span></div>
            <div className="relative overflow-hidden rounded-[18px] min-h-[520px] bg-[radial-gradient(circle_at_68%_52%,rgba(255,212,0,.16),transparent_24%),linear-gradient(145deg,#353535,#080808_60%,#252525)] text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10" />
              <div className="relative z-10 p-6 md:p-8 min-h-[520px] flex flex-col justify-between">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-8 h-8 rounded-[50%_50%_50%_8px] grid place-items-center text-black font-black -rotate-[8deg]" style={{ backgroundColor: accent }}>R</span><span className="font-extrabold tracking-[.12em]">{workspace!.name.toUpperCase()}</span></div><span className="text-xs text-white/45">Delivered with RAWI</span></div>
                <div className="max-w-lg">
                  <span className="text-[10px] tracking-[.18em] font-bold" style={{ color: accent }}>PHOTOGRAPHY</span>
                  <h3 className="text-5xl md:text-6xl tracking-[-.06em] mt-3 leading-none">Your next client story.</h3>
                  <p className="text-sm text-white/55 mt-4 max-w-sm leading-relaxed">Your studio name, accent and presentation work together across every published gallery.</p>
                  <button className="mt-6 rounded-xl px-5 py-3 text-xs font-extrabold text-black" style={{ backgroundColor: accent }}>View Gallery ↓</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <PreviewNote title="Consistent" text="One identity everywhere" />
              <PreviewNote title="Premium" text="Editorial client feel" />
              <PreviewNote title="Yours" text="Studio-first branding" />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 space-y-5">
        <div className="bg-white border border-gray-200 rounded-[24px] p-5 md:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div>
              <h2 className="text-[28px] tracking-[-0.04em] font-bold">Plan & storage</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your plan, storage and billing.</p>
            </div>
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold hover:bg-gray-50">▤ &nbsp; Billing & invoices &nbsp;›</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-6 lg:gap-8 mt-7">
            <div>
              <div className="text-[10px] font-bold tracking-[.12em] text-gray-400">CURRENT PLAN</div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-[40px] font-extrabold tracking-[-.05em] uppercase leading-none">{workspace!.plan}</div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[10px] font-bold">Current</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Perfect for trying RAWI and getting started.</p>

              <div className="border-t border-gray-100 mt-6 pt-5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-500">STORAGE USED</span>
                  <span>{usedGb.toFixed(1)} GB / {limitGb.toFixed(1)} GB</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#efefed] overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${storagePct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="font-bold text-emerald-600">{Math.round(storagePct)}% used</span>
                  <span className="text-gray-500">{freeGb.toFixed(1)} GB free</span>
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-8 grid grid-cols-2 lg:grid-cols-1 gap-3">
              <PlanMetric icon="◉" label="Total storage" value={`${limitGb.toFixed(1)} GB`} />
              <PlanMetric icon="▧" label="Active galleries" value={`${activeGalleries} of 3`} />
              <PlanMetric icon="□" label="Delivery time" value="Up to 7 days" />
              <PlanMetric icon="◇" label="Branding" value="RAWI branding" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[26px] font-bold tracking-[-.04em]">Upgrade your plan</h2>
          <p className="text-sm text-gray-400 mt-1">Choose the plan that fits your workflow.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PlanCard
            name="Free"
            price="0"
            description="For trying RAWI with real work."
            features={["5 GB storage", "3 active galleries", "7-day delivery", "RAWI branding"]}
            button="Choose Free"
            current={workspace!.plan === "free"}
          />
          <PlanCard
            name="Creator"
            price="49"
            description="For photographers and filmmakers."
            features={["100 GB storage", "Unlimited galleries", "Custom branding", "Password protection", "Download analytics"]}
            button="Choose Creator"
            featured
            current={workspace!.plan === "creator"}
          />
          <PlanCard
            name="Pro"
            price="129"
            description="For serious creators and teams."
            features={["500 GB storage", "4K playback", "Custom domain", "Watermarks", "Client approvals"]}
            button="Choose Pro"
            current={workspace!.plan === "pro"}
          />
        </div>

        <div className="rounded-[20px] border border-[#f4df9a] bg-[#fff9e9] px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white grid place-items-center">✦</div>
            <div><div className="font-bold text-sm">Need more storage?</div><div className="text-xs text-gray-500 mt-1">You can upgrade or downgrade your plan at any time.</div></div>
          </div>
          <button className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold">Compare all features &nbsp;›</button>
        </div>
      </section>
    </div>
  );
}

function PreviewNote({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl bg-[#f7f7f5] p-3"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-gray-400 mt-1">{text}</div></div>;
}

function PlanMetric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#f7f7f5] grid place-items-center font-bold">{icon}</div><div><div className="text-xs text-gray-400">{label}</div><div className="text-sm font-bold mt-0.5">{value}</div></div></div>;
}

function PlanCard({ name, price, description, features, button, featured = false, current = false }: { name: string; price: string; description: string; features: string[]; button: string; featured?: boolean; current?: boolean }) {
  return (
    <div className={`relative bg-white rounded-[22px] p-5 md:p-6 flex flex-col min-h-[430px] ${featured ? "border-2 border-black shadow-md" : "border border-gray-200 shadow-sm"}`}>
      {featured && <span className="absolute top-4 right-4 rounded-full bg-rawi-yellow text-black px-3 py-1.5 text-[9px] font-black tracking-wide">MOST POPULAR</span>}
      <div className="text-[10px] font-extrabold tracking-[.15em] text-gray-500 uppercase">{name}</div>
      <div className="flex items-end gap-2 mt-5"><span className="text-[48px] leading-none tracking-[-.06em]">{price}</span><span className="text-sm text-gray-500 mb-1">AED{price !== "0" ? "/mo" : ""}</span></div>
      <p className="text-sm text-gray-500 mt-5">{description}</p>
      <div className="mt-6 flex-1">
        {features.map((feature) => <div key={feature} className="flex items-center gap-2 py-2.5 border-b border-gray-100 text-sm"><span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-[11px] font-bold">✓</span><span>{feature}</span></div>)}
      </div>
      <button disabled={current} className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-extrabold transition ${featured ? "bg-rawi-yellow text-black hover:brightness-95" : "border border-gray-300 bg-white hover:bg-gray-50"} ${current ? "opacity-50 cursor-not-allowed" : ""}`}>{current ? "Current plan" : button}</button>
    </div>
  );
}
