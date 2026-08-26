import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PLAN_STORAGE: Record<"free" | "creator" | "pro", number> = {
  free: 5 * 1024 ** 3,
  creator: 100 * 1024 ** 3,
  pro: 500 * 1024 ** 3,
};

function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature);
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

async function updateWorkspacePlan(workspaceId: string, plan: "free" | "creator" | "pro") {
  const admin = createAdminClient();
  const { error } = await admin.from("workspaces").update({ plan, storage_limit_bytes: PLAN_STORAGE[plan] }).eq("id", workspaceId);
  if (error) throw error;

  if (plan === "free") {
    const { data: projects, error: projectsError } = await admin.from("projects").select("id").eq("workspace_id", workspaceId);
    if (projectsError) throw projectsError;
    const projectIds = (projects ?? []).map((project) => project.id);
    if (projectIds.length > 0) {
      const { error: galleryError } = await admin.from("galleries").update({ branding_enabled: true, password_enabled: false, password_hash: null }).in("project_id", projectIds);
      if (galleryError) throw galleryError;
    }
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Stripe webhook isn't configured." }, { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });

  const event = JSON.parse(payload) as { type?: string; data?: { object?: { status?: string; metadata?: Record<string, string> } } };
  const object = event.data?.object;
  const workspaceId = object?.metadata?.workspace_id;
  const requestedPlan = object?.metadata?.plan;

  try {
    if (workspaceId) {
      if (event.type === "checkout.session.completed" && (requestedPlan === "creator" || requestedPlan === "pro")) await updateWorkspacePlan(workspaceId, requestedPlan);
      if (event.type === "customer.subscription.updated") {
        const active = object?.status === "active" || object?.status === "trialing";
        if (active && (requestedPlan === "creator" || requestedPlan === "pro")) await updateWorkspacePlan(workspaceId, requestedPlan);
      }
      if (event.type === "customer.subscription.deleted") await updateWorkspacePlan(workspaceId, "free");
    }
  } catch {
    return NextResponse.json({ error: "Couldn't apply subscription changes." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
