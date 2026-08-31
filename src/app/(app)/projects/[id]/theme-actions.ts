"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GalleryTheme =
  | "clean"
  | "dark"
  | "editorial"
  | "noir"
  | "blush"
  | "forest"
  | "slate"
  | "ivory"
  | "midnight"
  | "ember";

const VALID_THEMES: GalleryTheme[] = [
  "clean", "dark", "editorial", "noir", "blush",
  "forest", "slate", "ivory", "midnight", "ember",
];

export async function updateGalleryTheme(galleryId: string, theme: GalleryTheme) {
  if (!VALID_THEMES.includes(theme)) return { error: "Invalid gallery theme." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id,slug,project_id,projects!inner(id,workspace_id,workspaces!inner(owner_id))")
    .eq("id", galleryId)
    .eq("projects.workspaces.owner_id", user.id)
    .maybeSingle();
  if (!gallery) return { error: "You don't have access to this gallery." };

  const { error } = await supabase.from("galleries").update({ theme } as never).eq("id", galleryId);
  if (error) return { error: error.message };

  const projectId = gallery.project_id;
  revalidatePath(`/projects/${projectId}`);
  const gSlug = (gallery as unknown as { slug?: string }).slug;
  if (gSlug) revalidateTag(`gallery-slug:${gSlug}`);
  return { success: true };
}
