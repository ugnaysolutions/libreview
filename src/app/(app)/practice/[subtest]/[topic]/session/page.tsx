import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import type { PracticeQuestion } from "@/components/practice/PracticeSession";

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
    .select("id, status, total_questions, question_ids")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  if (session.status === "completed") {
    redirect(
      `/practice/${subtestSlug}/${topicSlug}/session/results?session=${sessionId}`
    );
  }

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];

  const [questionsRes, answersRes] = await Promise.all([
    supabase
      .from("questions")
      .select(
        "id, question_text, image_url, choice_a, choice_b, choice_c, choice_d, correct_choice"
      )
      .in("id", questionIds),
    supabase
      .from("session_answers")
      .select("question_id")
      .eq("session_id", sessionId),
  ]);

  if (!questionsRes.data || questionsRes.data.length === 0) notFound();

  // Preserve the order from question_ids
  const qMap = new Map(questionsRes.data.map((q) => [q.id, q]));
  const questions = questionIds
    .map((id) => qMap.get(id))
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
    />
  );
}
