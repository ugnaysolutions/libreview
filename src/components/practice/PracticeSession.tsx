"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer, completePracticeSession } from "@/app/actions/practice";
import { ReportDialog } from "./ReportDialog";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flag, Loader2, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import type { Choice } from "@/lib/supabase/types";

export interface PracticeQuestion {
  id: string;
  question_text: string;
  image_url: string | null;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  passage_id: string | null;
  passage: { id: string; content: string | null; image_url: string | null } | null;
}

interface Props {
  sessionId: string;
  questions: PracticeQuestion[];
  answeredIds: string[];
  initialIndex: number;
  subtestSlug: string;
  topicSlug: string;
  timedMode?: boolean;
  totalTimeSeconds?: number;
}

const CHOICES: { key: Choice; label: string }[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PracticeSession({
  sessionId,
  questions,
  answeredIds,
  initialIndex,
  subtestSlug,
  topicSlug,
  timedMode = false,
  totalTimeSeconds = 0,
}: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localAnswers, setLocalAnswers] = useState<Set<string>>(
    new Set(answeredIds)
  );
  const [selectedChoices, setSelectedChoices] = useState<Record<string, Choice>>({});
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);

  // Track time spent on each question
  const questionStartedAt = useRef(Date.now());
  // Prevent double-completion from timer + user simultaneously
  const completingRef = useRef(false);

  const question = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const isAnswered = localAnswers.has(question.id) || question.id in selectedChoices;

  const choiceText: Record<Choice, string> = {
    a: question.choice_a,
    b: question.choice_b,
    c: question.choice_c,
    d: question.choice_d,
  };

  // Reset question start time when navigating between questions
  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, [currentIndex]);

  // Countdown timer — runs only in timed mode
  useEffect(() => {
    if (!timedMode || !totalTimeSeconds) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (!completingRef.current) {
            completingRef.current = true;
            setCompleting(true);
            completePracticeSession(sessionId).then(() => {
              router.push(
                `/practice/${subtestSlug}/${topicSlug}/session/results?session=${sessionId}`
              );
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode, totalTimeSeconds]);

  async function handleSelectChoice(choice: Choice) {
    if (question.id in selectedChoices || localAnswers.has(question.id)) return;

    const timeSpentMs = Date.now() - questionStartedAt.current;
    setSelectedChoices((prev) => ({ ...prev, [question.id]: choice }));
    setSaving(true);
    await saveAnswer(
      sessionId,
      question.id,
      choice,
      timedMode ? timeSpentMs : null
    );
    setLocalAnswers((prev) => new Set(prev).add(question.id));
    setSaving(false);
  }

  function handlePrev() {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  }

  async function handleNext() {
    if (!isAnswered || saving || completing) return;

    if (isLast) {
      if (completingRef.current) return;
      completingRef.current = true;
      setCompleting(true);
      await completePracticeSession(sessionId);
      router.push(
        `/practice/${subtestSlug}/${topicSlug}/session/results?session=${sessionId}`
      );
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const showResult = localAnswers.has(question.id) || question.id in selectedChoices;
  const selectedChoice = selectedChoices[question.id] ?? null;

  const timerColor =
    timeLeft < 60
      ? "text-red-500"
      : timeLeft < 120
      ? "text-amber-500"
      : "text-muted-foreground";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-3">
          {timedMode && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-semibold tabular-nums",
                timerColor
              )}
            >
              <Timer className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </span>
          )}
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Passage panel */}
      {question.passage && (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
          {question.passage.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.passage.image_url}
              alt="Stimulus"
              className="w-full rounded-xl object-contain max-h-64"
              loading="lazy"
            />
          )}
          {question.passage.content && (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {question.passage.content}
            </p>
          )}
        </div>
      )}

      {/* Question */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          {question.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.image_url}
              alt="Question illustration"
              className="w-full rounded-xl object-contain max-h-52"
              loading="lazy"
            />
          )}
          <p className="text-base font-medium text-foreground leading-relaxed">
            {question.question_text}
          </p>
        </CardContent>
      </Card>

      {/* Choices */}
      <div className="space-y-2">
        {CHOICES.map(({ key, label }) => {
          const isSelected = selectedChoice === key;
          const isCorrectKey = question.correct_choice === key;

          return (
            <button
              key={key}
              onClick={() => handleSelectChoice(key)}
              disabled={showResult || saving}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 cursor-pointer",
                !showResult &&
                  "border-border bg-card hover:border-primary/60 hover:bg-primary/5",
                showResult && isSelected && isCorrectKey && "border-green-500 bg-green-50",
                showResult && isSelected && !isCorrectKey && "border-red-400 bg-red-50",
                showResult && !isSelected && isCorrectKey && "border-green-400 bg-green-50/60",
                showResult && !isSelected && !isCorrectKey && "border-border bg-card opacity-60",
                showResult && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "shrink-0 w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center",
                  !showResult && "bg-muted text-muted-foreground",
                  showResult && isSelected && isCorrectKey && "bg-green-500 text-white",
                  showResult && isSelected && !isCorrectKey && "bg-red-400 text-white",
                  showResult && !isSelected && isCorrectKey && "bg-green-400 text-white",
                  showResult && !isSelected && !isCorrectKey && "bg-muted text-muted-foreground"
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "text-sm leading-snug",
                  showResult && isSelected && isCorrectKey && "text-green-800 font-medium",
                  showResult && isSelected && !isCorrectKey && "text-red-700",
                  showResult && !isSelected && isCorrectKey && "text-green-700 font-medium",
                  showResult && !isSelected && !isCorrectKey && "text-muted-foreground"
                )}
              >
                {choiceText[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={handlePrev}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-xl gap-1.5 shrink-0"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isAnswered || saving || completing}
          className={cn(
            buttonVariants({ size: "lg" }),
            "flex-1 rounded-xl font-bold justify-center gap-2",
            (!isAnswered || saving || completing) && "opacity-50 cursor-not-allowed"
          )}
        >
          {completing && <Loader2 className="h-4 w-4 animate-spin" />}
          {completing
            ? "Saving results…"
            : saving
            ? "Saving…"
            : isLast
            ? "Finish"
            : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
        </button>
      </div>

      <ReportDialog
        questionId={question.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
