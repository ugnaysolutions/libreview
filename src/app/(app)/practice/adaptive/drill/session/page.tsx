import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import type { PracticeQuestion } from "@/components/practice/PracticeSession";

export default async function AdaptiveSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) redirect("/practice");

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
    redirect(`/practice/adaptive/drill/session/results?session=${sessionId}`);
  }

  const questionIds = (session as { question_ids: string[] }).question_ids ?? [];

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
  const firstUnanswered = questions.findIndex((q) => !answeredIds.includes(q.id));
  const initialIndex = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

  return (
    <PracticeSession
      sessionId={sessionId}
      questions={questions}
      answeredIds={answeredIds}
      initialIndex={initialIndex}
      subtestSlug="adaptive"
      topicSlug="drill"
    />
  );
}
