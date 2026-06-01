import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { isPremium } from "@/lib/plan";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Lock, Zap } from "lucide-react";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [userPremium, admin] = [await isPremium(user.id), createAdminClient()];

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: sessions } = await admin
    .from("exam_sessions")
    .select("user_id, correct_count, total_questions")
    .eq("session_type", "mock_exam")
    .eq("status", "completed")
    .gte("completed_at", sevenDaysAgo);

  // Aggregate by user
  const statsMap = new Map<string, { correct: number; total: number; sessions: number }>();
  for (const s of sessions ?? []) {
    const prev = statsMap.get(s.user_id) ?? { correct: 0, total: 0, sessions: 0 };
    statsMap.set(s.user_id, {
      correct: prev.correct + (s.correct_count ?? 0),
      total: prev.total + (s.total_questions ?? 0),
      sessions: prev.sessions + 1,
    });
  }

  const sorted = [...statsMap.entries()]
    .map(([userId, stats]) => ({
      userId,
      score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      correct: stats.correct,
      total: stats.total,
      sessions: stats.sessions,
    }))
    .sort((a, b) => b.score - a.score || b.correct - a.correct)
    .slice(0, 10);

  // Fetch profiles for ranked users
  const rankedIds = sorted.map((e) => e.userId);
  const { data: profiles } = rankedIds.length > 0
    ? await admin.from("user_profiles").select("id, full_name, avatar_url").in("id", rankedIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const entries = sorted.map((e, i) => ({
    rank: i + 1,
    userId: e.userId,
    name: profileMap.get(e.userId)?.full_name ?? "Unknown",
    avatarUrl: profileMap.get(e.userId)?.avatar_url ?? null,
    score: e.score,
    correct: e.correct,
    total: e.total,
    sessions: e.sessions,
    isCurrentUser: e.userId === user.id,
  }));

  // Find current user rank if outside top 10
  const currentUserEntry = statsMap.get(user.id);
  const currentUserRank = currentUserEntry
    ? [...statsMap.entries()]
        .sort(([, a], [, b]) => {
          const sa = a.total > 0 ? a.correct / a.total : 0;
          const sb = b.total > 0 ? b.correct / b.total : 0;
          return sb - sa || b.correct - a.correct;
        })
        .findIndex(([id]) => id === user.id) + 1
    : null;

  const currentUserInTop = entries.some((e) => e.isCurrentUser);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top mock exam scores this week</p>
        </div>
      </div>

      {/* Premium gate for free users */}
      {!userPremium && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-foreground">Premium feature</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to see the full leaderboard and track where you rank among top students.
              </p>
              <Link
                href="/upgrade"
                className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5 mt-1")}
              >
                <Zap className="h-3.5 w-3.5" />
                Upgrade to Premium
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm font-semibold text-foreground">No mock exams this week yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to take a mock exam and claim the top spot!</p>
            <Link
              href="/mock-exam"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 rounded-xl")}
            >
              Take Mock Exam
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const visible = userPremium || entry.rank <= 3;
            return (
              <Card
                key={entry.userId}
                className={cn(
                  "rounded-2xl border-border shadow-sm transition-all",
                  entry.isCurrentUser && "border-primary/40 bg-primary/5",
                  !visible && "opacity-60"
                )}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {MEDAL[entry.rank] ? (
                      <span className="text-xl">{MEDAL[entry.rank]}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  {visible ? (
                    entry.avatarUrl ? (
                      <Image
                        src={entry.avatarUrl}
                        alt={entry.name}
                        width={36}
                        height={36}
                        className="rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{getInitials(entry.name)}</span>
                      </div>
                    )
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Name + sessions */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate", !visible && "blur-sm select-none")}>
                      {visible ? entry.name : "••••••••••"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.sessions} mock{entry.sessions > 1 ? "s" : ""} · {entry.correct}/{entry.total} correct
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        entry.score >= 70 ? "text-green-600" : entry.score >= 50 ? "text-amber-600" : "text-red-500"
                      )}
                    >
                      {entry.score}%
                    </p>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] text-primary font-semibold">You</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Current user rank if outside top 10 */}
      {!currentUserInTop && currentUserRank && currentUserEntry && (
        <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 text-center shrink-0">
              <span className="text-sm font-bold text-muted-foreground">#{currentUserRank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Your rank this week</p>
              <p className="text-xs text-muted-foreground">
                {currentUserEntry.sessions} mock{currentUserEntry.sessions > 1 ? "s" : ""} · {currentUserEntry.correct}/{currentUserEntry.total} correct
              </p>
            </div>
            <p className={cn(
              "text-lg font-bold tabular-nums",
              currentUserEntry.total > 0 && Math.round((currentUserEntry.correct / currentUserEntry.total) * 100) >= 70
                ? "text-green-600"
                : currentUserEntry.total > 0 && Math.round((currentUserEntry.correct / currentUserEntry.total) * 100) >= 50
                ? "text-amber-600"
                : "text-red-500"
            )}>
              {currentUserEntry.total > 0 ? Math.round((currentUserEntry.correct / currentUserEntry.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      )}

      {!userPremium && entries.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Upgrade to Premium to unlock the full top 10 leaderboard.
        </p>
      )}
    </div>
  );
}
