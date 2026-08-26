"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FeedbackStatus = "new" | "in_progress" | "resolved";

export async function updateFeedbackStatus(projectId: string, commentId: string, status: FeedbackStatus) {
  if (!["new", "in_progress", "resolved"].includes(status)) return { error: "Invalid feedback status." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: project } = await supabase
    .from("projects")
    .select("id,workspace_id,workspaces!inner(owner_id)")
    .eq("id", projectId)
    .eq("workspaces.owner_id", user.id)
    .maybeSingle();

  if (!project) return { error: "You don't have access to this project." };

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id")
    .eq("project_id", projectId)
    .limit(1)
    .maybeSingle();

  if (!gallery) return { error: "Gallery not found." };

  const { data: comment } = await supabase
    .from("gallery_comments")
    .select("id")
    .eq("id", commentId)
    .eq("gallery_id", gallery.id)
    .maybeSingle();

  if (!comment) return { error: "Feedback not found." };

  const { error } = await supabase
    .from("gallery_comments")
    .update({ status })
    .eq("id", commentId)
    .eq("gallery_id", gallery.id);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
