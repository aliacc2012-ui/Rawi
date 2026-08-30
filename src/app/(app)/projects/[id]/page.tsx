import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { MediaUploader } from "@/components/app-shell/MediaUploader";
import { PublishButton } from "@/components/app-shell/PublishButton";
import { ShareBar } from "@/components/app-shell/ShareBar";
import { GallerySettings } from "@/components/app-shell/GallerySettings";
import { FeedbackInbox } from "@/components/app-shell/FeedbackInbox";
import { SortableMedia } from "@/components/app-shell/SortableMedia";
import { GalleryThemePicker } from "@/components/app-shell/GalleryThemePicker";
import { ComingSoonGalleryTools } from "@/components/app-shell/ComingSoonGalleryTools";
import type { GalleryTheme } from "@/app/(app)/projects/[id]/theme-actions";
type FeedbackStatus = "new" | "in_progress" | "resolved";
type Feedback = {
  id: string;
  client_name: string;
  comment_text: string;
  media_id: string | null;
  created_at: string;
  status: FeedbackStatus;
};
type Review = {
  id: string;
  client_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await getCurrentWorkspace();
  const s = await createClient();
  const [{ data: project }, { data: gallery }, { data: media }] =
    await Promise.all([
      s
        .from("projects")
        .select("*,clients(name)")
        .eq("id", id)
        .eq("workspace_id", workspace!.id)
        .single(),
      s
        .from("galleries")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      s
        .from("media")
        .select(
          "id,original_name,media_type,processing_status,file_size,storage_path,thumbnail_path,sort_order",
        )
        .eq("project_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
  if (!project) notFound();
  const feedbackAllowed =
    workspace!.plan === "creator" ||
    workspace!.plan === "pro" ||
    workspace!.plan === "studio";
  const [approvalResult, feedbackResult, reviewResult] = await Promise.all([
    gallery && workspace!.plan === "pro"
      ? s
          .from("gallery_approvals")
          .select("id,client_name,approved_at")
          .eq("gallery_id", gallery.id)
          .order("approved_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    gallery && feedbackAllowed
      ? s
          .from("gallery_comments")
          .select("id,client_name,comment_text,media_id,created_at,status")
          .eq("gallery_id", gallery.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    gallery
      ? s
          .from("gallery_reviews")
          .select("id,client_name,rating,review_text,created_at")
          .eq("gallery_id", gallery.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const approvals = (approvalResult.data ?? []) as {
    id: string;
    client_name: string;
    approved_at: string;
  }[];
  const feedback = (feedbackResult.data ?? []) as Feedback[];
  const reviews = (reviewResult.data ?? []) as Review[];
  const feedbackCounts = {
    new: feedback.filter((f) => f.status === "new").length,
    inProgress: feedback.filter((f) => f.status === "in_progress").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  };
  const mediaNames = Object.fromEntries(
    (media ?? []).map((m) => [m.id, m.original_name]),
  );
  const previewPaths = Array.from(
    new Set(
      (media ?? [])
        .filter((m) => m.media_type === "image")
        .map((m) => m.thumbnail_path ?? m.storage_path)
        .filter(Boolean) as string[],
    ),
  );
  const signedByPath = new Map<string, string>();
  if (previewPaths.length) {
    const { data: signed } = await s.storage
      .from("media")
      .createSignedUrls(previewPaths, 60 * 10);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl)
        signedByPath.set(item.path, item.signedUrl);
    }
  }
  const sortableMedia = (media ?? []).map((m) => ({
    id: m.id,
    original_name: m.original_name,
    media_type: m.media_type,
    processing_status: m.processing_status,
    preview_url:
      m.media_type === "image"
        ? (signedByPath.get(m.thumbnail_path ?? m.storage_path) ?? null)
        : null,
  }));
  const publicUrl = gallery
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/g/${gallery.slug}`
    : null;
  const galleryTheme = ((gallery as unknown as { theme?: GalleryTheme } | null)
    ?.theme ?? "clean") as GalleryTheme;
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold tracking-[.17em] text-gray-400">
            GALLERY BUILDER
          </span>
          <h1 className="mt-1.5 text-[26px] tracking-[-.04em] md:text-[32px]">
            {project.name}
          </h1>
          {project.clients?.name && (
            <p className="mt-1 text-sm text-gray-400">
              For {project.clients.name}
            </p>
          )}
          {feedbackAllowed && feedback.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-gray-400">
                Feedback
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                {feedbackCounts.new} New
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {feedbackCounts.inProgress} In Progress
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                {feedbackCounts.resolved} Resolved
              </span>
            </div>
          )}
        </div>
        {gallery && (
          <PublishButton
            galleryId={gallery.id}
            isPublished={gallery.status === "published"}
          />
        )}
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div>
          <div className="bg-white border border-gray-200 rounded-[20px] p-5.5">
            <h3 className="text-[19px] font-semibold mb-4">Media</h3>
            <SortableMedia
              projectId={project.id}
              initialMedia={sortableMedia}
            />
            <MediaUploader workspaceId={workspace!.id} projectId={project.id} />
          </div>
          {gallery && feedbackAllowed && (
            <FeedbackInbox
              projectId={project.id}
              feedback={feedback}
              mediaNames={mediaNames}
              plan={workspace!.plan}
            />
          )}
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-[20px] p-5.5">
            <h3 className="text-[19px] font-semibold mb-4">Share</h3>
            {gallery?.status === "published" && publicUrl ? (
              <ShareBar url={publicUrl} clientName={project.clients?.name} />
            ) : (
              <p className="text-sm text-gray-400">
                Publish this gallery to get a shareable link for WhatsApp,
                email, or QR code.
              </p>
            )}
          </div>
          {gallery && (
            <GalleryThemePicker
              galleryId={gallery.id}
              initialTheme={galleryTheme}
            />
          )}{" "}
          {gallery && (
            <GallerySettings
              galleryId={gallery.id}
              plan={workspace!.plan}
              initial={{
                password_enabled: gallery.password_enabled,
                downloads_enabled: gallery.downloads_enabled,
                favorites_enabled: gallery.favorites_enabled,
                comments_enabled: gallery.comments_enabled,
                branding_enabled: gallery.branding_enabled,
                expiry_date: gallery.expiry_date,
              }}
            />
          )}
          {gallery && <ComingSoonGalleryTools />}
          {gallery && reviews.length > 0 && (
            <section className="mt-5 rounded-[20px] border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[19px] font-semibold">Client reviews</h3>
                <span className="rounded-full bg-[#fff8d5] px-2.5 py-1 text-[10px] font-extrabold text-[#806a00]">
                  {reviews.length}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl bg-gray-50 p-3.5"
                  >
                    <div className="text-sm tracking-[.08em] text-[#d6b600]">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-200">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-gray-700">
                      &ldquo;{review.review_text}&rdquo;
                    </p>
                    <p className="mt-2 text-[11px] font-bold text-gray-400">
                      {review.client_name} ·{" "}
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                      }).format(new Date(review.created_at))}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
          {workspace!.plan === "pro" && gallery && (
            <div className="mt-5 rounded-[20px] border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[19px] font-semibold">Client approval</h3>
                <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-extrabold text-white">
                  PRO
                </span>
              </div>
              {approvals.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {approvals.map((a) => (
                    <div key={a.id} className="rounded-xl bg-emerald-50 p-3">
                      <div className="text-sm font-bold text-emerald-800">
                        ✓ Approved by {a.client_name}
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-700/70">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(a.approved_at))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Waiting for the client to approve this delivery.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
