import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { MediaUploader } from "@/components/app-shell/MediaUploader";
import { PublishButton } from "@/components/app-shell/PublishButton";
import { ShareBar } from "@/components/app-shell/ShareBar";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(name)")
    .eq("id", id)
    .eq("workspace_id", workspace!.id)
    .single();

  if (!project) notFound();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: media } = await supabase
    .from("media")
    .select("id, original_name, media_type, processing_status, file_size")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const publicUrl = gallery ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/g/${gallery.slug}` : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">GALLERY BUILDER</span>
          <h1 className="text-[26px] md:text-[32px] tracking-[-0.04em] mt-1.5">{project.name}</h1>
          {project.clients?.name && <p className="text-sm text-gray-400 mt-1">For {project.clients.name}</p>}
        </div>
        {gallery && <PublishButton galleryId={gallery.id} isPublished={gallery.status === "published"} />}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="bg-white border border-gray-200 rounded-[20px] p-5.5">
          <h3 className="text-[19px] font-semibold mb-4">Media</h3>
          {media && media.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {media.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate">{m.original_name}</span>
                  <span className="text-xs text-gray-400 capitalize">{m.processing_status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No media yet — upload photos or video below.</p>
          )}
          <MediaUploader workspaceId={workspace!.id} projectId={project.id} />
        </div>

        <div className="bg-white border border-gray-200 rounded-[20px] p-5.5">
          <h3 className="text-[19px] font-semibold mb-4">Share</h3>
          {gallery?.status === "published" && publicUrl ? (
            <ShareBar url={publicUrl} clientName={project.clients?.name} />
          ) : (
            <p className="text-sm text-gray-400">Publish this gallery to get a shareable link for WhatsApp, email, or QR code.</p>
          )}
        </div>
      </div>
    </div>
  );
}
