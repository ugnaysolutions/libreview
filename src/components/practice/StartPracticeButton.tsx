"use client";

import { useState } from "react";
import { startPracticeSession } from "@/app/actions/practice";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { QuestionSetPicker } from "@/components/practice/QuestionSetPicker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Timer, Zap } from "lucide-react";
import Link from "next/link";
import { TIMED_PRACTICE_SECONDS_PER_QUESTION } from "@/lib/constants";
import type { QuestionSetMode } from "@/lib/constants";

interface Props {
  topicId: string;
  subtestSlug: string;
  topicSlug: string;
  disabled?: boolean;
  premium: boolean;
  sessionQuestionCount: number;
  bookmarkedCount?: number;
}

export function StartPracticeButton({
  topicId,
  subtestSlug,
  topicSlug,
  disabled,
  premium,
  sessionQuestionCount,
  bookmarkedCount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [modes, setModes] = useState<QuestionSetMode[]>(["random"]);
  const [errorModes, setErrorModes] = useState<QuestionSetMode[]>([]);
  const [backfillInfo, setBackfillInfo] = useState<{ available: number; total: number } | null>(null);

  const totalMinutes = Math.round(
    (sessionQuestionCount * TIMED_PRACTICE_SECONDS_PER_QUESTION) / 60
  );

  function handleToggle(m: QuestionSetMode) {
    setBackfillInfo(null);
    setErrorModes([]);
    if (m === "random" || m === "new") {
      setModes([m]);
    } else {
      setModes((prev) => {
        const filtered = prev.filter((x) => x !== "random" && x !== "new");
        if (filtered.includes(m)) {
          // Keep at least one mode selected
          return filtered.length > 1 ? filtered.filter((x) => x !== m) : filtered;
        }
        return [...filtered, m];
      });
    }
  }

  async function handleStart() {
    setLoading(true);
    setErrorModes([]);
    setBackfillInfo(null);
    try {
      const result = await startPracticeSession(topicId, subtestSlug, topicSlug, timedMode, modes);
      if (result?.error === "DAILY_LIMIT_REACHED") {
        setShowLimitModal(true);
      } else if (result?.error === "NOT_ENOUGH_QUESTIONS") {
        setErrorModes(modes.filter((m) => m !== "random"));
      } else if (result?.error === "BACKFILL_NEEDED") {
        setBackfillInfo({ available: result.available, total: result.total });
      }
    } catch {
      // session created + redirect handled by server action
    } finally {
      setLoading(false);
    }
  }

  async function handleProceedBackfill() {
    setLoading(true);
    setBackfillInfo(null);
    try {
      const result = await startPracticeSession(
        topicId, subtestSlug, topicSlug, timedMode, modes, true
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
      {/* Question set picker — premium only */}
      {premium && (
        <QuestionSetPicker
          modes={modes}
          onToggle={handleToggle}
          bookmarkedCount={bookmarkedCount}
          errorModes={errorModes}
        />
      )}

      {/* Backfill confirmation */}
      {backfillInfo && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800">Not enough questions in your selection</p>
              <p className="text-xs text-amber-700">
                Found {backfillInfo.available} of {backfillInfo.total} questions from your selected set.
                The remaining {backfillInfo.total - backfillInfo.available} will be picked randomly from this topic.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleProceedBackfill}
              disabled={loading}
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-xl gap-1 flex-1",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Fill Randomly
            </button>
            <button
              onClick={() => setBackfillInfo(null)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl flex-1"
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
        disabled={disabled || loading || !!backfillInfo}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          (disabled || loading || !!backfillInfo) && "opacity-60 cursor-not-allowed"
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
