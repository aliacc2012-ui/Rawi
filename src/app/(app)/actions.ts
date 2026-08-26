"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);
type AppSupabaseClient = Awaited<ReturnType<typeof createClient>>;
type WorkspacePlan = "free" | "creator" | "pro" | "studio";

type OwnedWorkspace = {
  id: string;
  plan: WorkspacePlan;
  storage_limit_bytes: number;
};

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || crypto.randomUUID().slice(0, 8);
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function getOwnedWorkspace(supabase: AppSupabaseClient, userId: string, workspaceId: string): Promise<OwnedWorkspace | null> {
  const { data } = await supabase
    .from("workspaces")
    .select("id, plan, storage_limit_bytes")
    .eq("id", workspaceId)
    .eq("owner_id", userId)
    .maybeSingle();
  return data as OwnedWorkspace | null;
}

async function ownsWorkspace(supabase: AppSupabaseClient, userId: string, workspaceId: string) {
  return Boolean(await getOwnedWorkspace(supabase, userId, workspaceId));
}

async function getOwnedProject(supabase: AppSupabaseClient, userId: string, projectId: string) {
  const { data } = await supabase
    .from("projects")
    .select("id, workspace_id, workspaces!inner(owner_id)")
    .eq("id", projectId)
    .eq("workspaces.owner_id", userId)
    .maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

async function getOwnedGalleryContext(supabase: AppSupabaseClient, userId: string, galleryId: string) {
  const { data: gallery } = await supabase.from("galleries").select("id, project_id, status").eq("id", galleryId).maybeSingle();
  if (!gallery) return null;
  const project = await getOwnedProject(supabase, userId, gallery.project_id);
  if (!project) return null;
  const workspace = await getOwnedWorkspace(supabase, userId, project.workspace_id);
  if (!workspace) return null;
  return { gallery, project, workspace };
}

async function ownsGallery(supabase: AppSupabaseClient, userId: string, galleryId: string) {
  return Boolean(await getOwnedGalleryContext(supabase, userId, galleryId));
}

function safeUrl(value: string): string | null | undefined {
  const clean = value.trim();
  if (!clean) return null;
  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol) || candidate.length > 500) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export async function updateSocialLinks(workspaceId: string, links: { instagram: string; tiktok: string; facebook: string; website: string }) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const instagram_url = safeUrl(links.instagram); if (instagram_url === undefined) return { error: "Please enter a valid Instagram URL." };
  const tiktok_url = safeUrl(links.tiktok); if (tiktok_url === undefined) return { error: "Please enter a valid TikTok URL." };
  const facebook_url = safeUrl(links.facebook); if (facebook_url === undefined) return { error: "Please enter a valid Facebook URL." };
  const website_url = safeUrl(links.website); if (website_url === undefined) return { error: "Please enter a valid website URL." };
  const { error } = await supabase.from("workspaces").update({ instagram_url, tiktok_url, facebook_url, website_url }).eq("id", workspaceId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings"); revalidatePath("/dashboard");
  return { success: true };
}

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("studioName") || "").trim();
  if (!name) return { error: "Studio name is required." };
  const { error } = await supabase.from("workspaces").insert({ owner_id: user.id, name, slug: `${slugify(name)}-${user.id.slice(0, 6)}` });
  if (error) return { error: error.message };
  revalidatePath("/dashboard"); redirect("/dashboard");
}

export async function createClientRecord(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const name = String(formData.get("clientName") || "").trim();
  if (!name) return { error: "Client name is required." };
  const { data, error } = await supabase.from("clients").insert({ workspace_id: workspaceId, name, email: String(formData.get("clientEmail") || "") || undefined }).select("id").single();
  return error ? { error: error.message } : { id: data.id };
}

export async function createProject(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const name = String(formData.get("projectName") || "").trim();
  if (!name) return { error: "Project name is required." };
  let clientId = String(formData.get("clientId") || "") || null;
  if (clientId) {
    const { data } = await supabase.from("clients").select("id").eq("id", clientId).eq("workspace_id", workspaceId).maybeSingle();
    if (!data) return { error: "That client doesn't belong to this workspace." };
  }
  const newName = String(formData.get("newClientName") || "").trim();
  if (!clientId && newName) {
    const { data, error } = await supabase.from("clients").insert({ workspace_id: workspaceId, name: newName }).select("id").single();
    if (error) return { error: error.message };
    clientId = data.id;
  }
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const { data: project, error } = await supabase.from("projects").insert({ workspace_id: workspaceId, client_id: clientId, name, slug, project_type: String(formData.get("projectType") || "photography") as never, project_date: String(formData.get("projectDate") || "") || null, description: String(formData.get("description") || "") || null }).select("id").single();
  if (error) return { error: error.message };
  const { data: gallery, error: galleryError } = await supabase.from("galleries").insert({ project_id: project.id, title: name, slug: `${slug}-${crypto.randomUUID().slice(0, 8)}` }).select("id").single();
  if (galleryError) return { error: galleryError.message };
  const { error: sectionError } = await supabase.from("gallery_sections").insert({ gallery_id: gallery.id, title: "Gallery", section_type: "grid", sort_order: 0 });
  if (sectionError) return { error: sectionError.message };
  revalidatePath("/projects"); revalidatePath("/dashboard"); redirect(`/projects/${project.id}`);
}

export async function recordMediaUpload(p: { projectId: string; fileName: string; originalName: string; mimeType: string; fileSize: number; storagePath: string; mediaType: "image" | "video" | "raw" }) {
  const { supabase, user } = await requireUser();
  const project = await getOwnedProject(supabase, user.id, p.projectId);
  if (!project) return { error: "You don't have access to this project." };
  const workspace = await getOwnedWorkspace(supabase, user.id, project.workspace_id);
  if (!workspace) return { error: "You don't have access to this workspace." };

  const mime = p.mimeType.toLowerCase().trim();
  const expected = ALLOWED_IMAGE_MIME.has(mime) ? "image" : ALLOWED_VIDEO_MIME.has(mime) ? "video" : null;
  if (!expected || p.mediaType !== expected) return { error: "This file type isn't supported." };
  if (!Number.isFinite(p.fileSize) || p.fileSize <= 0 || p.fileSize > MAX_UPLOAD_BYTES) return { error: "File size is invalid or exceeds the 500 MB limit." };
  if (!p.fileName || p.fileName.length > 255 || !p.originalName || p.originalName.length > 255) return { error: "Invalid file name." };
  if (p.storagePath.includes("..") || p.storagePath.startsWith("/") || !p.storagePath.startsWith(`${project.workspace_id}/${p.projectId}/`)) return { error: "Invalid storage path." };

  const { data: projectRows } = await supabase.from("projects").select("id").eq("workspace_id", workspace.id);
  const projectIds = (projectRows ?? []).map((row) => row.id);
  let currentUsage = 0;
  if (projectIds.length) {
    const { data: mediaRows } = await supabase.from("media").select("file_size").in("project_id", projectIds);
    currentUsage = (mediaRows ?? []).reduce((sum, item) => sum + item.file_size, 0);
  }
  if (currentUsage + p.fileSize > workspace.storage_limit_bytes) {
    return { error: `Storage limit reached for your ${workspace.plan.toUpperCase()} plan. Upgrade or remove files to continue.` };
  }

  const { data: gallery } = await supabase.from("galleries").select("id").eq("project_id", p.projectId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  let sectionId: string | null = null;
  if (gallery) {
    const { data: section } = await supabase.from("gallery_sections").select("id").eq("gallery_id", gallery.id).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    if (section) sectionId = section.id;
    else {
      const { data, error } = await supabase.from("gallery_sections").insert({ gallery_id: gallery.id, title: "Gallery", section_type: "grid", sort_order: 0 }).select("id").single();
      if (error) return { error: error.message };
      sectionId = data.id;
    }
  }
  const { error } = await supabase.from("media").insert({ project_id: p.projectId, gallery_section_id: sectionId, uploader_id: user.id, file_name: p.fileName, original_name: p.originalName, media_type: expected, mime_type: mime, file_size: p.fileSize, storage_path: p.storagePath, processing_status: expected === "video" ? "pending" : "ready" });
  if (error) return { error: error.message };
  await supabase.from("workspaces").update({ storage_used_bytes: currentUsage + p.fileSize }).eq("id", workspace.id).eq("owner_id", user.id);
  revalidatePath(`/projects/${p.projectId}`); revalidatePath("/projects"); revalidatePath("/dashboard"); revalidatePath("/settings");
  return { success: true };
}

export async function addSection(galleryId: string, title: string) {
  const { supabase, user } = await requireUser();
  if (!(await ownsGallery(supabase, user.id, galleryId))) return { error: "You don't have access to this gallery." };
  const { error } = await supabase.from("gallery_sections").insert({ gallery_id: galleryId, title });
  if (error) return { error: error.message };
  revalidatePath("/projects"); return { success: true };
}

export async function publishGallery(galleryId: string, publish: boolean) {
  const { supabase, user } = await requireUser();
  const context = await getOwnedGalleryContext(supabase, user.id, galleryId);
  if (!context) return { error: "You don't have access to this gallery." };

  if (publish && context.workspace.plan === "free" && context.gallery.status !== "published") {
    const { data: projects } = await supabase.from("projects").select("id").eq("workspace_id", context.workspace.id);
    const projectIds = (projects ?? []).map((project) => project.id);
    if (projectIds.length) {
      const { count } = await supabase.from("galleries").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("status", "published");
      if ((count ?? 0) >= 3) return { error: "Free plan supports up to 3 published galleries. Unpublish one or upgrade to Creator." };
    }
  }

  const publishedAt = publish ? new Date() : null;
  const expiryDate = publish && context.workspace.plan === "free"
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const update: { status: "published" | "unpublished"; published_at: string | null; expiry_date?: string } = {
    status: publish ? "published" : "unpublished",
    published_at: publishedAt ? publishedAt.toISOString() : null,
  };
  if (expiryDate) update.expiry_date = expiryDate;

  const { error } = await supabase.from("galleries").update(update).eq("id", galleryId);
  if (error) return { error: error.message };
  revalidatePath("/projects"); revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBranding(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const { error } = await supabase.from("workspaces").update({ name: String(formData.get("studioName") || ""), accent_color: String(formData.get("accentColor") || "#FFD400") }).eq("id", workspaceId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings"); return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
