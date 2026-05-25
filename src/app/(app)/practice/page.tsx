import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCachedPracticeSubtests } from "@/lib/cached-queries";
import Link from "next/link";
import { BookOpen, BookMarked, FlaskConical, Calculator, Brain, ChevronRight, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
import { SmartDrillCard } from "@/components/ui/SmartDrillCard";
import { isPremium } from "@/lib/plan";
import { PREMIUM_SUBTESTS } from "@/lib/constants";

const SUBTEST_META: Record<string, { icon: React.ReactNode }> = {
  "language-proficiency": { icon: <BookOpen className="h-5 w-5 text-violet-500" /> },
  "reading-comprehension": { icon: <BookMarked className="h-5 w-5 text-blue-500" /> },
  science: { icon: <FlaskConical className="h-5 w-5 text-green-500" /> },
  mathematics: { icon: <Calculator className="h-5 w-5 text-amber-500" /> },
  reasoning: { icon: <Brain className="h-5 w-5 text-purple-500" /> },
};

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subtests, progressRes, premium] = await Promise.all([
    getCachedPracticeSubtests(),
    supabase
      .from("user_topic_progress")
      .select("topic_id, accuracy_percentage, total_attempts")
      .eq("user_id", user.id),
    isPremium(user.id),
  ]);
  const progress = progressRes.data ?? [];
  const progressMap = new Map(progress.map((p) => [p.topic_id, p]));
  const hasHistory = progress.some((p) => p.total_attempts > 0);

  const subtestStats = subtests.map((subtest) => {
    const topicIds = (subtest.topics as unknown as { id: string }[]).map(
      (t) => t.id
    );
    const topicProgress = topicIds
      .map((id) => progressMap.get(id))
      .filter(Boolean) as typeof progress;
    const attempted = topicProgress.filter((p) => p.total_attempts > 0);
    const avgAccuracy =
      attempted.length > 0
        ? attempted.reduce(
            (sum, p) => sum + Number(p.accuracy_percentage),
            0
          ) / attempted.length
        : 0;
    return {
      id: subtest.id,
      name: subtest.name,
      slug: subtest.slug,
      accuracy: Math.round(avgAccuracy),
      topicCount: topicIds.length,
      attemptedCount: attempted.length,
      isPremiumSubtest: PREMIUM_SUBTESTS.includes(subtest.slug),
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Practice
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose a subject to start practicing
        </p>
      </div>

      <SmartDrillCard premium={premium} hasHistory={hasHistory} />

      <div className="space-y-3">
        {subtestStats.map((subtest) => {
          const meta = SUBTEST_META[subtest.slug];
          if (!meta) return null;
          const locked = subtest.isPremiumSubtest && !premium;
          return (
            <Link key={subtest.id} href={`/practice/${subtest.slug}`}>
              <Card className="rounded-2xl border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <AccuracyRing
                    accuracy={subtest.accuracy}
                    size={64}
                    strokeWidth={6}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
                        {subtest.name}
                      </p>
                      {locked && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-0.5">
                          <Lock className="h-2.5 w-2.5" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subtest.topicCount} topics ·{" "}
                      {subtest.attemptedCount === 0
                        ? "Not started"
                        : `${subtest.attemptedCount} started`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {meta.icon}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
