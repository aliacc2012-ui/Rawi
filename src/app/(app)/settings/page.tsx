import { getCurrentWorkspace } from "@/lib/workspace";
import { BrandingForm } from "@/components/app-shell/BrandingForm";

export default async function SettingsPage() {
  const { workspace } = await getCurrentWorkspace();
  const accent = workspace!.accent_color || "#FFD400";

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
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Social presence</h2><p className="text-sm text-gray-400 mt-1">Connect the places where clients can discover your work.</p></div><span className="rounded-full bg-[#f5f5f3] px-3 py-1.5 text-[10px] font-bold text-gray-500">COMING NEXT</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
              <Social name="Instagram" icon="◎" />
              <Social name="TikTok" icon="♪" />
              <Social name="Facebook" icon="f" />
              <Social name="Website" icon="↗" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm">
            <h2 className="text-xl font-bold">Plan & storage</h2>
            <div className="flex items-end justify-between mt-5"><div><div className="text-[10px] text-gray-400">CURRENT PLAN</div><div className="text-3xl font-extrabold tracking-[-.04em] uppercase mt-1">{workspace!.plan}</div></div><div className="text-right text-xs text-gray-400">{((workspace!.storage_used_bytes || 0) / 1024 ** 3).toFixed(1)} / {(workspace!.storage_limit_bytes / 1024 ** 3).toFixed(1)} GB</div></div>
            <div className="h-2 rounded-full bg-[#efefed] overflow-hidden mt-4"><div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, ((workspace!.storage_used_bytes || 0) / Math.max(1, workspace!.storage_limit_bytes)) * 100)}%` }} /></div>
            <button className="mt-5 rounded-xl bg-black text-white px-5 py-3 text-xs font-extrabold">Upgrade plan</button>
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
    </div>
  );
}

function Social({ name, icon }: { name: string; icon: string }) { return <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-4"><div className="w-9 h-9 rounded-xl bg-white border border-gray-200 grid place-items-center font-bold">{icon}</div><div className="text-xs font-bold mt-3">{name}</div><div className="text-[10px] text-gray-400 mt-1">Not connected</div></div>; }
function PreviewNote({ title, text }: { title: string; text: string }) { return <div className="rounded-xl bg-[#f7f7f5] p-3"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-gray-400 mt-1">{text}</div></div>; }
