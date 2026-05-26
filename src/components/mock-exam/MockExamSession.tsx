"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveAnswer } from "@/app/actions/practice";
import { completeMockExamSession } from "@/app/actions/mockExam";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grid3X3, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Choice } from "@/lib/supabase/types";
import { MOCK_EXAM } from "@/lib/constants";

export interface MockExamQuestion {
  id: string;
  question_text: string;
  image_url: string | null;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  topic_id: string;
  passage_id: string | null;
  passage: { id: string; content: string | null; image_url: string | null } | null;
  subtest_id: string;
  subtest_name: string;
}

interface Props {
  sessionId: string;
  questions: MockExamQuestion[];
  answeredIds: string[];
  initialIndex: number;
  startedAt: string;
  timeLimitSeconds: number;
}

const CHOICES: { key: Choice; label: string }[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
];

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function MockExamSession({
  sessionId,
  questions,
  answeredIds,
  initialIndex,
  startedAt,
  timeLimitSeconds,
}: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<Set<string>>(new Set(answeredIds));
  const [selectedChoices, setSelectedChoices] = useState<Record<string, Choice>>({});
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    return Math.max(0, timeLimitSeconds - elapsed);
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  const question = questions[currentIndex];
  const isAnswered = answers.has(question.id);
  const answeredCount = answers.size;
  const unansweredCount = questions.length - answeredCount;

  // Compute subtest boundaries for section headers
  const subtestBoundaries = (() => {
    const sections: { subtest_name: string; startIndex: number }[] = [];
    let lastId = "";
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].subtest_id !== lastId) {
        sections.push({
          subtest_name: questions[i].subtest_name,
          startIndex: i,
        });
        lastId = questions[i].subtest_id;
      }
    }
    return sections;
  })();

  const currentSubtest = subtestBoundaries
    .slice()
    .reverse()
    .find((s) => s.startIndex <= currentIndex);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    await completeMockExamSession(sessionId, elapsed);
    router.push(`/mock-exam/results/${sessionId}`);
  }, [sessionId, startedAt, router]);

  // Initialize and run countdown timer
  useEffect(() => {
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    const initial = Math.max(0, timeLimitSeconds - elapsed);

    if (initial <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const timerColor =
    timeLeft <= MOCK_EXAM.redWarningSeconds
      ? "text-red-500"
      : timeLeft <= MOCK_EXAM.amberWarningSeconds
      ? "text-amber-500"
      : "text-foreground";

  async function handleSelectChoice(choice: Choice) {
    if (isAnswered || saving) return;
    setSaving(true);
    setAnswers((prev) => new Set(prev).add(question.id));
    setSelectedChoices((prev) => ({ ...prev, [question.id]: choice }));
    await saveAnswer(sessionId, question.id, choice);
    setSaving(false);
  }

  const choiceText: Record<Choice, string> = {
    a: question.choice_a,
    b: question.choice_b,
    c: question.choice_c,
    d: question.choice_d,
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-dvh">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold font-heading tabular-nums", timerColor)}>
            {formatTime(timeLeft)}
          </span>
          {timeLeft <= MOCK_EXAM.amberWarningSeconds && (
            <span
              className={cn(
                "text-xs font-medium",
                timeLeft <= MOCK_EXAM.redWarningSeconds
                  ? "text-red-500"
                  : "text-amber-500"
              )}
            >
              {timeLeft <= MOCK_EXAM.redWarningSeconds ? "Almost out!" : "Running low"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Navigator sheet trigger */}
          <Sheet>
            <SheetTrigger
              render={
                <button
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-xl gap-1.5"
                  )}
                />
              }
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span className="text-xs">
                {answeredCount}/{questions.length}
              </span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  Questions — {answeredCount} of {questions.length} answered
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto">
                {subtestBoundaries.map((section, si) => {
                  const nextSection = subtestBoundaries[si + 1];
                  const sectionQuestions = questions.slice(
                    section.startIndex,
                    nextSection?.startIndex
                  );
                  return (
                    <div key={section.subtest_name} className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {section.subtest_name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sectionQuestions.map((q, i) => {
                          const globalIdx = section.startIndex + i;
                          const done = answers.has(q.id);
                          return (
                            <button
                              key={q.id}
                              onClick={() => setCurrentIndex(globalIdx)}
                              className={cn(
                                "w-9 h-9 rounded-lg text-xs font-semibold transition-colors",
                                globalIdx === currentIndex &&
                                  "ring-2 ring-primary ring-offset-1",
                                done
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {globalIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-xl",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
        {/* Question meta */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {currentSubtest?.subtest_name}
            </p>
            <p className="text-sm font-semibold text-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          {saving && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </p>
          )}
        </div>

        {/* Passage panel (shown above question when applicable) */}
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
            const isSelected = selectedChoices[question.id] === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectChoice(key)}
                disabled={isAnswered || saving}
                className={cn(
                  "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3",
                  !isAnswered &&
                    "border-border bg-card hover:border-primary/60 hover:bg-primary/5 cursor-pointer",
                  isAnswered && "cursor-default",
                  isAnswered && !isSelected && "border-border bg-card opacity-40",
                  isAnswered && isSelected && "border-primary bg-primary/10"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center",
                    isAnswered && isSelected
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                <span className="text-sm leading-snug text-foreground">
                  {choiceText[key]}
                </span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <p className="text-xs text-center text-muted-foreground">
            Answer recorded. You can navigate to other questions.
          </p>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl gap-1",
            currentIndex === 0 && "opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <p className="text-xs text-muted-foreground">
          {unansweredCount === 0
            ? "All answered!"
            : `${unansweredCount} unanswered`}
        </p>

        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
          disabled={currentIndex === questions.length - 1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl gap-1",
            currentIndex === questions.length - 1 &&
              "opacity-40 cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Confirm submit dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {unansweredCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                You still have{" "}
                <span className="font-semibold text-foreground">
                  {unansweredCount} unanswered
                </span>{" "}
                question{unansweredCount !== 1 ? "s" : ""}. Unanswered items
                will be marked incorrect.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ve answered all {questions.length} questions. Ready to
                submit?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 rounded-xl justify-center"
                )}
              >
                Keep Going
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  handleSubmit();
                }}
                className={cn(
                  buttonVariants(),
                  "flex-1 rounded-xl justify-center"
                )}
              >
                Submit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
