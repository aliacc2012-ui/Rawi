import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG } from "@/lib/plans";

type PaidPlan = "creator" | "pro";
type ZiinaStatus = "requires_payment_instrument" | "requires_user_action" | "pending" | "completed" | "failed" | "canceled";
type ZiinaPayment = { id?: string; status?: ZiinaStatus; amount?: number; currency_code?: string };
type ZiinaEvent = { event?: string; data?: ZiinaPayment };
type ActivationResult = { already_applied?: boolean; plan?: PaidPlan; current_period_end?: string };

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
  if (event.event !== "payment_intent.status.updated" || !event.data?.id) return NextResponse.json({ received: true });

  // Never trust webhook money or status by itself. Re-fetch the intent from Ziina.
  const verifyResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${encodeURIComponent(event.data.id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payment = (await verifyResponse.json().catch(() => ({}))) as ZiinaPayment;
  if (!verifyResponse.ok || !payment.id || payment.id !== event.data.id || !payment.status) return NextResponse.json({ error: "Ziina payment verification failed." }, { status: 400 });

  const admin = createAdminClient();
  const { data: attempt, error: attemptError } = await admin.from("billing_payment_attempts").select("workspace_id,plan,amount,currency_code,status,completed_at").eq("ziina_payment_intent_id", payment.id).maybeSingle();
  if (attemptError || !attempt) return NextResponse.json({ error: "Unknown payment intent." }, { status: 400 });

  const plan = attempt.plan as PaidPlan;
  if (plan !== "creator" && plan !== "pro") return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
  const expectedAmount = PLAN_CONFIG[plan].priceAed * 100;
  if (payment.currency_code !== "AED" || payment.amount !== expectedAmount || attempt.currency_code !== "AED" || attempt.amount !== expectedAmount) {
    return NextResponse.json({ error: "Payment amount doesn't match the selected plan." }, { status: 400 });
  }

  if (payment.status !== "completed") {
    const { error: statusError } = await admin.from("billing_payment_attempts").update({ status: payment.status }).eq("ziina_payment_intent_id", payment.id);
    if (statusError) return NextResponse.json({ error: "Couldn't save Ziina payment status." }, { status: 500 });
    return NextResponse.json({ received: true, status: payment.status });
  }

  const { data: activation, error: activationError } = await admin.rpc("activate_ziina_payment", { p_payment_intent_id: payment.id });
  if (activationError) return NextResponse.json({ error: "Couldn't activate RAWI plan." }, { status: 500 });

  const result = activation as ActivationResult | null;
  return NextResponse.json({
    received: true,
    activated: result?.plan ?? plan,
    currentPeriodEnd: result?.current_period_end,
    alreadyApplied: result?.already_applied ?? false,
  });
}
