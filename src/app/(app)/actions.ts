"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || crypto.randomUUID().slice(0, 8);
}

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("studioName") || "").trim();
  if (!name) return { error: "Studio name is required." };

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const { error } = await supabase.from("workspaces").insert({
    owner_id: user.id,
    name,
    slug,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createClientRecord(workspaceId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("clientName") || "").trim();
  if (!name) return { error: "Client name is required." };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      workspace_id: workspaceId,
      name,
      email: String(formData.get("clientEmail") || "") || undefined,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function createProject(workspaceId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("projectName") || "").trim();
  if (!name) return { error: "Project name is required." };

  let clientId = String(formData.get("clientId") || "") || null;
  const newClientName = String(formData.get("newClientName") || "").trim();
  if (!clientId && newClientName) {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({ workspace_id: workspaceId, name: newClientName })
      .select("id")
      .single();
    if (clientError) return { error: clientError.message };
    clientId = client.id;
  }

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      client_id: clientId,
      name,
      slug,
      project_type: (String(formData.get("projectType") || "photography")) as never,
      project_date: String(formData.get("projectDate") || "") || null,
      description: String(formData.get("description") || "") || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("galleries").insert({
    project_id: project.id,
    title: name,
    slug: `${slug}-${crypto.randomUUID().slice(0, 8)}`,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function recordMediaUpload(params: {
  projectId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  mediaType: "image" | "video" | "raw";
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("media").insert({
    project_id: params.projectId,
    uploader_id: user.id,
    file_name: params.fileName,
    original_name: params.originalName,
    media_type: params.mediaType,
    mime_type: params.mimeType,
    file_size: params.fileSize,
    storage_path: params.storagePath,
    processing_status: params.mediaType === "video" ? "pending" : "ready",
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects`);
  return { success: true };
}

export async function addSection(galleryId: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_sections").insert({ gallery_id: galleryId, title });
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}

export async function publishGallery(galleryId: string, publish: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("galleries")
    .update({ status: publish ? "published" : "unpublished", published_at: publish ? new Date().toISOString() : null })
    .eq("id", galleryId);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}

export async function updateBranding(workspaceId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      name: String(formData.get("studioName") || ""),
      accent_color: String(formData.get("accentColor") || "#FFD400"),
    })
    .eq("id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
