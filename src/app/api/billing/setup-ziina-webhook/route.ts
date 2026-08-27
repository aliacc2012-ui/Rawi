import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Owner access required." }, { status: 403 });

  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!accessToken || !webhookSecret || !appUrl) {
    return NextResponse.json({ error: "Ziina token, webhook secret, or app URL is missing." }, { status: 503 });
  }

  const webhookUrl = `${appUrl}/api/billing/webhook`;
  const response = await fetch("https://api-v2.ziina.com/api/webhook", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: webhookUrl, secret: webhookSecret }),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string };
  if (!response.ok || result.success !== true) {
    return NextResponse.json({ error: result.error || "Ziina webhook registration failed." }, { status: 502 });
  }

  return NextResponse.json({ success: true, webhookUrl });
}
