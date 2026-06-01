import { createClient } from "@/lib/supabase/server";
import { SCHOOL_EXAMS } from "@/lib/constants";

interface TopicProgress {
  accuracy_percentage: number;
  total_attempts: number;
  topics: { slug: string; name: string } | null;
}

interface ExamTarget {
  exam_type: string;
  exam_date: string;
}

interface NotificationRow {
  user_id: string;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  dedup_key: string | null;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekKey(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const jan4 = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(
    ((date.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7
  );
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export async function generateNotifications(params: {
  userId: string;
  plan: string;
  planExpiresAt: string | null;
  streakCount: number;
  lastSessionDate: string | null;
  examTargets: ExamTarget[];
  topicProgress: TopicProgress[];
  thisWeekSessionCount: number;
  thisWeekMockCount: number;
  existingNotificationCount: number;
}) {
  const {
    userId, plan, planExpiresAt, streakCount, lastSessionDate,
    examTargets, topicProgress, thisWeekSessionCount, thisWeekMockCount,
    existingNotificationCount,
  } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateKey(today);
  const weekStr = weekKey(today);
  const isSunday = today.getDay() === 0;

  const rows: NotificationRow[] = [];

  const push = (
    type: string,
    title: string,
    body: string,
    dedupKey: string | null,
    actionUrl: string | null = null
  ) => rows.push({ user_id: userId, type, title, body, action_url: actionUrl, dedup_key: dedupKey });

  // ── Welcome ──────────────────────────────────────────────────────────────────
  if (existingNotificationCount === 0) {
    push("welcome", "Welcome to LibreviewPH! 🎓", "Start your first practice session and begin your exam prep journey.", "welcome", "/practice");
  }

  // ── Streak ───────────────────────────────────────────────────────────────────
  const lastSession = lastSessionDate ? new Date(lastSessionDate) : null;
  const practicedToday = lastSession ? dateKey(lastSession) === todayStr : false;

  if (streakCount > 0 && !practicedToday) {
    push("streak", "Don't break your streak! 🔥", `You're on a ${streakCount}-day streak. Practice today to keep it alive!`, `streak_at_risk_${todayStr}`, "/practice");
  }

  for (const milestone of [3, 7, 14, 30]) {
    if (streakCount === milestone) {
      push("streak", `${milestone}-day streak! You're on fire 🔥`, `Amazing consistency — ${milestone} days in a row. Keep it up!`, `streak_milestone_${milestone}`);
    }
  }

  // ── Comeback ─────────────────────────────────────────────────────────────────
  if (!practicedToday) {
    if (lastSession) {
      const daysSince = diffDays(today, lastSession);
      if (daysSince >= 3) {
        push("comeback", `We miss you! 👋`, `You haven't practiced in ${daysSince} days. Come back and keep your prep on track.`, `comeback_${todayStr}`, "/practice");
      }
    } else if (existingNotificationCount > 0) {
      push("comeback", "Ready to start? 👋", "You haven't done a practice session yet. Give it a try — every session counts!", `comeback_${todayStr}`, "/practice");
    }
  }

  // ── Exam approaching ─────────────────────────────────────────────────────────
  for (const target of examTargets) {
    const examDate = new Date(target.exam_date);
    examDate.setHours(0, 0, 0, 0);
    const daysUntil = diffDays(examDate, today);
    const examKey = target.exam_type as keyof typeof SCHOOL_EXAMS;
    const examName = SCHOOL_EXAMS[examKey]?.name ?? target.exam_type.toUpperCase();

    const thresholds = [
      { days: 30, suffix: "30d", title: `${examName} is 30 days away! 📅`, body: "Make the most of the time you have. Review your weakest topics and take a mock exam." },
      { days: 7, suffix: "7d", title: `One week until ${examName}! ⚡`, body: "One week to go! Focus on high-yield topics and simulate the real exam." },
      { days: 1, suffix: "1d", title: `${examName} is tomorrow! 💪`, body: "You've got this! Get a good night's sleep and trust your preparation." },
    ];

    for (const t of thresholds) {
      if (daysUntil === t.days) {
        push("exam_approaching", t.title, t.body, `exam_${target.exam_type}_${t.suffix}_${todayStr}`, "/mock-exam");
      }
    }
  }

  // ── Subscription expiry ──────────────────────────────────────────────────────
  if (plan === "premium" && planExpiresAt) {
    const expiry = new Date(planExpiresAt);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = diffDays(expiry, today);

    if (daysLeft === 7) {
      push("expiry_warning", "Premium expires in 7 days", "Renew your subscription to keep all features unlocked.", `expiry_7d_${todayStr}`, "/upgrade");
    } else if (daysLeft === 3) {
      push("expiry_warning", "Premium expires in 3 days ⚠️", "Your premium access is expiring soon. Renew now to avoid interruption.", `expiry_3d_${todayStr}`, "/upgrade");
    } else if (daysLeft === 1) {
      push("expiry_warning", "Premium expires tomorrow ⚠️", "Last chance to renew before your premium access ends.", `expiry_1d_${todayStr}`, "/upgrade");
    }
  }

  // ── Upgrade teaser (free users, once per week) ────────────────────────────────
  if (plan === "free") {
    push("upgrade_teaser", "Unlock your full potential 🚀", "Premium gives you unlimited practice, mock exams for 4 schools, and advanced analytics.", `upgrade_teaser_${weekStr}`, "/upgrade");
  }

  // ── Mock exam nudge (no mock this week) ──────────────────────────────────────
  if (thisWeekMockCount === 0) {
    push("mock_nudge", "You haven't taken a mock exam this week 📋", "Simulate real exam conditions to build confidence and track your progress.", `mock_nudge_${weekStr}`, "/mock-exam");
  }

  // ── Weekly summary (Sundays only) ────────────────────────────────────────────
  if (isSunday) {
    const body = thisWeekSessionCount === 0
      ? "You didn't practice this week. This is your sign to get started!"
      : `${thisWeekSessionCount} session${thisWeekSessionCount === 1 ? "" : "s"} this week${streakCount > 0 ? ` · ${streakCount}-day streak` : ""}. Keep the momentum going!`;
    push("weekly_summary", "Your week in review 📊", body, `weekly_summary_${weekStr}`, "/progress");
  }

  // ── Daily reminder (no session today) ───────────────────────────────────────
  if (!practicedToday) {
    push("daily_reminder", "Daily practice reminder ⏰", "15 minutes a day keeps the exam stress away. You got this!", `daily_reminder_${todayStr}`, "/practice");
  }

  // ── Accuracy milestones ──────────────────────────────────────────────────────
  for (const p of topicProgress) {
    if (!p.topics || p.total_attempts < 5) continue;
    const acc = Number(p.accuracy_percentage);
    for (const threshold of [70, 80]) {
      if (acc >= threshold) {
        push(
          "accuracy_milestone",
          `You've hit ${threshold}% in ${p.topics.name}! 🎯`,
          `Great work! You're showing strong mastery in ${p.topics.name}. Keep it up!`,
          `accuracy_${p.topics.slug}_${threshold}`,
          "/progress"
        );
      }
    }
  }

  // ── Weak topic alert (once per week) ─────────────────────────────────────────
  const attempted = topicProgress.filter(p => p.total_attempts > 0 && p.topics);
  if (attempted.length > 0) {
    const weakest = attempted.reduce((a, b) =>
      Number(a.accuracy_percentage) < Number(b.accuracy_percentage) ? a : b
    );
    if (Number(weakest.accuracy_percentage) < 50) {
      push(
        "weak_topic",
        `${weakest.topics!.name} needs attention`,
        `Your accuracy in ${weakest.topics!.name} is ${Math.round(Number(weakest.accuracy_percentage))}%. Try a focused practice session to improve.`,
        `weak_topic_${weekStr}`,
        "/practice"
      );
    }
  }

  if (rows.length === 0) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .upsert(rows, { onConflict: "user_id,dedup_key", ignoreDuplicates: true });
}
