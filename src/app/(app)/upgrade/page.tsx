import { Zap, Check } from "lucide-react";
import { FREE_PLAN } from "@/lib/constants";

const premiumFeatures = [
  "Unlimited practice sessions per day",
  "10,000+ exam questions",
  "Unlimited mock exams per day",
  "Full wrong-answer review with explanations",
  "ACET, DLSUCET & USTET mock exams",
  "Advanced progress analytics",
  "Adaptive weak-topic drills",
  "Timed practice mode",
  "Study planner",
  "Streak freeze (3/month)",
  "Performance benchmarking",
];

export default function UpgradePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 mb-2">
          <Zap className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Upgrade to Premium</h1>
        <p className="text-sm text-muted-foreground">
          Unlock everything and maximize your UPCAT prep.
        </p>
      </div>

      {/* Free vs Premium */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-border p-4 space-y-1">
          <p className="font-semibold text-foreground">Free</p>
          <p className="text-muted-foreground">{FREE_PLAN.dailyPracticeLimit} practice sessions / day</p>
          <p className="text-muted-foreground">{FREE_PLAN.dailyMockLimit} mock exam / day</p>
          <p className="text-muted-foreground">UPCAT only</p>
          <p className="text-muted-foreground">Score summary only</p>
        </div>
        <div className="rounded-2xl border-2 border-primary p-4 space-y-1">
          <p className="font-semibold text-primary flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> Premium
          </p>
          <p className="text-foreground">Unlimited sessions</p>
          <p className="text-foreground">Unlimited mock exams</p>
          <p className="text-foreground">4 exam types</p>
          <p className="text-foreground">Full review</p>
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

      {/* Payment placeholder */}
      <div className="rounded-2xl bg-muted p-5 text-center space-y-2">
        <p className="font-semibold text-foreground">Payment coming soon</p>
        <p className="text-xs text-muted-foreground">
          We&apos;re setting up GCash, Maya, and card payments. Check back soon!
        </p>
      </div>
    </div>
  );
}
