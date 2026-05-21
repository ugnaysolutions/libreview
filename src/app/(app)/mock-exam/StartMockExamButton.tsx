"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startMockExamSession } from "@/app/actions/mockExam";
import { DailyLimitModal } from "@/components/ui/DailyLimitModal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ExamType } from "@/lib/constants";

interface Props {
  existingSessionId?: string;
  examType?: ExamType;
}

export function StartMockExamButton({ existingSessionId, examType = "upcat" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  async function handleClick() {
    setLoading(true);
    if (existingSessionId) {
      router.push(`/mock-exam/session?session=${existingSessionId}`);
      return;
    }
    try {
      const result = await startMockExamSession(examType);
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
