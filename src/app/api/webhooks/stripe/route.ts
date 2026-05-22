import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { activatePremium, deactivatePremium } from "@/lib/activatePremium";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.client_reference_id;
      if (!userId) break;

      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expiresAt = new Date((subscription as any).current_period_end * 1000);
      const priceData = subscription.items.data[0]?.price;

      await activatePremium(userId, expiresAt);

      await supabase.from("subscriptions").insert({
        user_id: userId,
        provider: "stripe",
        provider_subscription_id: subscriptionId,
        status: "active",
        amount_cents: priceData?.unit_amount ?? 0,
        currency: (subscription.currency ?? "php").toUpperCase(),
        expires_at: expiresAt.toISOString(),
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expiresAt = new Date((subscription as any).current_period_end * 1000);

      const { data } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("provider_subscription_id", subscription.id)
        .single();

      if (!data) break;

      if (subscription.status === "active") {
        await activatePremium(data.user_id, expiresAt);
      }

      await supabase
        .from("subscriptions")
        .update({ status: subscription.status, expires_at: expiresAt.toISOString() })
        .eq("provider_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const { data } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("provider_subscription_id", subscription.id)
        .single();

      if (!data) break;

      await deactivatePremium(data.user_id);

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("provider_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
