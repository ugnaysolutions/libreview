"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRACTICE_SESSION_QUESTION_COUNT } from "@/lib/constants";
import { canStartPractice, isPremium } from "@/lib/plan";
import type { Choice, ReportReason } from "@/lib/supabase/types";
import type { QuestionSetMode } from "@/lib/constants";
import { triggerSessionNotifications } from "@/lib/generateNotifications";
import { applySmTwo } from "@/lib/srs";

export async function startPracticeSession(
  topicId: string,
  subtestSlug: string,
  topicSlug: string,
  timedMode: boolean = false,
  modes: QuestionSetMode[] = ["random"],
  forceBackfill: boolean = false
): Promise<
  | { error: "DAILY_LIMIT_REACHED" | "NOT_ENOUGH_QUESTIONS" }
  | { error: "BACKFILL_NEEDED"; available: number; total: number }
  | void
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await canStartPractice(user.id))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  const userIsPremium = await isPremium(user.id);

  // Resolve filtered question ID set for filter modes (wrong / bookmarked / srs)
  let allowedIds: Set<string> | null = null;
  let srsScheduledIds: Set<string> | null = null;
  const hasFilterMode = modes.some((m) => m === "wrong" || m === "bookmarked" || m === "srs");

  if (hasFilterMode) {
    allowedIds = new Set<string>();

    if (modes.includes("wrong")) {
      const { data: sessions } = await supabase
        .from("exam_sessions")
        .select("id")
        .eq("user_id", user.id)
        .limit(150);

      const sessionIds = (sessions ?? []).map((s) => s.id);
      if (sessionIds.length > 0) {
        const { data: wrongAnswers } = await supabase
          .from("session_answers")
          .select("question_id")
          .in("session_id", sessionIds)
          .eq("is_correct", false);
        (wrongAnswers ?? []).forEach((a) => allowedIds!.add(a.question_id));
      }
    }

    if (modes.includes("bookmarked")) {
      const { data: bookmarks } = await supabase
        .from("bookmarked_questions")
        .select("question_id")
        .eq("user_id", user.id);
      (bookmarks ?? []).forEach((b) => allowedIds!.add(b.question_id));
    }

    if (modes.includes("srs")) {
      const [dueRes, allRes] = await Promise.all([
        supabase
          .from("question_srs_stats")
          .select("question_id")
          .eq("user_id", user.id)
          .lte("next_review_at", new Date().toISOString()),
        supabase
          .from("question_srs_stats")
          .select("question_id")
          .eq("user_id", user.id),
      ]);
      srsScheduledIds = new Set((allRes.data ?? []).map((s) => s.question_id));
      (dueRes.data ?? []).forEach((s) => allowedIds!.add(s.question_id));
      // Never-reviewed questions are added after topic questions are fetched below
    }

    if (allowedIds.size === 0 && !srsScheduledIds) return { error: "NOT_ENOUGH_QUESTIONS" };
  }

  let questionsQuery = supabase
    .from("questions")
    .select("id, passage_id, passage_order")
    .eq("topic_id", topicId)
    .eq("status", "approved");

  if (!userIsPremium) questionsQuery = questionsQuery.eq("is_premium", false);

  const isNewMode = modes.includes("new") && modes.length === 1;
  if (isNewMode) {
    questionsQuery = questionsQuery.order("created_at", { ascending: false });
  }

  const { data: rawQuestions } = await questionsQuery.limit(
    isNewMode ? PRACTICE_SESSION_QUESTION_COUNT * 2 : 50
  );

  // For SRS mode: also include questions never seen before (not in srs stats)
  if (srsScheduledIds !== null) {
    (rawQuestions ?? []).forEach((q) => {
      if (!srsScheduledIds!.has(q.id)) allowedIds!.add(q.id);
    });
  }

  const questions = allowedIds
    ? (rawQuestions ?? []).filter((q) => allowedIds!.has(q.id))
    : (rawQuestions ?? []);

  if (!questions || questions.length === 0) {
    if (!hasFilterMode && !isNewMode) throw new Error("No questions available for this topic");
    return { error: "NOT_ENOUGH_QUESTIONS" };
  }

  // "new" mode: take most recent, no shuffle
  if (isNewMode) {
    const questionIds = questions.slice(0, PRACTICE_SESSION_QUESTION_COUNT).map((q) => q.id);
    const { data: session, error } = await supabase
      .from("exam_sessions")
      .insert({
        user_id: user.id,
        session_type: "topic_practice",
        topic_id: topicId,
        status: "in_progress",
        total_questions: questionIds.length,
        question_ids: questionIds,
        timed_mode: timedMode,
      })
      .select("id")
      .single();
    if (error || !session) throw new Error("Failed to create session");
    redirect(`/practice/${subtestSlug}/${topicSlug}/session?session=${session.id}`);
  }

  // Check if filtered pool is short — prompt user to backfill with random
  if (allowedIds && questions.length < PRACTICE_SESSION_QUESTION_COUNT && !forceBackfill) {
    return {
      error: "BACKFILL_NEEDED",
      available: questions.length,
      total: PRACTICE_SESSION_QUESTION_COUNT,
    };
  }

  // Group by passage; sort each group by passage_order ASC
  type Q = { id: string; passage_id: string | null; passage_order: number | null };
  const groupMap = new Map<string, Q[]>();
  for (const q of questions as Q[]) {
    const key = q.passage_id ?? `solo-${q.id}`;
    const g = groupMap.get(key) ?? [];
    g.push(q);
    groupMap.set(key, g);
  }
  for (const g of groupMap.values()) {
    g.sort((a, b) => (a.passage_order ?? 0) - (b.passage_order ?? 0));
  }

  // Shuffle groups, greedily fill to session limit from filtered pool
  const groups = [...groupMap.values()].sort(() => Math.random() - 0.5);
  const questionIds: string[] = [];
  for (const group of groups) {
    if (questionIds.length >= PRACTICE_SESSION_QUESTION_COUNT) break;
    const remaining = PRACTICE_SESSION_QUESTION_COUNT - questionIds.length;
    if (group.length <= remaining) {
      questionIds.push(...group.map((q) => q.id));
    } else if (remaining >= 1) {
      questionIds.push(group[0].id);
    }
  }

  // Backfill remaining slots from random pool (when forceBackfill or allowedIds is null)
  if (questionIds.length < PRACTICE_SESSION_QUESTION_COUNT) {
    const usedIds = new Set(questionIds);
    const randomPool = (rawQuestions ?? []).filter(
      (q) => !usedIds.has(q.id) && (!allowedIds || !allowedIds.has(q.id))
    ) as Q[];

    // Group random pool by passage too
    const randGroupMap = new Map<string, Q[]>();
    for (const q of randomPool) {
      const key = q.passage_id ?? `solo-${q.id}`;
      const g = randGroupMap.get(key) ?? [];
      g.push(q);
      randGroupMap.set(key, g);
    }
    for (const g of randGroupMap.values()) {
      g.sort((a, b) => (a.passage_order ?? 0) - (b.passage_order ?? 0));
    }
    const randGroups = [...randGroupMap.values()].sort(() => Math.random() - 0.5);
    for (const group of randGroups) {
      if (questionIds.length >= PRACTICE_SESSION_QUESTION_COUNT) break;
      const remaining = PRACTICE_SESSION_QUESTION_COUNT - questionIds.length;
      if (group.length <= remaining) {
        questionIds.push(...group.map((q) => q.id));
      } else if (remaining >= 1) {
        questionIds.push(group[0].id);
      }
    }
  }

  const { data: session, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      session_type: "topic_practice",
      topic_id: topicId,
      status: "in_progress",
      total_questions: questionIds.length,
      question_ids: questionIds,
      timed_mode: timedMode,
    })
    .select("id")
    .single();

  if (error || !session) throw new Error("Failed to create session");

  redirect(
    `/practice/${subtestSlug}/${topicSlug}/session?session=${session.id}`
  );
}

export async function saveAnswer(
  sessionId: string,
  questionId: string,
  chosenChoice: Choice,
  timeSpentMs: number | null = null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Verify session belongs to this user and fetch correct answer from DB
  const [sessionRes, questionRes] = await Promise.all([
    supabase
      .from("exam_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("questions")
      .select("correct_choice")
      .eq("id", questionId)
      .single(),
  ]);

  if (!sessionRes.data || !questionRes.data) return;

  await supabase.from("session_answers").insert({
    session_id: sessionId,
    question_id: questionId,
    chosen_choice: chosenChoice,
    is_correct: chosenChoice === questionRes.data.correct_choice,
    time_spent_ms: timeSpentMs,
  });
}

export async function completePracticeSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, status, total_questions, topic_id, session_answers(question_id, is_correct)")
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

  if (session.topic_id) {
    const { data: existing } = await supabase
      .from("user_topic_progress")
      .select("id, total_attempts, correct_attempts")
      .eq("user_id", user.id)
      .eq("topic_id", session.topic_id)
      .maybeSingle();

    const newTotal = (existing?.total_attempts ?? 0) + session.total_questions;
    const newCorrect = (existing?.correct_attempts ?? 0) + correctCount;
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
        topic_id: session.topic_id,
        total_attempts: newTotal,
        correct_attempts: newCorrect,
        accuracy_percentage: newAccuracy,
        last_practiced_at: new Date().toISOString(),
      });
    }
  }

  // Streak logic
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const dayBeforeYesterday = new Date(Date.now() - 2 * 86400000)
    .toISOString()
    .split("T")[0];
  const currentMonth = today.slice(0, 7); // YYYY-MM

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count, last_session_date, streak_freeze_used, streak_freeze_month")
    .eq("id", user.id)
    .single();

  if (profile && profile.last_session_date !== today) {
    const isConsecutive = profile.last_session_date === yesterday;
    const isMissedOneDay = profile.last_session_date === dayBeforeYesterday;

    // Freeze tokens reset each calendar month
    const freezeUsed =
      profile.streak_freeze_month === currentMonth
        ? (profile.streak_freeze_used ?? 0)
        : 0;

    let newStreak: number;
    let usedFreeze = false;

    if (isConsecutive) {
      newStreak = profile.streak_count + 1;
    } else if (isMissedOneDay && freezeUsed < 3 && (await isPremium(user.id))) {
      // Auto-apply a freeze token to bridge the missed day
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

  // Update SRS stats for all answered questions
  if (answers.length > 0) {
    const qIds = answers.map((a) => a.question_id);
    const { data: existingStats } = await supabase
      .from("question_srs_stats")
      .select("question_id, interval_days, ease_factor, repetitions")
      .eq("user_id", user.id)
      .in("question_id", qIds);

    const statsMap = new Map(
      (existingStats ?? []).map((s) => [s.question_id, s])
    );

    const srsUpdates = answers.map((a) => ({
      user_id: user.id,
      question_id: a.question_id,
      ...applySmTwo(
        statsMap.get(a.question_id) ?? { interval_days: 1, ease_factor: 2.5, repetitions: 0 },
        a.is_correct ?? false
      ),
    }));

    await supabase
      .from("question_srs_stats")
      .upsert(srsUpdates, { onConflict: "user_id,question_id" });
  }

  after(() => triggerSessionNotifications(user.id));
}

export async function reportQuestion(
  questionId: string,
  reason: ReportReason,
  notes: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("question_reports").insert({
    question_id: questionId,
    user_id: user.id,
    reason,
    notes: notes.trim() || null,
  });
}
