"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startMockExamSession } from "@/app/actions/mockExam";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { QuestionSetPicker } from "@/components/practice/QuestionSetPicker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ExamType, QuestionSetMode } from "@/lib/constants";

interface Props {
  existingSessionId?: string;
  examType?: ExamType;
  premium?: boolean;
}

export function StartMockExamButton({
  existingSessionId,
  examType = "upcat",
  premium = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [modes, setModes] = useState<QuestionSetMode[]>(["random"]);
  const [errorModes, setErrorModes] = useState<QuestionSetMode[]>([]);
  const [backfillInfo, setBackfillInfo] = useState<{ available: number; total: number } | null>(null);

  function handleToggle(m: QuestionSetMode) {
    setBackfillInfo(null);
    setErrorModes([]);
    if (m === "random") {
      setModes(["random"]);
    } else {
      setModes((prev) => {
        const filtered = prev.filter((x) => x !== "random");
        if (filtered.includes(m)) {
          return filtered.length > 1 ? filtered.filter((x) => x !== m) : filtered;
        }
        return [...filtered, m];
      });
    }
  }

  async function handleClick() {
    setLoading(true);
    setErrorModes([]);
    setBackfillInfo(null);
    if (existingSessionId) {
      router.push(`/mock-exam/session?session=${existingSessionId}`);
      return;
    }
    try {
      const result = await startMockExamSession(examType, modes);
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
      const result = await startMockExamSession(examType, modes, true);
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
      {/* Question set picker — premium only, only for new exams */}
      {premium && !existingSessionId && (
        <QuestionSetPicker
          modes={modes}
          onToggle={handleToggle}
          includeNew={false}
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
                Found ~{backfillInfo.available} of {backfillInfo.total} questions from your selected set.
                The remaining ~{backfillInfo.total - backfillInfo.available} will be picked randomly from the question bank.
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

      <button
        onClick={handleClick}
        disabled={loading || !!backfillInfo}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          (loading || !!backfillInfo) && "opacity-60 cursor-not-allowed"
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading
          ? "Preparing exam…"
          : existingSessionId
          ? "Resume Mock Exam"
          : "Start Mock Exam"}
      </button>

      {showLimitModal && (
        <DailyLimitModal type="mock" onClose={() => setShowLimitModal(false)} />
      )}
    </>
  );
}
