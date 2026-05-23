"use client";

import { useState } from "react";
import { startPracticeSession } from "@/app/actions/practice";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Timer, Zap } from "lucide-react";
import Link from "next/link";
import { TIMED_PRACTICE_SECONDS_PER_QUESTION } from "@/lib/constants";

interface Props {
  topicId: string;
  subtestSlug: string;
  topicSlug: string;
  disabled?: boolean;
  premium: boolean;
  sessionQuestionCount: number;
}

export function StartPracticeButton({
  topicId,
  subtestSlug,
  topicSlug,
  disabled,
  premium,
  sessionQuestionCount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [timedMode, setTimedMode] = useState(false);

  const totalMinutes = Math.round(
    (sessionQuestionCount * TIMED_PRACTICE_SECONDS_PER_QUESTION) / 60
  );

  async function handleStart() {
    setLoading(true);
    try {
      const result = await startPracticeSession(
        topicId,
        subtestSlug,
        topicSlug,
        timedMode
      );
      if (result?.error === "DAILY_LIMIT_REACHED") {
        setShowLimitModal(true);
      }
    } catch {
      // session created + redirect handled by server action
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Timed mode — premium toggle */}
      {premium ? (
        <div className="rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Timer className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Timed Mode</p>
                <p className="text-xs text-muted-foreground">
                  {timedMode
                    ? `${totalMinutes} min · trains exam pacing`
                    : "Off · no time limit"}
                </p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={timedMode}
              onClick={() => setTimedMode((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                timedMode ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
                  timedMode ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Timer className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Timed Mode</p>
              <p className="text-xs text-muted-foreground">
                {totalMinutes} min · trains exam pacing
              </p>
            </div>
          </div>
          <Link
            href="/upgrade"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1 shrink-0")}
          >
            <Zap className="h-3.5 w-3.5" />
            Unlock
          </Link>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={disabled || loading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          (disabled || loading) && "opacity-60 cursor-not-allowed"
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading
          ? "Preparing session…"
          : timedMode
          ? "Start Timed Practice"
          : "Start Practice"}
      </button>

      {showLimitModal && (
        <DailyLimitModal type="practice" onClose={() => setShowLimitModal(false)} />
      )}
    </>
  );
}
