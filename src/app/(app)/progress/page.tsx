import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, parseISO, subDays } from "date-fns";
import {
  BookOpen,
  BookMarked,
  FlaskConical,
  Calculator,
  Flame,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
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

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);

  const [profileRes, subtestsRes, progressRes, historyRes, calendarRes] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("streak_count, last_session_date")
        .eq("id", user.id)
        .single(),
      supabase
        .from("subtests")
        .select(
          "id, name, slug, display_order, topics(id, name, display_order)"
        )
        .order("display_order"),
      supabase
        .from("user_topic_progress")
        .select(
          "topic_id, accuracy_percentage, total_attempts, correct_attempts, last_practiced_at"
        )
        .eq("user_id", user.id),
      supabase
        .from("exam_sessions")
        .select(
          "id, session_type, total_questions, correct_count, time_spent_seconds, started_at, topics(name)"
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(20),
      supabase
        .from("exam_sessions")
        .select("started_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("started_at", thirtyDaysAgo.toISOString()),
    ]);

  const profile = profileRes.data;
  const subtests = subtestsRes.data ?? [];
  const progress = progressRes.data ?? [];
  const history = historyRes.data ?? [];
  const calendarSessions = calendarRes.data ?? [];

  // Overall stats
  const totalAttempts = progress.reduce((s, p) => s + p.total_attempts, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.correct_attempts, 0);
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const streak = profile?.streak_count ?? 0;

  const progressMap = new Map(progress.map((p) => [p.topic_id, p]));

  // Build 30-day calendar grid
  const sessionDates = new Set(
    calendarSessions.map((s) => s.started_at.split("T")[0])
  );
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      dateStr,
      hasSession: sessionDates.has(dateStr),
      isToday: i === 29,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your UPCAT preparation
        </p>
      </div>

      {/* ── Overall stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-foreground">
              {totalAttempts.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Questions answered
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <p
              className={cn(
                "text-xl font-bold",
                overallAccuracy >= 70
                  ? "text-green-500"
                  : overallAccuracy >= 50
                  ? "text-amber-500"
                  : overallAccuracy === 0
                  ? "text-foreground"
                  : "text-red-500"
              )}
            >
              {overallAccuracy}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Overall accuracy
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xl font-bold text-amber-500">{streak}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              Day streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 30-day activity ─────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Last 30 Days
        </h2>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-10 gap-1.5">
              {calendarDays.map(({ dateStr, hasSession, isToday }) => (
                <div
                  key={dateStr}
                  title={format(parseISO(dateStr), "MMM d")}
                  className={cn(
                    "aspect-square rounded-md transition-colors",
                    hasSession ? "bg-primary" : "bg-muted",
                    isToday && !hasSession && "ring-2 ring-primary/50"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(subDays(today, 29), "MMM d")}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
                  Session
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-muted border border-border" />
                  None
                </span>
              </div>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Subtest breakdown ───────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">By Subject</h2>
        {subtests.map((subtest) => {
          const topics = (
            subtest.topics as unknown as {
              id: string;
              name: string;
              display_order: number | null;
            }[]
          ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

          const topicProgresses = topics
            .map((t) => progressMap.get(t.id))
            .filter(Boolean) as typeof progress;
          const attempted = topicProgresses.filter((p) => p.total_attempts > 0);
          const subtestAccuracy =
            attempted.length > 0
              ? Math.round(
                  attempted.reduce(
                    (s, p) => s + Number(p.accuracy_percentage),
                    0
                  ) / attempted.length
                )
              : 0;

          const meta = SUBTEST_META[subtest.slug];
          const Icon = meta?.icon ?? BookOpen;

          return (
            <Card
              key={subtest.id}
              className="rounded-2xl border-border shadow-sm overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Subtest header */}
                <div className="flex items-center gap-4 p-4 border-b border-border">
                  <AccuracyRing
                    accuracy={subtestAccuracy}
                    size={56}
                    strokeWidth={5}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={cn("h-4 w-4", meta?.color ?? "text-primary")}
                      />
                      <p className="text-sm font-semibold text-foreground">
                        {subtest.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {attempted.length} of {topics.length} topics started
                    </p>
                  </div>
                </div>

                {/* Topics list */}
                <div className="divide-y divide-border">
                  {topics.map((topic) => {
                    const p = progressMap.get(topic.id);
                    const accuracy = p
                      ? Math.round(Number(p.accuracy_percentage))
                      : 0;
                    const lastPracticed = p?.last_practiced_at
                      ? format(parseISO(p.last_practiced_at), "MMM d")
                      : null;

                    return (
                      <div
                        key={topic.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <AccuracyRing
                          accuracy={accuracy}
                          size={40}
                          strokeWidth={4}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {topic.name}
                          </p>
                          {p && p.total_attempts > 0 ? (
                            <p className="text-[11px] text-muted-foreground">
                              {p.total_attempts} answered · {lastPracticed}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              Not started
                            </p>
                          )}
                        </div>
                        {p && p.total_attempts > 0 && (
                          <p className="text-xs font-semibold text-foreground shrink-0">
                            {accuracy}%
                          </p>
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

      {/* ── Session history ─────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Session History
        </h2>
        {history.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start practicing!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((session) => {
              const scorePercent =
                session.total_questions > 0
                  ? Math.round(
                      (session.correct_count / session.total_questions) * 100
                    )
                  : 0;
              const topic = session.topics as unknown as {
                name: string;
              } | null;
              const label =
                session.session_type === "mock_exam"
                  ? "Mock Exam"
                  : (topic?.name ?? "Practice");
              const scoreColor =
                scorePercent >= 70
                  ? "#22C55E"
                  : scorePercent >= 50
                  ? "#F59E0B"
                  : "#EF4444";

              return (
                <Card
                  key={session.id}
                  className="rounded-2xl border-border shadow-sm"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: scoreColor }}
                    >
                      {scorePercent}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span>
                          {session.correct_count}/{session.total_questions}{" "}
                          correct
                        </span>
                        {session.time_spent_seconds != null && (
                          <>
                            <span>·</span>
                            <Clock className="h-3 w-3" />
                            <span>
                              {Math.round(session.time_spent_seconds / 60)}m
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(session.started_at), "MMM d")}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {session.session_type === "mock_exam"
                          ? "Mock"
                          : "Practice"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
