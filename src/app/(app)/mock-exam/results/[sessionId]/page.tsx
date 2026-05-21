import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Choice } from "@/lib/supabase/types";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default async function MockExamResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("exam_sessions")
    .select(
      "id, status, total_questions, correct_count, time_spent_seconds, question_ids"
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  if (session.status !== "completed") {
    redirect(`/mock-exam/session?session=${sessionId}`);
  }

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];

  const [questionsRes, answersRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, topic_id, topics(subtest_id, subtests(id, name, display_order))"
      )
      .in("id", questionIds),
    supabase
      .from("session_answers")
      .select("question_id, chosen_choice, is_correct")
      .eq("session_id", sessionId),
  ]);

  const questionsRaw = questionsRes.data ?? [];
  const answers = answersRes.data ?? [];
  const aMap = new Map(answers.map((a) => [a.question_id, a]));

  // Order questions to match question_ids
  const qMap = new Map(questionsRaw.map((q) => [q.id, q]));
  const questions = questionIds.map((id) => qMap.get(id)).filter(Boolean) as typeof questionsRaw;

  // Compute per-subtest stats
  type SubtestStat = {
    name: string;
    displayOrder: number;
    total: number;
    correct: number;
  };
  const subtestStats = new Map<string, SubtestStat>();

  for (const q of questions) {
    const topic = q.topics as unknown as {
      subtest_id: string;
      subtests: { id: string; name: string; display_order: number | null };
    } | null;
    if (!topic) continue;

    const sid = topic.subtest_id;
    const existing = subtestStats.get(sid) ?? {
      name: topic.subtests.name,
      displayOrder: topic.subtests.display_order ?? 99,
      total: 0,
      correct: 0,
    };
    existing.total += 1;
    const ans = aMap.get(q.id);
    if (ans?.is_correct) existing.correct += 1;
    subtestStats.set(sid, existing);
  }

  const subtestList = [...subtestStats.entries()]
    .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
    .map(([id, s]) => ({ id, ...s }));

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

  // Group questions by subtest for the review section
  const questionsBySubtest = new Map<string, typeof questions>();
  for (const q of questions) {
    const topic = q.topics as unknown as {
      subtest_id: string;
    } | null;
    const sid = topic?.subtest_id ?? "__unknown";
    const arr = questionsBySubtest.get(sid) ?? [];
    arr.push(q);
    questionsBySubtest.set(sid, arr);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Score hero */}
      <div className="text-center space-y-3 py-4">
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
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Time: {formatDuration(session.time_spent_seconds)}</span>
        </div>
      </div>

      {/* Per-subtest breakdown */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Subtest Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {subtestList.map((s) => {
            const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <Card key={s.id} className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <AccuracyRing accuracy={acc} size={52} strokeWidth={5} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.correct}/{s.total} correct
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/mock-exam"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl justify-center"
          )}
        >
          Take Again
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl justify-center")}
        >
          Dashboard
        </Link>
      </div>

      {/* Per-question review grouped by subtest */}
      <section className="space-y-6">
        <h2 className="text-base font-semibold text-foreground">Review</h2>
        {subtestList.map((s) => {
          const sQuestions = questionsBySubtest.get(s.id) ?? [];
          if (sQuestions.length === 0) return null;
          return (
            <div key={s.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {s.name}
              </h3>
              {sQuestions.map((q) => {
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
                  <Card
                    key={q.id}
                    className="rounded-2xl border-border shadow-sm"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {q.question_text}
                        </p>
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
          );
        })}
      </section>
    </div>
  );
}
