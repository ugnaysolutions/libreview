import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { isPremium } from "@/lib/plan";
import { generateNotifications } from "@/lib/generateNotifications";
import type { Notification } from "@/components/nav/NotificationBell";

function getMondayOfThisWeek(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 min-w-0 pb-28 md:pb-0">{children}</main>
      </div>
    );
  }

  const weekStart = getMondayOfThisWeek().toISOString();

  const [
    profileRes,
    premium,
    notificationsRes,
    examTargetsRes,
    weekSessionsRes,
    topicProgressRes,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name, avatar_url, plan, plan_expires_at, streak_count, last_session_date")
      .eq("id", user.id)
      .single(),
    isPremium(user.id),
    supabase
      .from("notifications")
      .select("id, type, title, body, action_url, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_exam_targets")
      .select("exam_type, exam_date")
      .eq("user_id", user.id),
    supabase
      .from("exam_sessions")
      .select("id, session_type")
      .eq("user_id", user.id)
      .gte("started_at", weekStart),
    supabase
      .from("user_topic_progress")
      .select("accuracy_percentage, total_attempts, topics(slug, name)")
      .eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const notifications = (notificationsRes.data ?? []) as Notification[];
  const examTargets = examTargetsRes.data ?? [];
  const weekSessions = weekSessionsRes.data ?? [];
  const topicProgress = (topicProgressRes.data ?? []) as unknown as Array<{
    accuracy_percentage: number;
    total_attempts: number;
    topics: { slug: string; name: string } | null;
  }>;

  const thisWeekSessionCount = weekSessions.length;
  const thisWeekMockCount = weekSessions.filter(s => s.session_type === "mock_exam").length;

  await generateNotifications({
    userId: user.id,
    plan: profile?.plan ?? "free",
    planExpiresAt: profile?.plan_expires_at ?? null,
    streakCount: profile?.streak_count ?? 0,
    lastSessionDate: profile?.last_session_date ?? null,
    examTargets,
    topicProgress,
    thisWeekSessionCount,
    thisWeekMockCount,
    existingNotificationCount: notifications.length,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const currentUser = {
    name: profile?.full_name ?? user.email ?? "User",
    email: user.email ?? "",
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={currentUser}
        isPremium={premium}
        unreadCount={unreadCount}
        notifications={notifications}
      />
      <main className="flex-1 min-w-0 pb-28 md:pb-0">{children}</main>
      <BottomNav
        user={currentUser}
        isPremium={premium}
        unreadCount={unreadCount}
        notifications={notifications}
      />
    </div>
  );
}
