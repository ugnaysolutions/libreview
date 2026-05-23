"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRACTICE_SESSION_QUESTION_COUNT } from "@/lib/constants";
import { canStartPractice, isPremium } from "@/lib/plan";

const MAX_WEAK_TOPICS = 3;

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

  // Fetch weakest topics sorted by accuracy ascending (only attempted)
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

  // Inverse-accuracy weights → proportional question counts per topic
  const weights = progress.map((p) =>
    Math.max(100 - Number(p.accuracy_percentage), 5)
  );
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const counts = weights.map((w) =>
    Math.max(1, Math.floor((w / totalWeight) * PRACTICE_SESSION_QUESTION_COUNT))
  );
  // Distribute any rounding remainder to the weakest topic (index 0)
  const allocated = counts.reduce((s, c) => s + c, 0);
  counts[0] += PRACTICE_SESSION_QUESTION_COUNT - allocated;

  const questionIds: string[] = [];
  for (let i = 0; i < progress.length; i++) {
    const topicId = progress[i].topic_id;
    const needed = counts[i];

    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .eq("topic_id", topicId)
      .eq("status", "approved")
      .limit(needed * 5);

    if (!questions || questions.length === 0) continue;

    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, needed);
    questionIds.push(...shuffled.map((q) => q.id));
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
