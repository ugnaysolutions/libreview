import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import type { PracticeQuestion } from "@/components/practice/PracticeSession";
import { TIMED_PRACTICE_SECONDS_PER_QUESTION } from "@/lib/constants";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ subtest: string; topic: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { subtest: subtestSlug, topic: topicSlug } = await params;
  const { session: sessionId } = await searchParams;

  if (!sessionId) redirect(`/practice/${subtestSlug}/${topicSlug}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, status, total_questions, question_ids, timed_mode")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  if (session.status === "completed") {
    redirect(
      `/practice/${subtestSlug}/${topicSlug}/session/results?session=${sessionId}`
    );
  }

  const sessionData = session as { question_ids: string[]; timed_mode: boolean };
  const questionIds = sessionData.question_ids ?? [];
  const timedMode = sessionData.timed_mode ?? false;
  const totalTimeSeconds = timedMode
    ? questionIds.length * TIMED_PRACTICE_SECONDS_PER_QUESTION
    : 0;

  const [questionsRes, answersRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice, passage_id, passages(id, content, image_url)"
      )
      .in("id", questionIds),
    supabase
      .from("session_answers")
      .select("question_id")
      .eq("session_id", sessionId),
  ]);

  if (!questionsRes.data || questionsRes.data.length === 0) notFound();

  // Preserve the order from question_ids and map passage relation
  const qMap = new Map(questionsRes.data.map((q) => [q.id, q]));
  const questions: PracticeQuestion[] = questionIds
    .map((id) => {
      const q = qMap.get(id);
      if (!q) return null;
      const passage = q.passages as unknown as {
        id: string;
        content: string | null;
        image_url: string | null;
      } | null;
      return {
        id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        choice_a: q.choice_a,
        choice_b: q.choice_b,
        choice_c: q.choice_c,
        choice_d: q.choice_d,
        correct_choice: q.correct_choice,
        passage_id: q.passage_id ?? null,
        passage: passage ?? null,
      };
    })
    .filter(Boolean) as PracticeQuestion[];

  const answeredIds = (answersRes.data ?? []).map((a) => a.question_id);
  const firstUnanswered = questions.findIndex(
    (q) => !answeredIds.includes(q.id)
  );
  const initialIndex =
    firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

  return (
    <PracticeSession
      sessionId={sessionId}
      questions={questions}
      answeredIds={answeredIds}
      initialIndex={initialIndex}
      subtestSlug={subtestSlug}
      topicSlug={topicSlug}
      timedMode={timedMode}
      totalTimeSeconds={totalTimeSeconds}
    />
  );
}
