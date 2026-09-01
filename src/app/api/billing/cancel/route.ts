import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { workspaceId: string };
  if (!body.workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

  const admin = createAdminClient();

  // Verify the user owns this workspace
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, plan")
    .eq("id", body.workspaceId)
    .eq("owner_id", user.id)
    .single();

  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  if (workspace.plan === "free") return NextResponse.json({ error: "Already on free plan" }, { status: 400 });

  // Mark subscription as canceled — expire-subscriptions cron will downgrade when period ends
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("workspace_id", body.workspaceId)
    .eq("status", "active");

  if (error) return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });

  return NextResponse.json({ success: true });
}
