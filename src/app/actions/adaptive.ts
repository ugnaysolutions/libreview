"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRACTICE_SESSION_QUESTION_COUNT } from "@/lib/constants";
import { canStartPractice, isPremium } from "@/lib/plan";
import { after } from "next/server";
import { triggerSessionNotifications } from "@/lib/generateNotifications";

const MAX_WEAK_TOPICS = 5;

function difficultyRange(accuracy: number): number[] {
  if (accuracy < 50) return [1];
  if (accuracy < 70) return [1, 2];
  if (accuracy < 85) return [2, 3];
  return [3];
}

export async function startAdaptiveDrill(): Promise<
  | { error: "NOT_PREMIUM" | "DAILY_LIMIT_REACHED" | "NOT_ENOUGH_HISTORY" }
  | void
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [premium, canStart] = await Promise.all([
    isPremium(user.id),
    canStartPractice(user.id),
  ]);

  if (!premium) return { error: "NOT_PREMIUM" };
  if (!canStart) return { error: "DAILY_LIMIT_REACHED" };

  // Weakest topics sorted ascending by accuracy
  const { data: progress } = await supabase
    .from("user_topic_progress")
    .select("topic_id, accuracy_percentage, total_attempts")
    .eq("user_id", user.id)
    .gt("total_attempts", 0)
    .order("accuracy_percentage", { ascending: true })
    .limit(MAX_WEAK_TOPICS);

  if (!progress || progress.length === 0) {
    return { error: "NOT_ENOUGH_HISTORY" };
  }

  // Recently answered questions (last 14 days, up to 25 sessions)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: recentSessions } = await supabase
    .from("exam_sessions")
    .select("id")
    .eq("user_id", user.id)
    .gte("started_at", twoWeeksAgo)
    .limit(25);

  const recentSessionIds = (recentSessions ?? []).map((s) => s.id);

  let recentAnswers: { question_id: string; is_correct: boolean | null }[] = [];
  if (recentSessionIds.length > 0) {
    const { data } = await supabase
      .from("session_answers")
      .select("question_id, is_correct")
      .in("session_id", recentSessionIds);
    recentAnswers = data ?? [];
  }

  const recentlySeen = new Set(recentAnswers.map((a) => a.question_id));
  const wrongRecently = new Set(
    recentAnswers.filter((a) => a.is_correct === false).map((a) => a.question_id)
  );

  // Inverse-accuracy weights → proportional question counts per topic
  const weights = progress.map((p) =>
    Math.max(100 - Number(p.accuracy_percentage), 5)
  );
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const counts = weights.map((w) =>
    Math.max(1, Math.floor((w / totalWeight) * PRACTICE_SESSION_QUESTION_COUNT))
  );
  // Distribute rounding remainder to the weakest topic
  const allocated = counts.reduce((s, c) => s + c, 0);
  counts[0] += PRACTICE_SESSION_QUESTION_COUNT - allocated;

  const questionIds: string[] = [];

  for (let i = 0; i < progress.length; i++) {
    const { topic_id, accuracy_percentage } = progress[i];
    const needed = counts[i];
    const difficulties = difficultyRange(Number(accuracy_percentage));

    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .eq("topic_id", topic_id)
      .eq("status", "approved")
      .in("difficulty", difficulties)
      .limit(needed * 10);

    if (!questions || questions.length === 0) continue;

    // Priority order: wrong-recently → unseen → seen-correctly
    const wrong = questions.filter((q) => wrongRecently.has(q.id)).sort(() => Math.random() - 0.5);
    const fresh = questions.filter((q) => !recentlySeen.has(q.id)).sort(() => Math.random() - 0.5);
    const seen = questions
      .filter((q) => recentlySeen.has(q.id) && !wrongRecently.has(q.id))
      .sort(() => Math.random() - 0.5);

    const prioritized = [...wrong, ...fresh, ...seen];
    questionIds.push(...prioritized.slice(0, needed).map((q) => q.id));
  }

  if (questionIds.length === 0) {
    return { error: "NOT_ENOUGH_HISTORY" };
  }

  const { data: session, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      session_type: "adaptive_drill",
      topic_id: null,
      status: "in_progress",
      total_questions: questionIds.length,
      question_ids: questionIds,
    })
    .select("id")
    .single();

  if (error || !session) throw new Error("Failed to create adaptive session");

  redirect(`/practice/adaptive/drill/session?session=${session.id}`);
}

export async function completeAdaptiveDrillSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, status, total_questions, question_ids, session_answers(question_id, is_correct)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session || session.status !== "in_progress") return;

  const answers = (
    session.session_answers as { question_id: string; is_correct: boolean | null }[]
  ) ?? [];
  const correctCount = answers.filter((a) => a.is_correct === true).length;

  await supabase
    .from("exam_sessions")
    .update({
      status: "completed",
      correct_count: correctCount,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  // Update per-topic progress (adaptive drill covers multiple topics)
  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];
  const { data: questions } = await supabase
    .from("questions")
    .select("id, topic_id")
    .in("id", questionIds);

  if (questions) {
    const answerMap = new Map(answers.map((a) => [a.question_id, a.is_correct]));
    const topicStats = new Map<string, { total: number; correct: number }>();

    for (const q of questions) {
      if (!q.topic_id) continue;
      const s = topicStats.get(q.topic_id) ?? { total: 0, correct: 0 };
      s.total += 1;
      if (answerMap.get(q.id) === true) s.correct += 1;
      topicStats.set(q.topic_id, s);
    }

    for (const [topicId, stats] of topicStats) {
      const { data: existing } = await supabase
        .from("user_topic_progress")
        .select("id, total_attempts, correct_attempts")
        .eq("user_id", user.id)
        .eq("topic_id", topicId)
        .maybeSingle();

      const newTotal = (existing?.total_attempts ?? 0) + stats.total;
      const newCorrect = (existing?.correct_attempts ?? 0) + stats.correct;
      const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0;

      if (existing) {
        await supabase
          .from("user_topic_progress")
          .update({
            total_attempts: newTotal,
            correct_attempts: newCorrect,
            accuracy_percentage: newAccuracy,
            last_practiced_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_topic_progress").insert({
          user_id: user.id,
          topic_id: topicId,
          total_attempts: newTotal,
          correct_attempts: newCorrect,
          accuracy_percentage: newAccuracy,
          last_practiced_at: new Date().toISOString(),
        });
      }
    }
  }

  // Streak update
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count, last_session_date")
    .eq("id", user.id)
    .single();

  if (profile && profile.last_session_date !== today) {
    const newStreak =
      profile.last_session_date === yesterday ? profile.streak_count + 1 : 1;
    await supabase
      .from("user_profiles")
      .update({ streak_count: newStreak, last_session_date: today })
      .eq("id", user.id);
  }

  after(() => triggerSessionNotifications(user.id));
}
