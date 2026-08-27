import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG } from "@/lib/plans";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: expired, error } = await admin
    .from("subscriptions")
    .select("id,workspace_id")
    .eq("status", "active")
    .lt("current_period_end", now);

  if (error) return NextResponse.json({ error: "Couldn't load expired subscriptions." }, { status: 500 });
  if (!expired?.length) return NextResponse.json({ expired: 0 });

  let processed = 0;
  for (const subscription of expired) {
    const { error: workspaceError } = await admin
      .from("workspaces")
      .update({ plan: "free", storage_limit_bytes: PLAN_CONFIG.free.storageBytes })
      .eq("id", subscription.workspace_id);
    if (workspaceError) continue;

    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", subscription.id)
      .eq("status", "active");
    if (!subscriptionError) processed += 1;
  }

  return NextResponse.json({ expired: processed });
}
