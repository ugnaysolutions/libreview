"use client";

import { useState } from "react";
import Link from "next/link";
import { completeDailyChallenge } from "@/app/actions/dailyChallenge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, ChevronRight, Flame } from "lucide-react";
import type { Choice } from "@/lib/supabase/types";

interface ChallengeQuestion {
  id: string;
  question_text: string;
  image_url: string | null;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  passage: { content: string | null; image_url: string | null } | null;
}

interface Props {
  date: string;
  questions: ChallengeQuestion[];
}

const CHOICES: { key: Choice; label: string }[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
];

type Phase = "quiz" | "submitting" | "done";

export function DailyChallengeSession({ date, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, Choice>>({});
  const [phase, setPhase] = useState<Phase>("quiz");
  const [score, setScore] = useState(0);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const chosen = selectedAnswers[question?.id] ?? null;
  const showResult = chosen !== null;

  const choiceText: Record<Choice, string> = question
    ? {
        a: question.choice_a,
        b: question.choice_b,
        c: question.choice_c,
        d: question.choice_d,
      }
    : { a: "", b: "", c: "", d: "" };

  function handleSelect(choice: Choice) {
    if (chosen !== null) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: choice }));
  }

  async function handleNext() {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Compute score and submit
      const finalAnswers = { ...selectedAnswers };
      const computed = questions.filter(
        (q) => finalAnswers[q.id] === q.correct_choice
      ).length;
      setScore(computed);
      setPhase("submitting");

      await completeDailyChallenge(
        date,
        questions.map((q) => ({ questionId: q.id, chosenChoice: finalAnswers[q.id] }))
      );

      setPhase("done");
    }
  }

  // ── Results view ─────────────────────────────────────────────────
  if (phase === "done" || phase === "submitting") {
    const pct = Math.round((score / questions.length) * 100);
    const scoreColor =
      pct >= 80 ? "#22C55E" : pct >= 60 ? "#F59E0B" : "#EF4444";
    const headline =
      pct === 100
        ? "Perfect score!"
        : pct >= 80
        ? "Great work!"
        : pct >= 60
        ? "Keep it up!"
        : "Keep practicing!";

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Score hero */}
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">Daily Challenge</span>
          </div>
          {phase === "submitting" ? (
            <div className="flex items-center justify-center h-28">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div
              className="inline-flex items-center justify-center w-28 h-28 rounded-full text-white text-3xl font-bold"
              style={{ backgroundColor: scoreColor }}
            >
              {score}/{questions.length}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {phase === "submitting" ? "Saving…" : headline}
            </h1>
            {phase === "done" && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {score} out of {questions.length} correct · {pct}%
              </p>
            )}
          </div>
        </div>

        {phase === "done" && (
          <>
            {/* Quick answer review */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Review</h2>
              {questions.map((q, i) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correct_choice;
                return (
                  <Card key={q.id} className="rounded-2xl border-border shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                          Q{i + 1}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium text-foreground leading-snug flex-1">
                          {q.question_text}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {(["a", "b", "c", "d"] as Choice[]).map((key) => {
                          const isChosen = userChoice === key;
                          const isCorrectKey = q.correct_choice === key;
                          return (
                            <div
                              key={key}
                              className={cn(
                                "flex items-start gap-2 text-xs px-3 py-1.5 rounded-lg",
                                isCorrectKey && "bg-green-50 text-green-800 font-medium",
                                isChosen && !isCorrectKey && "bg-red-50 text-red-700",
                                !isCorrectKey && !isChosen && "text-muted-foreground"
                              )}
                            >
                              <span className="font-semibold uppercase shrink-0">
                                {key}.
                              </span>
                              <span className="flex-1">
                                {{ a: q.choice_a, b: q.choice_b, c: q.choice_c, d: q.choice_d }[key]}
                              </span>
                              {isCorrectKey && (
                                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                              )}
                              {isChosen && !isCorrectKey && (
                                <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full rounded-xl justify-center font-bold"
              )}
            >
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    );
  }

  // ── Quiz view ────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          Daily Challenge
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-1.5">
        <div
          className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Passage */}
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
          const isSelected = chosen === key;
          const isCorrectKey = question.correct_choice === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={showResult}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3",
                !showResult && "border-border bg-card hover:border-amber-400/60 hover:bg-amber-50/30 cursor-pointer",
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

      {/* Next / Complete */}
      <button
        onClick={handleNext}
        disabled={!showResult}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          !showResult && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLast ? "Complete Challenge" : (
          <>
            Next
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
