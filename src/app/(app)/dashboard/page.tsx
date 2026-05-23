import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  Flame,
  CalendarDays,
  ClipboardList,
  BookOpen,
  BookMarked,
  FlaskConical,
  Calculator,
  ChevronRight,
  Clock,
  TrendingDown,
  Snowflake,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccuracyRing } from "@/components/ui/AccuracyRing";
import { cn } from "@/lib/utils";
import { isPremium } from "@/lib/plan";

const SUBTEST_META: Record<
  string,
  { icon: React.ReactNode; shortName: string; href: string }
> = {
  "language-proficiency": {
    icon: <BookOpen className="h-5 w-5" />,
    shortName: "Language",
    href: "/practice/language-proficiency",
  },
  "reading-comprehension": {
    icon: <BookMarked className="h-5 w-5" />,
    shortName: "Reading",
    href: "/practice/reading-comprehension",
  },
  science: {
    icon: <FlaskConical className="h-5 w-5" />,
    shortName: "Science",
    href: "/practice/science",
  },
  mathematics: {
    icon: <Calculator className="h-5 w-5" />,
    shortName: "Math",
    href: "/practice/mathematics",
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Parallel data fetch
  const today = new Date().toISOString().split("T")[0];

  const [profileRes, subtestsRes, progressRes, sessionsRes, premium, dailyCompletionRes] = await Promise.all(
    [
      supabase
        .from("user_profiles")
        .select("*, universities(name)")
        .eq("id", user.id)
        .single(),
      supabase
        .from("subtests")
        .select("id, name, slug, display_order, topics(id, slug, name)")
        .order("display_order"),
      supabase
        .from("user_topic_progress")
        .select("topic_id, accuracy_percentage, total_attempts, correct_attempts")
        .eq("user_id", user.id),
      supabase
        .from("exam_sessions")
        .select(
          "id, session_type, total_questions, correct_count, started_at, status, topics(name)"
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(3),
      isPremium(user.id),
      supabase
        .from("daily_challenge_completions")
        .select("score")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
    ]
  );

  const profile = profileRes.data;
  const subtests = subtestsRes.data ?? [];
  const progress = progressRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const dailyCompletion = dailyCompletionRes.data ?? null;

  if (!profile) redirect("/onboarding");

  // Build progress map keyed by topic_id
  const progressMap = new Map(
    progress.map((p) => [p.topic_id, p])
  );

  // Build topic metadata map for weakest-topic lookup
  type TopicMeta = { topicSlug: string; topicName: string; subtestSlug: string; subtestName: string };
  const topicMeta = new Map<string, TopicMeta>();
  for (const subtest of subtests) {
    for (const topic of (subtest.topics as unknown as { id: string; slug: string; name: string }[])) {
      topicMeta.set(topic.id, {
        topicSlug: topic.slug,
        topicName: topic.name,
        subtestSlug: subtest.slug,
        subtestName: subtest.name,
      });
    }
  }

  const weakestEntry = progress
    .filter((p) => p.total_attempts > 0)
    .sort((a, b) => Number(a.accuracy_percentage) - Number(b.accuracy_percentage))[0] ?? null;
  const weakestMeta = weakestEntry ? (topicMeta.get(weakestEntry.topic_id) ?? null) : null;

  // Calculate per-subtest accuracy
  const subtestStats = subtests.map((subtest) => {
    const topicIds: string[] = (
      subtest.topics as unknown as { id: string }[]
    ).map((t) => t.id);
    const topicProgress = topicIds
      .map((id) => progressMap.get(id))
      .filter(Boolean) as typeof progress;
    const attempted = topicProgress.filter((p) => p.total_attempts > 0);
    const avgAccuracy =
      attempted.length > 0
        ? attempted.reduce((sum, p) => sum + Number(p.accuracy_percentage), 0) /
          attempted.length
        : 0;
    const totalAttempts = topicProgress.reduce(
      (sum, p) => sum + p.total_attempts,
      0
    );
    return {
      id: subtest.id,
      name: subtest.name,
      slug: subtest.slug,
      accuracy: Math.round(avgAccuracy),
      totalAttempts,
      topicCount: topicIds.length,
    };
  });

  // Streak & countdown
  const streak = profile.streak_count ?? 0;
  const currentMonth = today.slice(0, 7);
  const freezeUsed =
    (profile as { streak_freeze_month?: string; streak_freeze_used?: number })
      .streak_freeze_month === currentMonth
      ? ((profile as { streak_freeze_used?: number }).streak_freeze_used ?? 0)
      : 0;
  const freezesRemaining = premium ? Math.max(0, 3 - freezeUsed) : 0;

  const daysUntilExam = profile.target_exam_date
    ? differenceInCalendarDays(
        parseISO(profile.target_exam_date),
        new Date()
      )
    : null;

  const displayName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Hi, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ready to review for your dream U?
        </p>
      </div>

      {/* ── Hero CTA ────────────────────────────────────────────── */}
      <Card className="bg-primary text-white border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 opacity-90" />
              <span className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                Mock Exam
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading leading-tight">
              Test yourself under real exam conditions
            </h2>
            <p className="text-sm opacity-80">
              60 items · 60 minutes · All 4 subtests
            </p>
          </div>
          <Link
            href="/mock-exam"
            className="w-full bg-white text-primary hover:bg-white/90 active:bg-white/80 font-bold rounded-xl h-11 px-8 inline-flex items-center justify-center text-sm transition-colors"
          >
            Take Mock Exam
          </Link>
        </CardContent>
      </Card>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground leading-none">
                {streak}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                day streak
              </p>
              {streak === 0 && (
                <p className="text-xs text-amber-500 font-medium mt-0.5">
                  Start today!
                </p>
              )}
              {premium && (
                <div className="flex items-center gap-0.5 mt-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Snowflake
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < freezesRemaining
                          ? "text-blue-400"
                          : "text-muted-foreground/25"
                      )}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-0.5 leading-none">
                    {freezesRemaining}/3
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Days until exam */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              {daysUntilExam !== null && daysUntilExam >= 0 ? (
                <>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {daysUntilExam}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    days until exam
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-foreground">
                    Exam date
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Not set
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Daily Challenge ─────────────────────────────────────── */}
      {dailyCompletion ? (
        <Card className="rounded-2xl border-green-200 bg-green-50/50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Today&apos;s Challenge · Done!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dailyCompletion.score}/5 correct · Come back tomorrow
              </p>
            </div>
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
          </CardContent>
        </Card>
      ) : (
        <Link href="/daily-challenge">
          <Card className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Today&apos;s Challenge
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  5 questions · Free · Boosts your streak
                </p>
              </div>
              <div className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold shrink-0">
                <Zap className="h-3.5 w-3.5" />
                Start
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ── Quick Practice ───────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Quick Practice
          </h2>
          <Link
            href="/practice"
            className="text-sm text-primary font-medium flex items-center gap-0.5"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subtestStats.map((subtest) => {
            const meta = SUBTEST_META[subtest.slug];
            if (!meta) return null;
            return (
              <Link key={subtest.id} href={meta.href}>
                <Card className="rounded-2xl border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AccuracyRing accuracy={subtest.accuracy} size={56} strokeWidth={6} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                        {meta.icon}
                        <span className="text-xs font-medium">{meta.shortName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {subtest.topicCount} topics
                      </p>
                      {subtest.totalAttempts === 0 ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 mt-1"
                        >
                          Not started
                        </Badge>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {subtest.totalAttempts} answered
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Weakest Topic ───────────────────────────────────────── */}
      {weakestEntry && weakestMeta && (
        <Link href={`/practice/${weakestMeta.subtestSlug}/${weakestMeta.topicSlug}`}>
          <Card className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-600">Needs work</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {weakestMeta.topicName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {weakestMeta.subtestName} · {Math.round(Number(weakestEntry.accuracy_percentage))}% accuracy
                </p>
              </div>
              <div className="flex items-center gap-0.5 text-xs text-primary font-medium shrink-0">
                Practice <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ── Recent Sessions ──────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Recent Sessions
          </h2>
          <Link
            href="/progress"
            className="text-sm text-primary font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start practicing!
              </p>
              <Link
                href="/practice"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-3 rounded-xl"
                )}
              >
                Go to Practice
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
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
                  : topic?.name ?? "Practice";

              return (
                <Card key={session.id} className="rounded-2xl border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
                      style={{
                        backgroundColor:
                          scorePercent >= 70
                            ? "#22C55E"
                            : scorePercent >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {scorePercent}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.correct_count} / {session.total_questions} correct
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(session.started_at), "MMM d")}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 mt-1"
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
