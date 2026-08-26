"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || crypto.randomUUID().slice(0, 8);
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function ownsWorkspace(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, workspaceId: string) {
  const { data } = await supabase.from("workspaces").select("id").eq("id", workspaceId).eq("owner_id", userId).maybeSingle();
  return Boolean(data);
}

async function getOwnedProject(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, projectId: string) {
  const { data } = await supabase.from("projects").select("id, workspace_id, workspaces!inner(owner_id)").eq("id", projectId).eq("workspaces.owner_id", userId).maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

async function ownsProject(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, projectId: string) {
  return Boolean(await getOwnedProject(supabase, userId, projectId));
}

async function ownsGallery(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, galleryId: string) {
  const { data } = await supabase.from("galleries").select("id, projects!inner(workspaces!inner(owner_id))").eq("id", galleryId).eq("projects.workspaces.owner_id", userId).maybeSingle();
  return Boolean(data);
}

export async function createWorkspace(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("studioName") || "").trim();
  if (!name) return { error: "Studio name is required." };
  const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;
  const { error } = await supabase.from("workspaces").insert({ owner_id: user.id, name, slug });
  if (error) return { error: error.message };
  revalidatePath("/dashboard"); redirect("/dashboard");
}

export async function createClientRecord(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const name = String(formData.get("clientName") || "").trim();
  if (!name) return { error: "Client name is required." };
  const { data, error } = await supabase.from("clients").insert({ workspace_id: workspaceId, name, email: String(formData.get("clientEmail") || "") || undefined }).select("id").single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function createProject(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const name = String(formData.get("projectName") || "").trim();
  if (!name) return { error: "Project name is required." };
  let clientId = String(formData.get("clientId") || "") || null;
  if (clientId) {
    const { data: client } = await supabase.from("clients").select("id").eq("id", clientId).eq("workspace_id", workspaceId).maybeSingle();
    if (!client) return { error: "That client doesn't belong to this workspace." };
  }
  const newClientName = String(formData.get("newClientName") || "").trim();
  if (!clientId && newClientName) {
    const { data: client, error: clientError } = await supabase.from("clients").insert({ workspace_id: workspaceId, name: newClientName }).select("id").single();
    if (clientError) return { error: clientError.message };
    clientId = client.id;
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

export async function recordMediaUpload(params: { projectId: string; fileName: string; originalName: string; mimeType: string; fileSize: number; storagePath: string; mediaType: "image" | "video" | "raw"; }) {
  const { supabase, user } = await requireUser();
  const project = await getOwnedProject(supabase, user.id, params.projectId);
  if (!project) return { error: "You don't have access to this project." };

  const mimeType = params.mimeType.toLowerCase().trim();
  const expectedType = ALLOWED_IMAGE_MIME.has(mimeType) ? "image" : ALLOWED_VIDEO_MIME.has(mimeType) ? "video" : null;
  if (!expectedType || params.mediaType !== expectedType) return { error: "This file type isn't supported." };
  if (!Number.isFinite(params.fileSize) || params.fileSize <= 0 || params.fileSize > MAX_UPLOAD_BYTES) return { error: "File size is invalid or exceeds the 500 MB limit." };
  if (!params.fileName || params.fileName.length > 255 || !params.originalName || params.originalName.length > 255) return { error: "Invalid file name." };
  if (params.storagePath.includes("..") || params.storagePath.startsWith("/")) return { error: "Invalid storage path." };
  const requiredPrefix = `${project.workspace_id}/${params.projectId}/`;
  if (!params.storagePath.startsWith(requiredPrefix)) return { error: "That upload path doesn't belong to this project." };

  const { data: gallery, error: galleryError } = await supabase.from("galleries").select("id").eq("project_id", params.projectId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (galleryError) return { error: galleryError.message };
  let sectionId: string | null = null;
  if (gallery) {
    const { data: existingSection, error: sectionLookupError } = await supabase.from("gallery_sections").select("id").eq("gallery_id", gallery.id).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    if (sectionLookupError) return { error: sectionLookupError.message };
    if (existingSection) sectionId = existingSection.id;
    else {
      const { data: createdSection, error: sectionCreateError } = await supabase.from("gallery_sections").insert({ gallery_id: gallery.id, title: "Gallery", section_type: "grid", sort_order: 0 }).select("id").single();
      if (sectionCreateError) return { error: sectionCreateError.message };
      sectionId = createdSection.id;
    }
  }
  const { error } = await supabase.from("media").insert({ project_id: params.projectId, gallery_section_id: sectionId, uploader_id: user.id, file_name: params.fileName, original_name: params.originalName, media_type: expectedType, mime_type: mimeType, file_size: params.fileSize, storage_path: params.storagePath, processing_status: expectedType === "video" ? "pending" : "ready" });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${params.projectId}`); revalidatePath("/projects"); return { success: true };
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
  if (!(await ownsGallery(supabase, user.id, galleryId))) return { error: "You don't have access to this gallery." };
  const { error } = await supabase.from("galleries").update({ status: publish ? "published" : "unpublished", published_at: publish ? new Date().toISOString() : null }).eq("id", galleryId);
  if (error) return { error: error.message };
  revalidatePath("/projects"); return { success: true };
}

export async function updateBranding(workspaceId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!(await ownsWorkspace(supabase, user.id, workspaceId))) return { error: "You don't have access to this workspace." };
  const { error } = await supabase.from("workspaces").update({ name: String(formData.get("studioName") || ""), accent_color: String(formData.get("accentColor") || "#FFD400") }).eq("id", workspaceId).eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings"); return { success: true };
}

export async function signOut() {
  const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login");
}
