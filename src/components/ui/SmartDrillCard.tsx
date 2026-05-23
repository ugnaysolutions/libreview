"use client";

import { useState, useTransition } from "react";
import { Brain, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { startAdaptiveDrill } from "@/app/actions/adaptive";

interface Props {
  premium: boolean;
  hasHistory: boolean;
}

export function SmartDrillCard({ premium, hasHistory }: Props) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleStart() {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await startAdaptiveDrill();
      if (result?.error === "DAILY_LIMIT_REACHED") {
        setErrorMsg("Daily session limit reached. Try again tomorrow.");
      } else if (result?.error === "NOT_ENOUGH_HISTORY") {
        setErrorMsg("Practice some topics first to unlock Smart Drill.");
      }
    });
  }

  if (!premium) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Smart Drill</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-picks your weakest topics
            </p>
          </div>
          <Link
            href="/upgrade"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1 shrink-0")}
          >
            <Zap className="h-3.5 w-3.5" />
            Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Smart Drill</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasHistory
              ? "Targets your 3 weakest topics automatically"
              : "Practice some topics first to enable this"}
          </p>
          {errorMsg && (
            <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
          )}
        </div>
        <button
          onClick={handleStart}
          disabled={!hasHistory || isPending}
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-xl gap-1.5 shrink-0",
            (!hasHistory || isPending) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
          {isPending ? "Starting…" : "Start"}
        </button>
      </div>
    </div>
  );
}
