import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, BookMarked, FlaskConical, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SUBTEST_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  "language-proficiency": { icon: BookOpen, color: "text-violet-500" },
  "reading-comprehension": { icon: BookMarked, color: "text-blue-500" },
  science: { icon: FlaskConical, color: "text-green-500" },
  mathematics: { icon: Calculator, color: "text-amber-500" },
};

export default async function SubjectProgressPage({
  params,
}: {
  params: Promise<{ subtest: string }>;
}) {
  const { subtest: subtestSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subtestRes, sessionsRes] = await Promise.all([
    supabase
      .from("subtests")
      .select("id, name, slug, topics(id, name, slug, display_order)")
      .eq("slug", subtestSlug)
      .single(),
    supabase
      .from("exam_sessions")
      .select("topic_id, correct_count, total_questions")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("topic_id", "is", null)
      .order("started_at", { ascending: false }),
  ]);

  if (!subtestRes.data) notFound();

  const subtest = subtestRes.data;
  const topics = (
    subtest.topics as unknown as {
      id: string;
      name: string;
      slug: string;
      display_order: number | null;
    }[]
  ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Build last-session map: topic_id → {correct, total} from most recent session
  const lastSessionMap = new Map<string, { correct: number; total: number }>();
  for (const s of sessionsRes.data ?? []) {
    if (s.topic_id && !lastSessionMap.has(s.topic_id)) {
      lastSessionMap.set(s.topic_id, {
        correct: s.correct_count ?? 0,
        total: s.total_questions,
      });
    }
  }

  const meta = SUBTEST_META[subtest.slug];
  const Icon = meta?.icon ?? BookOpen;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/progress"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Progress
      </Link>

      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", meta?.color ?? "text-primary")} />
        <h1 className="text-2xl font-bold font-heading text-foreground">
          {subtest.name}
        </h1>
      </div>

      {/* Topic list */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {topics.map((topic) => {
              const session = lastSessionMap.get(topic.id);
              const pct =
                session && session.total > 0
                  ? Math.round((session.correct / session.total) * 100)
                  : null;

              return (
                <Link
                  key={topic.id}
                  href={`/practice/${subtest.slug}/${topic.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{topic.name}</p>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold shrink-0",
                      pct === null
                        ? "text-muted-foreground font-normal text-xs"
                        : pct >= 70
                        ? "text-green-500"
                        : pct >= 50
                        ? "text-amber-500"
                        : "text-red-500"
                    )}
                  >
                    {pct === null ? "No score" : `${pct}%`}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
