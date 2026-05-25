"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SCHOOL_EXAMS, FILIPINO_TOPIC_SLUGS } from "@/lib/constants";
import { canStartMockExam, isPremium } from "@/lib/plan";
import type { ExamType } from "@/lib/constants";

type Q = { id: string; topic_id: string; passage_id: string | null; passage_order: number | null };

type SubtestConfig = {
  itemCount: number;
  topicIds: string[];
  shortfallTopicIds?: string[];
};

/** Passage-aware shuffle: groups questions by passage, shuffles groups,
 *  greedily fills up to itemCount. Skips questions already in usedIds. */
function selectFromPool(available: Q[], itemCount: number, usedIds: Set<string>): string[] {
  const filtered = available.filter((q) => !usedIds.has(q.id));

  const groupMap = new Map<string, Q[]>();
  for (const q of filtered) {
    const key = q.passage_id ?? `solo-${q.id}`;
    const g = groupMap.get(key) ?? [];
    g.push(q);
    groupMap.set(key, g);
  }
  for (const g of groupMap.values()) {
    g.sort((a, b) => (a.passage_order ?? 0) - (b.passage_order ?? 0));
  }

  const groups = [...groupMap.values()].sort(() => Math.random() - 0.5);
  const ids: string[] = [];
  for (const group of groups) {
    if (ids.length >= itemCount) break;
    const remaining = itemCount - ids.length;
    if (group.length <= remaining) {
      ids.push(...group.map((q) => q.id));
    } else if (remaining >= 1) {
      ids.push(group[0].id);
    }
  }
  return ids;
}

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

  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, slug, topics(id, slug)")
    .in("slug", subtestSlugs);

  if (!subtests || subtests.length === 0) throw new Error("No subtests found");

  const subtestConfigs: SubtestConfig[] = [];
  const allTopicIds: string[] = [];

  for (const subtest of subtests) {
    const itemCount =
      examConfig.subtestItemCounts[
        subtest.slug as keyof typeof examConfig.subtestItemCounts
      ];
    if (!itemCount) continue;

    const allTopics = subtest.topics as { id: string; slug: string }[];

    // UPCAT language-proficiency: split 25% Filipino / 75% other with fallback
    if (examType === "upcat" && subtest.slug === "language-proficiency") {
      const filipinoTopicIds = allTopics
        .filter((t) => FILIPINO_TOPIC_SLUGS.includes(t.slug))
        .map((t) => t.id);
      const otherTopicIds = allTopics
        .filter((t) => !FILIPINO_TOPIC_SLUGS.includes(t.slug))
        .map((t) => t.id);
      const filipinoTarget = Math.round(itemCount * 0.25); // 3

      subtestConfigs.push({
        itemCount: filipinoTarget,
        topicIds: filipinoTopicIds,
        shortfallTopicIds: otherTopicIds,
      });
      subtestConfigs.push({
        itemCount: itemCount - filipinoTarget, // 9
        topicIds: otherTopicIds,
      });

      allTopicIds.push(...filipinoTopicIds, ...otherTopicIds);
    } else {
      const topicIds =
        examType === "upcat"
          ? allTopics.map((t) => t.id)
          : allTopics
              .filter((t) => !FILIPINO_TOPIC_SLUGS.includes(t.slug))
              .map((t) => t.id);
      if (topicIds.length === 0) continue;

      subtestConfigs.push({ itemCount, topicIds });
      allTopicIds.push(...topicIds);
    }
  }

  // Deduplicate topic IDs before querying
  const uniqueTopicIds = [...new Set(allTopicIds)];

  const userIsPremium = await isPremium(user.id);

  let questionsQuery = supabase
    .from("questions")
    .select("id, topic_id, passage_id, passage_order")
    .in("topic_id", uniqueTopicIds)
    .eq("status", "approved");

  if (!userIsPremium) questionsQuery = questionsQuery.eq("is_premium", false);

  const { data: allQuestions } = await questionsQuery.limit(examConfig.totalItems * 8);

  if (!allQuestions || allQuestions.length === 0) throw new Error("No questions available");

  const questionsByTopic = new Map<string, Q[]>();
  for (const q of allQuestions as Q[]) {
    const arr = questionsByTopic.get(q.topic_id) ?? [];
    arr.push(q);
    questionsByTopic.set(q.topic_id, arr);
  }

  // Build question IDs per subtest; global usedIds prevents cross-subtest duplicates
  const usedIds = new Set<string>();
  const subtestQuestions: string[][] = [];

  for (const { itemCount, topicIds, shortfallTopicIds } of subtestConfigs) {
    const available = topicIds.flatMap((tid) => questionsByTopic.get(tid) ?? []);
    const ids = selectFromPool(available, itemCount, usedIds);

    // Backfill shortfall from fallback pool (e.g. Filipino → non-Filipino)
    if (ids.length < itemCount && shortfallTopicIds) {
      const shortfall = itemCount - ids.length;
      const fallbackAvailable = shortfallTopicIds.flatMap(
        (tid) => questionsByTopic.get(tid) ?? []
      );
      const extra = selectFromPool(fallbackAvailable, shortfall, usedIds);
      ids.push(...extra);
    }

    ids.forEach((id) => usedIds.add(id));
    subtestQuestions.push(ids);
  }

  const allQuestionIds = subtestQuestions.flat();
  if (allQuestionIds.length === 0) throw new Error("No questions available");

  const { data: session, error } = await supabase
    .from("exam_sessions")
    .insert({
      user_id: user.id,
      session_type: "mock_exam",
      exam_type: examType,
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

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];
  const { data: questions } = await supabase
    .from("questions")
    .select("id, topic_id")
    .in("id", questionIds);

  if (!questions) return;

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
