"use client";

import Link from "next/link";
import { Zap, X } from "lucide-react";
import { FREE_PLAN } from "@/lib/constants";

interface Props {
  type: "practice" | "mock";
  onClose: () => void;
}

export function DailyLimitModal({ type, onClose }: Props) {
  const limit =
    type === "practice" ? FREE_PLAN.dailyPracticeLimit : FREE_PLAN.dailyMockLimit;
  const label = type === "practice" ? "practice session" : "mock exam";
  const plural = limit === 1 ? label : `${label}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-foreground">Daily limit reached</p>
            <p className="text-xs text-muted-foreground">Resets at midnight</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Free accounts can start{" "}
          <span className="font-semibold text-foreground">
            {limit} {plural}
          </span>{" "}
          per day. Come back tomorrow, or upgrade to Premium for unlimited
          access.
        </p>

        <div className="space-y-2">
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-white text-sm font-bold transition-colors hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" />
            Upgrade to Premium
          </Link>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
