import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { activatePremium } from "@/lib/activatePremium";
import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  // Header format: t=<timestamp>,te=<test_sig>,li=<live_sig>
  const parts: Record<string, string> = {};
  for (const part of sigHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx !== -1) parts[part.slice(0, idx)] = part.slice(idx + 1);
  }
  const timestamp = parts["t"];
  const signature = parts["li"] ?? parts["te"]; // live first, fall back to test
  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  return expected === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sigHeader = req.headers.get("paymongo-signature");

  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (webhookSecret) {
    if (!sigHeader || !verifySignature(body, sigHeader, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    console.warn("PAYMONGO_WEBHOOK_SECRET not set — skipping signature verification");
  }

  const event = JSON.parse(body);
  const eventType: string = event?.data?.attributes?.type;

  if (eventType === "checkout_session.payment.paid") {
    const session = event?.data?.attributes?.data;
    const attrs = session?.attributes;
    const userId: string | undefined = attrs?.metadata?.user_id;
    const planType: "monthly" | "annual" =
      attrs?.metadata?.plan_type === "annual" ? "annual" : "monthly";

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id in metadata" }, { status: 400 });
    }

    const durationDays = planType === "annual" ? 365 : 30;
    const supabase = createAdminClient();

    // Extend from current expiry if still active, otherwise start from now
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan, plan_expires_at")
      .eq("id", userId)
      .single();

    const now = new Date();
    const base =
      profile?.plan === "premium" &&
      profile.plan_expires_at &&
      new Date(profile.plan_expires_at) > now
        ? new Date(profile.plan_expires_at)
        : now;

    const expiresAt = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await activatePremium(userId, expiresAt, planType);

    const paymentId: string =
      attrs?.payments?.[0]?.id ?? session?.id ?? "unknown";
    const amountCents: number = attrs?.line_items?.[0]?.amount ?? 0;

    await supabase.from("subscriptions").insert({
      user_id: userId,
      provider: "paymongo",
      provider_subscription_id: paymentId,
      status: "active",
      amount_cents: amountCents,
      currency: "PHP",
      expires_at: expiresAt.toISOString(),
      plan_type: planType,
    });
  }

  return NextResponse.json({ received: true });
}
