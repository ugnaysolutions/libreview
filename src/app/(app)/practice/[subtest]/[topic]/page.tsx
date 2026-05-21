import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
import { StartPracticeButton } from "@/components/practice/StartPracticeButton";
import { PRACTICE_SESSION_QUESTION_COUNT } from "@/lib/constants";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subtest: string; topic: string }>;
}) {
  const { subtest: subtestSlug, topic: topicSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topic } = await supabase
    .from("topics")
    .select("id, name, description, subtests(name, slug)")
    .eq("slug", topicSlug)
    .single();

  if (!topic) notFound();

  const [questionCountRes, progressRes] = await Promise.all([
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topic.id)
      .eq("status", "approved"),
    supabase
      .from("user_topic_progress")
      .select("accuracy_percentage, total_attempts, correct_attempts")
      .eq("user_id", user.id)
      .eq("topic_id", topic.id)
      .maybeSingle(),
  ]);

  const questionCount = questionCountRes.count ?? 0;
  const progress = progressRes.data;
  const accuracy = progress ? Math.round(Number(progress.accuracy_percentage)) : 0;
  const subtest = topic.subtests as unknown as { name: string; slug: string };
  const sessionQuestionCount = Math.min(
    PRACTICE_SESSION_QUESTION_COUNT,
    questionCount
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/practice/${subtestSlug}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">{subtest?.name}</p>
          <h1 className="text-xl font-bold font-heading text-foreground">
            {topic.name}
          </h1>
        </div>
      </div>

      {topic.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {topic.description}
        </p>
      )}

      {/* Progress card */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-5 flex items-center gap-5">
          <AccuracyRing accuracy={accuracy} size={80} strokeWidth={7} />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Your Progress
            </p>
            {progress && progress.total_attempts > 0 ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {progress.correct_attempts} correct of{" "}
                  {progress.total_attempts} answered
                </p>
                <p className="text-xs text-muted-foreground">
                  {accuracy}% accuracy
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Not started yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session info card */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Practice Session
            </p>
            <p className="text-xs text-muted-foreground">
              {sessionQuestionCount} question
              {sessionQuestionCount !== 1 ? "s" : ""} · Multiple choice ·
              No time limit
            </p>
          </div>
        </CardContent>
      </Card>

      <StartPracticeButton
        topicId={topic.id}
        subtestSlug={subtestSlug}
        topicSlug={topicSlug}
        disabled={questionCount === 0}
      />

      {questionCount === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No questions available for this topic yet.
        </p>
      )}
    </div>
  );
}
