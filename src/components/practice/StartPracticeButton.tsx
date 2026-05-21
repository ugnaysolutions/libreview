"use client";

import { useState } from "react";
import { startPracticeSession } from "@/app/actions/practice";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  topicId: string;
  subtestSlug: string;
  topicSlug: string;
  disabled?: boolean;
}

export function StartPracticeButton({
  topicId,
  subtestSlug,
  topicSlug,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const result = await startPracticeSession(topicId, subtestSlug, topicSlug);
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
        {loading ? "Preparing session…" : "Start Practice"}
      </button>

      {showLimitModal && (
        <DailyLimitModal type="practice" onClose={() => setShowLimitModal(false)} />
      )}
    </>
  );
}
