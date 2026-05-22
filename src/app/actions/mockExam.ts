"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SCHOOL_EXAMS, FILIPINO_TOPIC_SLUGS } from "@/lib/constants";
import { canStartMockExam } from "@/lib/plan";
import type { ExamType } from "@/lib/constants";

export async function startMockExamSession(
  examType: ExamType = "upcat"
): Promise<{ error: "DAILY_LIMIT_REACHED" } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await canStartMockExam(user.id))) {
    return { error: "DAILY_LIMIT_REACHED" };
  }

  const examConfig = SCHOOL_EXAMS[examType];
  const subtestSlugs = Object.keys(examConfig.subtestItemCounts);

  // Fetch shared subtests by slug — all exams draw from the same question bank
  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, slug, topics(id, slug)")
    .in("slug", subtestSlugs);

  if (!subtests || subtests.length === 0) throw new Error("No subtests found");

  // For each subtest, fetch and shuffle approved questions in parallel
  const subtestQuestions = await Promise.all(
    subtests.map(async (subtest) => {
      const itemCount =
        examConfig.subtestItemCounts[
          subtest.slug as keyof typeof examConfig.subtestItemCounts
        ];
      if (!itemCount) return [];

      // Exclude Filipino topics for non-UPCAT exams
      const allTopics = subtest.topics as { id: string; slug: string }[];
      const topicIds =
        examType === "upcat"
          ? allTopics.map((t) => t.id)
          : allTopics
              .filter((t) => !FILIPINO_TOPIC_SLUGS.includes(t.slug))
              .map((t) => t.id);
      if (topicIds.length === 0) return [];

      const { data: questions } = await supabase
        .from("questions")
        .select("id, passage_id, passage_order")
        .in("topic_id", topicIds)
        .eq("status", "approved")
        .limit(itemCount * 5);

      if (!questions || questions.length === 0) return [];

      // Group by passage; sort each group by passage_order ASC (parent = 1, children = 2+)
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

      // Shuffle groups, greedily fill to itemCount; never include children without parent
      const groups = [...groupMap.values()].sort(() => Math.random() - 0.5);
      const ids: string[] = [];
      for (const group of groups) {
        if (ids.length >= itemCount) break;
        const remaining = itemCount - ids.length;
        if (group.length <= remaining) {
          ids.push(...group.map((q) => q.id));
        } else if (remaining >= 1) {
          ids.push(group[0].id); // parent only as fallback
        }
      }
      return ids;
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
      time_limit_seconds: examConfig.totalTimeSeconds,
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
