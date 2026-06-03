import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Check, CheckCircle2 } from "lucide-react";
import { FREE_PLAN } from "@/lib/constants";
import { isPremium } from "@/lib/plan";
import { PayMongoButton } from "@/components/upgrade/PayMongoButton";
import { PlanCards } from "@/components/upgrade/PlanCards";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const premiumFeatures = [
  "Unlimited practice sessions per day",
  "Unlimited mock exams per day",
  "Full explanations for every question",
  "ACET, DCAT & USTET mock exams",
  "Reasoning subject (Logic, Numerical, Verbal & more)",
  "Adaptive weak-topic drills",
  "Score predictor — see your estimated exam score",
  "Percentile ranking — compare your performance with other students",
  "Full leaderboard access — weekly top 10 mock exam rankings",
  "Custom question sets — review wrong answers or bookmarked questions",
  "Up to 500 bookmarks (free: 20)",
  "Streak freeze (3/month)",
];

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const paymentProvider: "manual" | "paymongo" =
    process.env.PAYMENT_PROVIDER === "paymongo" ? "paymongo" : "manual";

  const [premium, pendingResult] = await Promise.all([
    isPremium(user.id),
    supabase
      .from("payment_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle(),
  ]);

  const hasPendingRequest = !!pendingResult.data;

  let planType: string | null = null;
  let planExpiresAt: string | null = null;

  if (premium) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan_type, plan_expires_at")
      .eq("id", user.id)
      .single();
    planType = profile?.plan_type ?? "monthly";
    planExpiresAt = profile?.plan_expires_at ?? null;
  }

  const expiryLabel = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 mb-2">
          <Zap className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {premium ? "You're on Premium" : "Upgrade to Premium"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {premium
            ? "All features are unlocked on your account."
            : "Unlock everything and maximize your college entrance test prep."}
        </p>
      </div>

      {/* Free vs Premium comparison */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-border p-4 space-y-1">
          <p className="font-semibold text-foreground">Free</p>
          <p className="text-muted-foreground">
            {FREE_PLAN.dailyPracticeLimit} practice sessions / day
          </p>
          <p className="text-muted-foreground">
            {FREE_PLAN.dailyMockLimit} mock exam / day
          </p>
          <p className="text-muted-foreground">UPCAT only</p>
          <p className="text-muted-foreground">Explanations for first 3 Qs</p>
          <p className="text-muted-foreground">20 bookmarks</p>
        </div>
        <div className="rounded-2xl border-2 border-primary p-4 space-y-1">
          <p className="font-semibold text-primary flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> Premium
          </p>
          <p className="text-foreground">Unlimited sessions</p>
          <p className="text-foreground">Unlimited mock exams</p>
          <p className="text-foreground">5 exam types</p>
          <p className="text-foreground">Full explanations + score predictor</p>
          <p className="text-foreground">500 bookmarks</p>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-2">
        {premiumFeatures.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {premium ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-50 p-5 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Active subscription</p>
              <p className="text-xs text-green-700 mt-0.5">
                {planType === "annual" ? "Annual plan" : "Monthly plan"}
                {expiryLabel ? ` · Renews by ${expiryLabel}` : ""}
              </p>
            </div>
          </div>
          {paymentProvider === "paymongo" && (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground font-medium">Renew early to extend your access</p>
              <div className="grid grid-cols-2 gap-3">
                <PayMongoButton plan="monthly" label="Renew Monthly" />
                <PayMongoButton plan="annual" label="Renew Annual" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <PlanCards
            paymentProvider={paymentProvider}
            hasPendingRequest={hasPendingRequest}
          />

          {paymentProvider === "paymongo" && (
            <p className="text-xs text-muted-foreground text-center">
              GCash · Maya · Credit / Debit Card · Secure via PayMongo
            </p>
          )}
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full rounded-xl justify-center text-muted-foreground"
            )}
          >
            Maybe later
          </Link>
        </div>
      )}
    </div>
  );
}
