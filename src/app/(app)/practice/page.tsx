import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookMarked, FlaskConical, Calculator, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AccuracyRing } from "@/components/ui/AccuracyRing";

const SUBTEST_META: Record<string, { icon: React.ReactNode }> = {
  "language-proficiency": { icon: <BookOpen className="h-5 w-5 text-violet-500" /> },
  "reading-comprehension": { icon: <BookMarked className="h-5 w-5 text-blue-500" /> },
  science: { icon: <FlaskConical className="h-5 w-5 text-green-500" /> },
  mathematics: { icon: <Calculator className="h-5 w-5 text-amber-500" /> },
};

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subtestsRes, progressRes] = await Promise.all([
    supabase
      .from("subtests")
      .select("id, name, slug, display_order, topics(id)")
      .order("display_order"),
    supabase
      .from("user_topic_progress")
      .select("topic_id, accuracy_percentage, total_attempts")
      .eq("user_id", user.id),
  ]);

  const subtests = subtestsRes.data ?? [];
  const progress = progressRes.data ?? [];
  const progressMap = new Map(progress.map((p) => [p.topic_id, p]));

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

      <div className="space-y-3">
        {subtestStats.map((subtest) => {
          const meta = SUBTEST_META[subtest.slug];
          if (!meta) return null;
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
                    <p className="text-base font-semibold text-foreground">
                      {subtest.name}
                    </p>
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
