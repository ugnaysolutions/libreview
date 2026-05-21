"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MOCK_EXAM } from "@/lib/constants";
import { canStartMockExam } from "@/lib/plan";

export async function startMockExamSession(): Promise<
  { error: "DAILY_LIMIT_REACHED" } | void
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await canStartMockExam(user.id))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  // Get subtests ordered, with their topic IDs
  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, slug, topics(id)")
    .order("display_order");

  if (!subtests || subtests.length === 0) throw new Error("No subtests found");

  // For each subtest, fetch and shuffle approved questions in parallel
  const subtestQuestions = await Promise.all(
    subtests.map(async (subtest) => {
      const itemCount =
        MOCK_EXAM.subtestItemCounts[
          subtest.slug as keyof typeof MOCK_EXAM.subtestItemCounts
        ];
      if (!itemCount) return [];

      const topicIds = (subtest.topics as { id: string }[]).map((t) => t.id);
      if (topicIds.length === 0) return [];

      const { data: questions } = await supabase
        .from("questions")
        .select("id")
        .in("topic_id", topicIds)
        .eq("status", "approved")
        .limit(itemCount * 5);

      if (!questions || questions.length === 0) return [];

      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      return shuffled
        .slice(0, Math.min(itemCount, shuffled.length))
        .map((q: { id: string }) => q.id);
    })
  );

  const allQuestionIds = subtestQuestions.flat();
  if (allQuestionIds.length === 0) throw new Error("No questions available");

  const { data: session, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      session_type: "mock_exam",
      status: "in_progress",
      total_questions: allQuestionIds.length,
      question_ids: allQuestionIds,
      time_limit_seconds: MOCK_EXAM.totalTimeSeconds,
    })
    .select("id")
    .single();

  if (error || !session) throw new Error("Failed to create session");

  redirect(`/mock-exam/session?session=${session.id}`);
}

export async function completeMockExamSession(
  sessionId: string,
  timeSpentSeconds: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: session } = await supabase
    .from("exam_sessions")
    .select(
      "id, status, total_questions, question_ids, session_answers(question_id, is_correct)"
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session || session.status !== "in_progress") return;

  const answers = (
    session.session_answers as {
      question_id: string;
      is_correct: boolean | null;
    }[]
  ) ?? [];
  const correctCount = answers.filter((a) => a.is_correct === true).length;

  await supabase
    .from("exam_sessions")
    .update({
      status: "completed",
      correct_count: correctCount,
      time_spent_seconds: Math.round(timeSpentSeconds),
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  // Fetch questions to map question_id → topic_id
  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];
  const { data: questions } = await supabase
    .from("questions")
    .select("id, topic_id")
    .in("id", questionIds);

  if (!questions) return;

  // Build per-topic stats from answers
  const answerMap = new Map(answers.map((a) => [a.question_id, a.is_correct]));
  const topicStats = new Map<string, { total: number; correct: number }>();

  for (const q of questions) {
    if (!q.topic_id) continue;
    const s = topicStats.get(q.topic_id) ?? { total: 0, correct: 0 };
    s.total += 1;
    if (answerMap.get(q.id) === true) s.correct += 1;
    topicStats.set(q.topic_id, s);
  }

  // Upsert user_topic_progress for every topic in the exam
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
      profile.last_session_date === yesterday ? profile.streak_count + 1 : 1;
    await supabase
      .from("user_profiles")
      .update({ streak_count: newStreak, last_session_date: today })
      .eq("id", user.id);
  }
}
