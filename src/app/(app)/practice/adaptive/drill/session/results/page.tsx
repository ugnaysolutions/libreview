import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Bookmark, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Choice } from "@/lib/supabase/types";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ShareScoreButton } from "@/components/ui/ShareScoreButton";
import { SmartDrillCard } from "@/components/ui/SmartDrillCard";

export default async function AdaptiveResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) redirect("/practice");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, status, total_questions, correct_count, question_ids")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  if (session.status !== "completed") {
    redirect(`/practice/adaptive/drill/session?session=${sessionId}`);
  }

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];

  const [questionsRes, answersRes, bookmarksRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation"
      )
      .in("id", questionIds),
    supabase
      .from("session_answers")
      .select("question_id, chosen_choice, is_correct")
      .eq("session_id", sessionId),
    supabase
      .from("bookmarked_questions")
      .select("question_id")
      .eq("user_id", user.id)
      .in("question_id", questionIds),
  ]);

  const questionsRaw = questionsRes.data ?? [];
  const answers = answersRes.data ?? [];
  const bookmarkedSet = new Set(
    (bookmarksRes.data ?? []).map((b) => b.question_id)
  );

  const qMap = new Map(questionsRaw.map((q) => [q.id, q]));
  const aMap = new Map(answers.map((a) => [a.question_id, a]));
  const questions = questionIds
    .map((id) => qMap.get(id))
    .filter(Boolean) as typeof questionsRaw;

  const correctCount = session.correct_count ?? 0;
  const total = session.total_questions;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scoreColor =
    scorePercent >= 70 ? "#22C55E" : scorePercent >= 50 ? "#F59E0B" : "#EF4444";
  const headline =
    scorePercent >= 70
      ? "Great job!"
      : scorePercent >= 50
      ? "Keep it up!"
      : "Keep practicing!";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Score hero */}
      <div className="text-center space-y-3 py-4">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-primary">Smart Drill</span>
        </div>
        <div
          className="inline-flex items-center justify-center w-28 h-28 rounded-full text-white text-4xl font-bold"
          style={{ backgroundColor: scoreColor }}
        >
          {scorePercent}%
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {headline}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {correctCount} out of {total} correct
          </p>
        </div>
      </div>

      {/* Drill Again + Back to Practice */}
      <SmartDrillCard premium={true} hasHistory={true} />
      <Link
        href="/practice"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-xl justify-center w-full"
        )}
      >
        Back to Practice
      </Link>

      <ShareScoreButton
        score={scorePercent}
        correct={correctCount}
        total={total}
        label="Smart Drill"
      />
      <Link
        href="/bookmarks"
        className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium"
      >
        <Bookmark className="h-3.5 w-3.5" />
        View Bookmarks
      </Link>

      {/* Per-question review */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Review</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const answer = aMap.get(q.id);
            const chosen = answer?.chosen_choice as Choice | null | undefined;
            const isCorrect = answer?.is_correct;

            const choiceText: Record<Choice, string> = {
              a: q.choice_a,
              b: q.choice_b,
              c: q.choice_c,
              d: q.choice_d,
            };

            return (
              <Card key={q.id} className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-4 space-y-3">
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
                    {!isCorrect && (
                      <BookmarkButton
                        questionId={q.id}
                        defaultBookmarked={bookmarkedSet.has(q.id)}
                      />
                    )}
                  </div>

                  {q.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.image_url}
                      alt=""
                      className="w-full rounded-lg object-contain max-h-32"
                      loading="lazy"
                    />
                  )}

                  <div className="space-y-1">
                    {(["a", "b", "c", "d"] as Choice[]).map((key) => {
                      const isChosenKey = chosen === key;
                      const isCorrectKey = q.correct_choice === key;
                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-start gap-2 text-sm px-3 py-2 rounded-lg",
                            isCorrectKey &&
                              "bg-green-50 text-green-800 font-medium",
                            isChosenKey &&
                              !isCorrectKey &&
                              "bg-red-50 text-red-700",
                            !isCorrectKey &&
                              !isChosenKey &&
                              "text-muted-foreground"
                          )}
                        >
                          <span className="font-semibold uppercase shrink-0">
                            {key}.
                          </span>
                          <span className="flex-1">{choiceText[key]}</span>
                          {isCorrectKey && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          )}
                          {isChosenKey && !isCorrectKey && (
                            <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Explanation
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
