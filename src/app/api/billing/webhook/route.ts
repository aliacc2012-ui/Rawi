import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG } from "@/lib/plans";

type PaidPlan = "creator" | "pro";
type ZiinaPayment = { id?: string; status?: string; amount?: number; currency_code?: string };
type ZiinaEvent = { event?: string; data?: ZiinaPayment };

function validSignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.ZIINA_WEBHOOK_SECRET;
  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  if (!webhookSecret || !accessToken) return NextResponse.json({ error: "Ziina webhook isn't configured." }, { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("x-hmac-signature");
  if (!signature || !validSignature(payload, signature, webhookSecret)) return NextResponse.json({ error: "Invalid Ziina signature." }, { status: 400 });

  let event: ZiinaEvent;
  try { event = JSON.parse(payload) as ZiinaEvent; } catch { return NextResponse.json({ error: "Invalid payload." }, { status: 400 }); }
  if (event.event !== "payment_intent.status.updated" || event.data?.status !== "completed" || !event.data.id) return NextResponse.json({ received: true });

  // Never trust the webhook payload alone for money or status. Re-fetch the intent directly from Ziina.
  const verifyResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${encodeURIComponent(event.data.id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payment = (await verifyResponse.json().catch(() => ({}))) as ZiinaPayment;
  if (!verifyResponse.ok || payment.status !== "completed" || payment.id !== event.data.id) return NextResponse.json({ error: "Ziina payment verification failed." }, { status: 400 });

  const admin = createAdminClient();
  const { data: subscription, error: subscriptionError } = await admin.from("subscriptions").select("workspace_id,plan,status,current_period_end").eq("ziina_payment_intent_id", payment.id).maybeSingle();
  if (subscriptionError || !subscription) return NextResponse.json({ error: "Unknown payment intent." }, { status: 400 });

  const plan = subscription.plan as PaidPlan;
  if (plan !== "creator" && plan !== "pro") return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
  const expectedAmount = PLAN_CONFIG[plan].priceAed * 100;
  if (payment.currency_code !== "AED" || payment.amount !== expectedAmount) return NextResponse.json({ error: "Payment amount doesn't match the selected plan." }, { status: 400 });

  // Idempotent: Ziina retries webhooks; don't extend the pass twice for the same payment intent.
  if (subscription.status === "active" && subscription.current_period_end) return NextResponse.json({ received: true, alreadyApplied: true });

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const storageLimit = PLAN_CONFIG[plan].storageBytes;
  const { error: workspaceError } = await admin.from("workspaces").update({ plan, storage_limit_bytes: storageLimit }).eq("id", subscription.workspace_id);
  if (workspaceError) return NextResponse.json({ error: "Couldn't activate RAWI plan." }, { status: 500 });

  const { error: updateError } = await admin.from("subscriptions").update({ status: "active", current_period_end: periodEnd, provider: "ziina" }).eq("ziina_payment_intent_id", payment.id);
  if (updateError) return NextResponse.json({ error: "Couldn't save RAWI billing period." }, { status: 500 });

  return NextResponse.json({ received: true, activated: plan, currentPeriodEnd: periodEnd });
}
