"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startMockExamSession } from "@/app/actions/mockExam";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { QuestionSetPicker } from "@/components/practice/QuestionSetPicker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
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
  const [mode, setMode] = useState<QuestionSetMode>("random");
  const [errorMode, setErrorMode] = useState<QuestionSetMode | null>(null);

  async function handleClick() {
    setLoading(true);
    setErrorMode(null);
    if (existingSessionId) {
      router.push(`/mock-exam/session?session=${existingSessionId}`);
      return;
    }
    try {
      const result = await startMockExamSession(examType, mode);
      if (result?.error === "DAILY_LIMIT_REACHED") {
        setShowLimitModal(true);
      } else if (result?.error === "NOT_ENOUGH_QUESTIONS") {
        setErrorMode(mode);
      }
    } catch {
      // session created + redirect handled by server action
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Question set picker — premium only, only when starting a new exam */}
      {premium && !existingSessionId && (
        <QuestionSetPicker
          mode={mode}
          onSelect={(m) => {
            setMode(m);
            setErrorMode(null);
          }}
          includeNew={false}
          errorMode={errorMode}
        />
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          loading && "opacity-60 cursor-not-allowed"
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
