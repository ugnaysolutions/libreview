import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { MockExamSession } from "@/components/mock-exam/MockExamSession";
import type { MockExamQuestion } from "@/components/mock-exam/MockExamSession";

export default async function MockExamSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) redirect("/mock-exam");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, status, total_questions, question_ids, started_at, time_limit_seconds")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  if (session.status === "completed") {
    redirect(`/mock-exam/results/${sessionId}`);
  }

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];

  // Fetch questions with their subtest context
  const [questionsRes, answersRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice, topic_id, topics(subtest_id, subtests(id, name, display_order))"
      )
      .in("id", questionIds),
    supabase
      .from("session_answers")
      .select("question_id")
      .eq("session_id", sessionId),
  ]);

  if (!questionsRes.data || questionsRes.data.length === 0) notFound();

  // Order questions to match question_ids array and enrich with subtest info
  const qMap = new Map(questionsRes.data.map((q) => [q.id, q]));
  const questions: MockExamQuestion[] = questionIds
    .map((id) => {
      const q = qMap.get(id);
      if (!q) return null;
      const topic = q.topics as unknown as {
        subtest_id: string;
        subtests: { id: string; name: string; display_order: number | null };
      } | null;
      return {
        id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        choice_a: q.choice_a,
        choice_b: q.choice_b,
        choice_c: q.choice_c,
        choice_d: q.choice_d,
        correct_choice: q.correct_choice as "a" | "b" | "c" | "d",
        topic_id: q.topic_id,
        subtest_id: topic?.subtest_id ?? "",
        subtest_name: topic?.subtests?.name ?? "",
      };
    })
    .filter(Boolean) as MockExamQuestion[];

  const answeredIds = new Set(
    (answersRes.data ?? []).map((a) => a.question_id)
  );

  const firstUnanswered = questions.findIndex((q) => !answeredIds.has(q.id));
  const initialIndex =
    firstUnanswered === -1 ? 0 : firstUnanswered;

  return (
    <MockExamSession
      sessionId={sessionId}
      questions={questions}
      answeredIds={[...answeredIds]}
      initialIndex={initialIndex}
      startedAt={session.started_at}
      timeLimitSeconds={session.time_limit_seconds ?? 3600}
    />
  );
}
