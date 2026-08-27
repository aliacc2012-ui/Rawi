import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG } from "@/lib/plans";

type PaidPlan = "creator" | "pro";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: PaidPlan; workspaceId?: string } | null;
  if (!body?.plan || !body.workspaceId || !["creator", "pro"].includes(body.plan)) return NextResponse.json({ error: "Invalid plan selection." }, { status: 400 });

  const { data: membership } = await supabase.from("workspace_members").select("role").eq("workspace_id", body.workspaceId).eq("user_id", user.id).maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) return NextResponse.json({ error: "You don't have permission to manage billing." }, { status: 403 });

  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ error: "Ziina isn't connected yet.", code: "BILLING_NOT_CONFIGURED" }, { status: 503 });

  const plan = PLAN_CONFIG[body.plan];
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const origin = configuredAppUrl || request.nextUrl.origin;
  const expiry = String(Date.now() + 30 * 60 * 1000);

  const ziinaResponse = await fetch("https://api-v2.ziina.com/api/payment_intent", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: plan.priceAed * 100,
      currency_code: "AED",
      message: `RAWI ${plan.name} - 30 days`,
      success_url: `${origin}/settings?billing=success&payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `${origin}/settings?billing=cancelled`,
      failure_url: `${origin}/settings?billing=failed`,
      test: process.env.ZIINA_TEST_MODE !== "false",
      expiry,
      allow_tips: false,
    }),
    cache: "no-store",
  });

  const payment = (await ziinaResponse.json().catch(() => ({}))) as { id?: string; redirect_url?: string; latest_error?: { message?: string }; message?: string };
  if (!ziinaResponse.ok || !payment.redirect_url || !payment.id) return NextResponse.json({ error: payment.latest_error?.message || payment.message || "Couldn't create Ziina checkout." }, { status: 502 });

  // Record the requested plan against Ziina's immutable payment-intent ID before redirecting.
  // The webhook uses this server-side mapping instead of trusting browser query parameters.
  const admin = createAdminClient();
  const { error: billingError } = await admin.from("subscriptions").upsert({
    workspace_id: body.workspaceId,
    plan: body.plan,
    status: "incomplete",
    current_period_end: null,
    ziina_payment_intent_id: payment.id,
    provider: "ziina",
  }, { onConflict: "workspace_id" });

  if (billingError) return NextResponse.json({ error: "Couldn't prepare RAWI billing state. Please try again." }, { status: 500 });
  return NextResponse.json({ url: payment.redirect_url, paymentIntentId: payment.id });
}
