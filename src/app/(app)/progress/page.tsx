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
  TrendingUp,
  Lock,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
import { cn } from "@/lib/utils";
import { TopicBadge, getBadgeLevel, badgeLabel, type BadgeLevel } from "@/components/ui/TopicBadge";
import { isPremium } from "@/lib/plan";
import { MOCK_EXAM } from "@/lib/constants";

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

  const [profileRes, subtestsRes, progressRes, historyRes, calendarRes, premium] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("streak_count, last_session_date")
        .eq("id", user.id)
        .single(),
      supabase
        .from("subtests")
        .select(
          "id, name, slug, display_order, topics(id, name, slug, display_order)"
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
        .limit(10),
      supabase
        .from("exam_sessions")
        .select("started_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("started_at", thirtyDaysAgo.toISOString()),
      isPremium(user.id),
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

  // Build achievements list from existing progress (no extra DB query needed)
  type Achievement = { topicName: string; subtestName: string; accuracy: number; level: BadgeLevel };
  const LEVEL_ORDER: Record<BadgeLevel, number> = { gold: 0, silver: 1, bronze: 2 };
  const achievements: Achievement[] = [];
  for (const subtest of subtests) {
    for (const topic of (subtest.topics as unknown as { id: string; name: string; display_order: number | null }[])) {
      const p = progressMap.get(topic.id);
      if (!p || p.total_attempts === 0) continue;
      const accuracy = Math.round(Number(p.accuracy_percentage));
      const level = getBadgeLevel(accuracy, true);
      if (level) achievements.push({ topicName: topic.name, subtestName: subtest.name, accuracy, level });
    }
  }
  achievements.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || b.accuracy - a.accuracy);

  // Score Predictor — per-subtest weighted accuracy × UPCAT item counts
  type SubtestPrediction = {
    name: string;
    slug: string;
    itemCount: number;
    predicted: number | null;
    accuracy: number | null;
  };
  const UPCAT_ITEMS = MOCK_EXAM.subtestItemCounts;
  const predictorSubtests: SubtestPrediction[] = subtests
    .filter((s) => s.slug in UPCAT_ITEMS)
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => {
      const itemCount = UPCAT_ITEMS[s.slug as keyof typeof UPCAT_ITEMS];
      const topics = s.topics as unknown as { id: string }[];
      const practiced = topics
        .map((t) => progressMap.get(t.id))
        .filter(
          (p): p is NonNullable<typeof p> => p != null && p.total_attempts > 0
        );
      if (practiced.length === 0) {
        return { name: s.name, slug: s.slug, itemCount, predicted: null, accuracy: null };
      }
      const totalAttempts = practiced.reduce((sum, p) => sum + p.total_attempts, 0);
      const totalCorrect = practiced.reduce((sum, p) => sum + p.correct_attempts, 0);
      const acc = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
      return {
        name: s.name,
        slug: s.slug,
        itemCount,
        predicted: acc * itemCount,
        accuracy: Math.round(acc * 100),
      };
    });

  const practicedCount = predictorSubtests.filter((s) => s.predicted !== null).length;
  const predictorConfidence =
    practicedCount === 4
      ? "High confidence"
      : practicedCount === 3
      ? "Good estimate"
      : practicedCount === 2
      ? "Rough estimate"
      : "Very rough estimate";

  // Scale practiced subtests' accuracy to the full 60-item UPCAT
  const practicedAccuracy =
    practicedCount > 0
      ? predictorSubtests
          .filter((s) => s.predicted !== null)
          .reduce((sum, s) => sum + (s.predicted ?? 0), 0) /
        predictorSubtests
          .filter((s) => s.predicted !== null)
          .reduce((sum, s) => sum + s.itemCount, 0)
      : 0;
  const predictedTotal = Math.round(practicedAccuracy * MOCK_EXAM.totalItems);
  const predictedLow = Math.max(0, predictedTotal - 3);
  const predictedHigh = Math.min(MOCK_EXAM.totalItems, predictedTotal + 3);

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

      {/* ── Score Predictor ─────────────────────────────────────── */}
      {premium && practicedCount > 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Score Predictor
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                PRO
              </Badge>
            </div>

            {/* Projected total */}
            <div className="text-center py-1">
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {predictedLow}
                <span className="text-muted-foreground mx-1">–</span>
                {predictedHigh}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                out of {MOCK_EXAM.totalItems} · {predictorConfidence}
              </p>
              {practicedCount < 4 && (
                <p className="text-xs text-amber-600 mt-1">
                  Based on {practicedCount} of 4 subjects — practice the rest
                  for a more accurate estimate
                </p>
              )}
            </div>

            {/* Per-subtest breakdown */}
            <div className="space-y-2">
              {predictorSubtests.map((s) => {
                const pct = s.predicted !== null ? s.predicted / s.itemCount : null;
                return (
                  <div key={s.slug} className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground w-40 truncate shrink-0">
                      {s.name}
                    </p>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      {pct !== null && (
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct >= 0.7
                              ? "bg-green-500"
                              : pct >= 0.5
                              ? "bg-amber-400"
                              : "bg-red-400"
                          )}
                          style={{ width: `${Math.round(pct * 100)}%` }}
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground shrink-0 w-16 text-right tabular-nums">
                      {s.predicted !== null
                        ? `${Math.round(s.predicted)}/${s.itemCount}`
                        : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : !premium ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Score Predictor
              </p>
              <p className="text-xs text-muted-foreground">
                See your projected UPCAT score
              </p>
            </div>
          </div>
          <Link
            href="/upgrade"
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 shrink-0"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </Link>
        </div>
      ) : null}

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
              slug: string;
              display_order: number | null;
            }[]
          ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

          const practicedTopics = topics
            .filter((t) => {
              const p = progressMap.get(t.id);
              return p && p.total_attempts > 0;
            })
            .sort((a, b) => {
              const pa = Number(progressMap.get(a.id)?.accuracy_percentage ?? 0);
              const pb = Number(progressMap.get(b.id)?.accuracy_percentage ?? 0);
              return pa - pb; // weakest first
            });
          const notStartedCount = topics.length - practicedTopics.length;
          const attempted = practicedTopics.map((t) => progressMap.get(t.id)!);
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

                {/* Topics list — practiced only, weakest first */}
                <div className="divide-y divide-border">
                  {practicedTopics.length === 0 ? (
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        No topics practiced yet
                      </p>
                      <Link
                        href={`/practice/${subtest.slug}`}
                        className="text-xs font-medium text-primary flex items-center gap-0.5"
                      >
                        Explore
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    practicedTopics.map((topic) => {
                      const p = progressMap.get(topic.id)!;
                      const accuracy = Math.round(Number(p.accuracy_percentage));
                      const lastPracticed = p.last_practiced_at
                        ? format(parseISO(p.last_practiced_at), "MMM d")
                        : null;
                      const lvl = getBadgeLevel(accuracy, true);

                      return (
                        <Link
                          key={topic.id}
                          href={`/practice/${subtest.slug}/${topic.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                        >
                          <AccuracyRing
                            accuracy={accuracy}
                            size={40}
                            strokeWidth={4}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-medium text-foreground truncate">
                                {topic.name}
                              </p>
                              {lvl && <TopicBadge level={lvl} size={12} />}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {p.total_attempts} answered{lastPracticed ? ` · ${lastPracticed}` : ""}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-foreground shrink-0">
                            {accuracy}%
                          </p>
                        </Link>
                      );
                    })
                  )}
                </div>
                {/* Not-started footer */}
                {notStartedCount > 0 && practicedTopics.length > 0 && (
                  <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      +{notStartedCount} topic{notStartedCount > 1 ? "s" : ""} not started
                    </p>
                    <Link
                      href={`/practice/${subtest.slug}`}
                      className="text-[11px] font-medium text-primary flex items-center gap-0.5"
                    >
                      Explore
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ── Achievements ────────────────────────────────────────── */}
      {achievements.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Achievements{" "}
            <span className="text-muted-foreground font-normal text-sm">
              ({achievements.length})
            </span>
          </h2>
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <TopicBadge level={a.level} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {a.topicName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {a.subtestName} · {badgeLabel(a.level)}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-foreground shrink-0">
                      {a.accuracy}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Session history ─────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Recent Sessions
        </h2>
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {history.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No sessions yet. Start practicing!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map((session) => {
                  const scorePercent =
                    session.total_questions > 0
                      ? Math.round(
                          (session.correct_count / session.total_questions) * 100
                        )
                      : 0;
                  const topic = session.topics as unknown as { name: string } | null;
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
                  const isMock = session.session_type === "mock_exam";

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white text-[11px] font-bold tabular-nums"
                        style={{ backgroundColor: scoreColor }}
                      >
                        {scorePercent}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {label}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          {session.correct_count}/{session.total_questions} correct
                          {session.time_spent_seconds != null && (
                            <>
                              <span>·</span>
                              <Clock className="h-2.5 w-2.5" />
                              {Math.round(session.time_spent_seconds / 60)}m
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">
                          {format(parseISO(session.started_at), "MMM d")}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {isMock ? "Mock" : "Practice"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
