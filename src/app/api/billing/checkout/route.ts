import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PRICE_ENV: Record<"creator" | "pro", string> = {
  creator: "STRIPE_CREATOR_PRICE_ID",
  pro: "STRIPE_PRO_PRICE_ID",
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: "creator" | "pro"; workspaceId?: string } | null;
  if (!body?.plan || !body.workspaceId || !["creator", "pro"].includes(body.plan)) {
    return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "You don't have permission to manage billing." }, { status: 403 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[PRICE_ENV[body.plan]];
  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Stripe isn't connected yet.", code: "BILLING_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const origin = configuredAppUrl || request.nextUrl.origin;
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/settings?billing=success`);
  params.set("cancel_url", `${origin}/settings?billing=cancelled`);
  params.set("client_reference_id", body.workspaceId);
  params.set("metadata[workspace_id]", body.workspaceId);
  params.set("metadata[plan]", body.plan);
  params.set("subscription_data[metadata][workspace_id]", body.workspaceId);
  params.set("subscription_data[metadata][plan]", body.plan);
  params.set("allow_promotion_codes", "true");
  if (user.email) params.set("customer_email", user.email);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  });

  const session = (await stripeResponse.json()) as { url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !session.url) {
    return NextResponse.json({ error: session.error?.message || "Couldn't create Stripe checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
