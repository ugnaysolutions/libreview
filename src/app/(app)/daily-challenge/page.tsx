import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DailyChallengeSession } from "@/components/practice/DailyChallengeSession";
import { getOrCreateDailyChallenge } from "@/app/actions/dailyChallenge";
import type { Choice } from "@/lib/supabase/types";

export default async function DailyChallengePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  // Get or create today's challenge, check if user already completed it
  const [challenge, completionRes] = await Promise.all([
    getOrCreateDailyChallenge(),
    supabase
      .from("daily_challenge_completions")
      .select("score, completed_at")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
  ]);

  if (!challenge) notFound();

  const completion = completionRes.data;
  const questionIds = challenge.question_ids;

  // Already completed today — show summary
  if (completion) {
    const pct = Math.round((completion.score / questionIds.length) * 100);
    const scoreColor =
      pct >= 80 ? "#22C55E" : pct >= 60 ? "#F59E0B" : "#EF4444";

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-3 py-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">Daily Challenge</span>
          </div>
          <div
            className="inline-flex items-center justify-center w-28 h-28 rounded-full text-white text-3xl font-bold"
            style={{ backgroundColor: scoreColor }}
          >
            {completion.score}/{questionIds.length}
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-green-600 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Completed today!
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Come back tomorrow for a new challenge.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full rounded-xl justify-center"
          )}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch the actual questions for the challenge
  const { data: questionsRaw } = await supabase
    .from("questions")
    .select(
      "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice, passage_id, passages(id, content, image_url)"
    )
    .in("id", questionIds);

  if (!questionsRaw || questionsRaw.length === 0) notFound();

  // Preserve question order from challenge.question_ids
  const qMap = new Map(questionsRaw.map((q) => [q.id, q]));
  const questions = questionIds
    .map((id) => {
      const q = qMap.get(id);
      if (!q) return null;
      const passage = q.passages as unknown as {
        id: string;
        content: string | null;
        image_url: string | null;
      } | null;
      return {
        id: q.id,
        question_text: q.question_text,
        image_url: q.image_url ?? null,
        choice_a: q.choice_a,
        choice_b: q.choice_b,
        choice_c: q.choice_c,
        choice_d: q.choice_d,
        correct_choice: q.correct_choice as Choice,
        passage: passage ?? null,
      };
    })
    .filter(Boolean) as {
    id: string;
    question_text: string;
    image_url: string | null;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    correct_choice: Choice;
    passage: { content: string | null; image_url: string | null } | null;
  }[];

  return (
    <DailyChallengeSession date={today} questions={questions} />
  );
}
