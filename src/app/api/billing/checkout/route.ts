import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_CONFIG } from "@/lib/plans";

type PaidPlan = "creator" | "pro";
type DiscountOffer = {
  key: string;
  percentage: 10 | 50 | 100;
  maxUses: number;
};

const DISCOUNT_OFFERS: Record<string, DiscountOffer> = {
  "8acec51e2a46aefdca51f856262ed79b56cdc67214a7bb5e69156a6568efa316": {
    key: "launch_full_2026",
    percentage: 100,
    maxUses: 5,
  },
  "81c94bf77d52f408c7b0dba23d21c4424e32c1a39d5b96a3ec9cc2bfb3ea1d0a": {
    key: "launch_half_2026",
    percentage: 50,
    maxUses: 25,
  },
  a2530c3b22691eba53bfd821403a4e69a3219643da5116e8debc02fa0dad14fa: {
    key: "launch_ten_2026",
    percentage: 10,
    maxUses: 100,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );

  const body = (await request.json().catch(() => null)) as {
    plan?: PaidPlan;
    workspaceId?: string;
    discountCode?: string;
    billing?: "monthly" | "annual";
  } | null;
  if (
    !body?.plan ||
    !body.workspaceId ||
    !["creator", "pro"].includes(body.plan)
  )
    return NextResponse.json(
      { error: "Invalid plan selection." },
      { status: 400 },
    );

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role))
    return NextResponse.json(
      { error: "You don't have permission to manage billing." },
      { status: 403 },
    );

  const plan = PLAN_CONFIG[body.plan];
  const isAnnual = body.billing === "annual";
  const monthlyAed = plan.priceAed * 100;
  const originalAmount = isAnnual
    ? Math.round(monthlyAed * 12 * 0.85)
    : monthlyAed;
  const normalizedCode = body.discountCode?.trim().toUpperCase() ?? "";
  const codeHash = normalizedCode
    ? createHash("sha256").update(normalizedCode).digest("hex")
    : "";
  const offer = normalizedCode ? DISCOUNT_OFFERS[codeHash] : undefined;
  if (normalizedCode && !offer)
    return NextResponse.json(
      { error: "This discount code is not valid." },
      { status: 400 },
    );

  const finalAmount = offer
    ? Math.round(originalAmount * (1 - offer.percentage / 100))
    : originalAmount;
  const admin = createAdminClient();
  let redemptionId: string | null = null;

  if (offer) {
    const { data, error } = await admin.rpc("claim_rawi_discount", {
      p_workspace_id: body.workspaceId,
      p_user_id: user.id,
      p_code_key: offer.key,
      p_discount_percentage: offer.percentage,
      p_max_uses: offer.maxUses,
      p_plan: body.plan,
      p_original_amount: originalAmount,
      p_final_amount: finalAmount,
    });
    if (error)
      return NextResponse.json(
        {
          error: error.message.includes("usage limit")
            ? "This code has reached its usage limit."
            : "This workspace cannot use that discount code.",
        },
        { status: 400 },
      );
    const result = data as {
      redemption_id?: string;
      activated?: boolean;
      current_period_end?: string;
    } | null;
    redemptionId = result?.redemption_id ?? null;
    if (result?.activated)
      return NextResponse.json({
        activated: true,
        discountPercentage: offer.percentage,
        currentPeriodEnd: result.current_period_end,
      });
  }

  const accessToken = process.env.ZIINA_ACCESS_TOKEN;
  if (!accessToken) {
    if (redemptionId)
      await admin
        .from("discount_redemptions")
        .update({ status: "failed" })
        .eq("id", redemptionId);
    return NextResponse.json(
      { error: "Ziina isn't connected yet.", code: "BILLING_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin;
  const testMode = process.env.ZIINA_TEST_MODE === "true";
  const ziinaResponse = await fetch(
    "https://api-v2.ziina.com/api/payment_intent",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency_code: "AED",
        message: `RAWI ${plan.name} - 30 days${offer ? ` (${offer.percentage}% off)` : ""}`,
        success_url: `${origin}/settings?billing=success&payment_intent_id={PAYMENT_INTENT_ID}`,
        cancel_url: `${origin}/settings?billing=cancelled`,
        failure_url: `${origin}/settings?billing=failed`,
        test: testMode,
        expiry: String(Date.now() + 30 * 60 * 1000),
        allow_tips: false,
      }),
      cache: "no-store",
    },
  );
  const payment = (await ziinaResponse.json().catch(() => ({}))) as {
    id?: string;
    redirect_url?: string;
    status?: string;
    latest_error?: { message?: string };
    message?: string;
  };
  if (!ziinaResponse.ok || !payment.redirect_url || !payment.id) {
    if (redemptionId)
      await admin
        .from("discount_redemptions")
        .update({ status: "failed" })
        .eq("id", redemptionId);
    return NextResponse.json(
      {
        error:
          payment.latest_error?.message ||
          payment.message ||
          "Couldn't create Ziina checkout.",
      },
      { status: 502 },
    );
  }

  const { error: attemptError } = await admin
    .from("billing_payment_attempts")
    .insert({
      workspace_id: body.workspaceId,
      user_id: user.id,
      plan: body.plan,
      amount: finalAmount,
      original_amount: originalAmount,
      discount_percentage: offer?.percentage ?? 0,
      discount_redemption_id: redemptionId,
      currency_code: "AED",
      status:
        payment.status === "pending"
          ? "pending"
          : "requires_payment_instrument",
      ziina_payment_intent_id: payment.id,
      test_mode: testMode,
    });
  if (attemptError) {
    if (redemptionId)
      await admin
        .from("discount_redemptions")
        .update({ status: "failed" })
        .eq("id", redemptionId);
    return NextResponse.json(
      { error: "Couldn't prepare RAWI billing state. Please try again." },
      { status: 500 },
    );
  }
  if (redemptionId)
    await admin
      .from("discount_redemptions")
      .update({ ziina_payment_intent_id: payment.id })
      .eq("id", redemptionId);
  return NextResponse.json({
    url: payment.redirect_url,
    paymentIntentId: payment.id,
    testMode,
    discountPercentage: offer?.percentage ?? 0,
  });
}
