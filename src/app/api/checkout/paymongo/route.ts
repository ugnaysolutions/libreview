import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYMONGO_API = "https://api.paymongo.com/v1";

function getAuth() {
  return Buffer.from(`${process.env.PAYMONGO_SECRET_KEY!}:`).toString("base64");
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const plan: "monthly" | "annual" = body.plan === "annual" ? "annual" : "monthly";

  const amountCents =
    plan === "annual"
      ? parseInt(process.env.PAYMONGO_ANNUAL_AMOUNT_CENTS ?? "99900")
      : parseInt(process.env.PAYMONGO_MONTHLY_AMOUNT_CENTS ?? "14900");

  const planLabel = plan === "annual" ? "Annual (₱999)" : "Monthly (₱149)";
  const duration = plan === "annual" ? "365 days" : "30 days";

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

  const response = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getAuth()}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              name: `Libreview Premium – ${planLabel}`,
              quantity: 1,
              amount: amountCents,
              currency: "PHP",
            },
          ],
          payment_method_types: ["gcash", "paymaya", "card"],
          success_url: `${origin}/upgrade/success`,
          cancel_url: `${origin}/upgrade`,
          description: `Libreview Premium — ${duration} of unlimited access`,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          metadata: { user_id: user.id, plan_type: plan },
        },
      },
    }),
  });

  const data = await response.json();
  const checkoutUrl = data?.data?.attributes?.checkout_url;

  if (!checkoutUrl) {
    console.error("PayMongo checkout error:", JSON.stringify(data));
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutUrl });
}
