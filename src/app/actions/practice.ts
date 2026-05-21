"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRACTICE_SESSION_QUESTION_COUNT } from "@/lib/constants";
import { canStartPractice } from "@/lib/plan";
import type { Choice, ReportReason } from "@/lib/supabase/types";

export async function startPracticeSession(
  topicId: string,
  subtestSlug: string,
  topicSlug: string
): Promise<{ error: "DAILY_LIMIT_REACHED" } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await canStartPractice(user.id))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .eq("topic_id", topicId)
    .eq("status", "approved")
    .limit(50);

  if (!questions || questions.length === 0) {
    throw new Error("No questions available for this topic");
  }

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(
    0,
    Math.min(PRACTICE_SESSION_QUESTION_COUNT, shuffled.length)
  );
  const questionIds = selected.map((q: { id: string }) => q.id);

  const { data: session, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      session_type: "topic_practice",
      topic_id: topicId,
      status: "in_progress",
      total_questions: questionIds.length,
      question_ids: questionIds,
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
  correctChoice: Choice
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("session_answers").insert({
    session_id: sessionId,
    question_id: questionId,
    chosen_choice: chosenChoice,
    is_correct: chosenChoice === correctChoice,
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
    .select("id, status, total_questions, topic_id, session_answers(is_correct)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session || session.status !== "in_progress") return;

  const answers = (
    session.session_answers as { is_correct: boolean | null }[]
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

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("streak_count, last_session_date")
    .eq("id", user.id)
    .single();

  if (profile && profile.last_session_date !== today) {
    const newStreak =
      profile.last_session_date === yesterday
        ? profile.streak_count + 1
        : 1;
    await supabase
      .from("user_profiles")
      .update({ streak_count: newStreak, last_session_date: today })
      .eq("id", user.id);
  }
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
