import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UpgradeSuccessPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center space-y-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">You&apos;re Premium!</h1>
        <p className="text-sm text-muted-foreground">
          Your payment was successful. Unlimited practice, mock exams, and full
          review are now unlocked on your account.
        </p>
      </div>

      <div className="rounded-2xl bg-amber-50 p-4 space-y-1 text-left">
        <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
          <Zap className="h-4 w-4" /> What&apos;s unlocked
        </p>
        <ul className="text-xs text-amber-700 space-y-0.5 mt-1">
          <li>• Unlimited practice sessions per day</li>
          <li>• Unlimited mock exams per day</li>
          <li>• Full wrong-answer review with explanations</li>
          <li>• Access to ACET, DLSUCET &amp; USTET exams</li>
        </ul>
      </div>

      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center"
        )}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
