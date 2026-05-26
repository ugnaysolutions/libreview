import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://libreview.app";

  const supabase = createAdminClient();

  // Find premium users whose plan expires within the next 7 days
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: expiring, error } = await supabase
    .from("user_profiles")
    .select("id, plan_type, plan_expires_at")
    .eq("plan", "premium")
    .gte("plan_expires_at", now.toISOString())
    .lte("plan_expires_at", in7Days.toISOString());

  if (error || !expiring || expiring.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Batch-fetch emails from auth.users with a single listUsers call
  const expiringIds = new Set(expiring.map((p) => p.id));
  const { data: usersPage } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>(
    (usersPage?.users ?? [])
      .filter((u) => expiringIds.has(u.id) && !!u.email)
      .map((u) => [u.id, u.email!])
  );

  let sent = 0;
  for (const profile of expiring) {
    const email = emailMap.get(profile.id);
    if (!email) continue;

    const expiryDate = new Date(profile.plan_expires_at).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const daysLeft = Math.ceil(
      (new Date(profile.plan_expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const planLabel = profile.plan_type === "annual" ? "Annual" : "Monthly";

    await resend.emails.send({
      from: "Libreview <noreply@libreview.app>",
      to: email,
      subject: `Your Libreview Premium expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#0D9488">Your Premium is expiring soon</h2>
          <p>Your <strong>Libreview Premium ${planLabel}</strong> subscription expires on <strong>${expiryDate}</strong>.</p>
          <p>Renew now to keep your unlimited access to all exam types, Reasoning practice, and full mock exam reviews.</p>
          <a href="${APP_URL}/upgrade" style="display:inline-block;background:#0D9488;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:16px 0">
            Renew Premium
          </a>
          <p style="color:#64748B;font-size:12px;margin-top:24px">
            You're receiving this because you have an active Libreview Premium subscription.
          </p>
        </div>
      `,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
