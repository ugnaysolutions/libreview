"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isPremium } from "@/lib/plan";
import type { Choice } from "@/lib/supabase/types";

// 1 question from LP, 2 from RC, 1 from Science, 1 from Math = 5 total
const QUESTION_DISTRIBUTION: { slug: string; count: number }[] = [
  { slug: "language-proficiency", count: 1 },
  { slug: "reading-comprehension", count: 2 },
  { slug: "science", count: 1 },
  { slug: "mathematics", count: 1 },
];

export async function getOrCreateDailyChallenge(): Promise<{
  date: string;
  question_ids: string[];
} | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Check if today's challenge already exists
  const { data: existing } = await supabase
    .from("daily_challenges")
    .select("date, question_ids")
    .eq("date", today)
    .maybeSingle();

  if (existing) return existing as { date: string; question_ids: string[] };

  // Generate: pick questions per subtest
  const questionIds: string[] = [];

  for (const { slug, count } of QUESTION_DISTRIBUTION) {
    const { data: subtestData } = await supabase
      .from("subtests")
      .select("topics(id)")
      .eq("slug", slug)
      .single();

    const topicIds = (
      subtestData?.topics as { id: string }[] ?? []
    ).map((t) => t.id);
    if (topicIds.length === 0) continue;

    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .in("topic_id", topicIds)
      .eq("status", "approved")
      .limit(40);

    if (!questions || questions.length === 0) continue;

    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    questionIds.push(...shuffled.slice(0, count).map((q) => q.id));
  }

  if (questionIds.length === 0) return null;

  // Upsert — first writer wins; later callers get the existing row
  await supabase
    .from("daily_challenges")
    .upsert(
      { date: today, question_ids: questionIds },
      { onConflict: "date", ignoreDuplicates: true }
    );

  // Re-fetch so we always return what's actually stored
  const { data: stored } = await supabase
    .from("daily_challenges")
    .select("date, question_ids")
    .eq("date", today)
    .single();

  return stored as { date: string; question_ids: string[] } | null;
}

export async function completeDailyChallenge(
  date: string,
  answers: { questionId: string; chosenChoice: Choice }[]
): Promise<{ alreadyCompleted: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify correct choices server-side
  const questionIds = answers.map((a) => a.questionId);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, correct_choice")
    .in("id", questionIds);

  const correctMap = new Map(
    (questions ?? []).map((q) => [q.id, q.correct_choice as Choice])
  );
  const score = answers.filter(
    (a) => correctMap.get(a.questionId) === a.chosenChoice
  ).length;

  // Save completion (ignore if already done today)
  const { error } = await supabase.from("daily_challenge_completions").insert({
    user_id: user.id,
    date,
    score,
  });

  if (error) {
    // UNIQUE constraint violation = already completed
    return { alreadyCompleted: true };
  }

  // Advance streak (same logic as completePracticeSession)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const dayBeforeYesterday = new Date(Date.now() - 2 * 86400000)
    .toISOString()
    .split("T")[0];
  const currentMonth = today.slice(0, 7);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count, last_session_date, streak_freeze_used, streak_freeze_month")
    .eq("id", user.id)
    .single();

  if (profile && profile.last_session_date !== today) {
    const isConsecutive = profile.last_session_date === yesterday;
    const isMissedOneDay = profile.last_session_date === dayBeforeYesterday;
    const freezeUsed =
      profile.streak_freeze_month === currentMonth
        ? (profile.streak_freeze_used ?? 0)
        : 0;

    let newStreak: number;
    let usedFreeze = false;

    if (isConsecutive) {
      newStreak = profile.streak_count + 1;
    } else if (
      isMissedOneDay &&
      freezeUsed < 3 &&
      (await isPremium(user.id))
    ) {
      newStreak = profile.streak_count + 1;
      usedFreeze = true;
    } else {
      newStreak = 1;
    }

    await supabase
      .from("user_profiles")
      .update({
        streak_count: newStreak,
        last_session_date: today,
        streak_freeze_used: usedFreeze ? freezeUsed + 1 : freezeUsed,
        streak_freeze_month: currentMonth,
      })
      .eq("id", user.id);
  }

  return { alreadyCompleted: false };
}
