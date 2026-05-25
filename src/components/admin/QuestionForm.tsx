"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuestion, updateQuestion } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Choice, QuestionStatus } from "@/lib/supabase/types";

interface Topic {
  id: string;
  name: string;
  display_order: number | null;
}
interface Subtest {
  id: string;
  name: string;
  slug: string;
  topics: Topic[];
}
interface QuestionData {
  id: string;
  topic_id: string;
  question_text: string;
  image_url: string | null;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  explanation: string;
  difficulty: number;
  status: QuestionStatus;
  is_premium: boolean;
}

interface Props {
  subtests: Subtest[];
  question?: QuestionData;
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelCls = "block text-xs font-semibold text-foreground mb-1";

export function QuestionForm({ subtests, question }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const findInitialSubtest = () => {
    if (!question) return subtests[0]?.id ?? "";
    for (const st of subtests) {
      if (st.topics.find((t) => t.id === question.topic_id)) return st.id;
    }
    return subtests[0]?.id ?? "";
  };

  const [subtestId, setSubtestId] = useState(findInitialSubtest);
  const [topicId, setTopicId] = useState(question?.topic_id ?? "");
  const [correctChoice, setCorrectChoice] = useState<Choice>(
    question?.correct_choice ?? "a"
  );
  const [difficulty, setDifficulty] = useState(
    String(question?.difficulty ?? "1")
  );
  const [status, setStatus] = useState<QuestionStatus>(
    question?.status ?? "draft"
  );
  const [questionIsPremium, setQuestionIsPremium] = useState(
    question?.is_premium ?? true
  );

  const topics = (
    subtests.find((s) => s.id === subtestId)?.topics ?? []
  ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  function handleSubtestChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubtestId(e.target.value);
    const firstTopic =
      subtests.find((s) => s.id === e.target.value)?.topics[0]?.id ?? "";
    setTopicId(firstTopic);
  }

  function handleSubmit(formData: FormData) {
    // Inject controlled values into FormData
    formData.set("topic_id", topicId);
    formData.set("correct_choice", correctChoice);
    formData.set("difficulty", difficulty);
    formData.set("status", status);
    formData.set("is_premium", String(questionIsPremium));

    startTransition(async () => {
      const result = question
        ? await updateQuestion(question.id, formData)
        : await createQuestion(formData);

      if (result.success) {
        toast.success(question ? "Question updated." : "Question created.");
        router.push("/admin/questions");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Subtest + Topic */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Subtest</label>
            <select
              value={subtestId}
              onChange={handleSubtestChange}
              className={inputCls}
            >
              {subtests.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Topic *</label>
            <select
              name="topic_id"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Select topic…</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Question text */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className={labelCls}>Question text *</label>
            <textarea
              name="question_text"
              required
              rows={4}
              defaultValue={question?.question_text}
              placeholder="Enter the question…"
              className={cn(inputCls, "resize-y")}
            />
          </div>
          <div>
            <label className={labelCls}>Image URL (optional)</label>
            <input
              type="url"
              name="image_url"
              defaultValue={question?.image_url ?? ""}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
        </CardContent>
      </Card>

      {/* Choices */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className={labelCls}>Answer choices *</p>
          {(["a", "b", "c", "d"] as Choice[]).map((key) => (
            <div key={key} className="flex items-start gap-3">
              <label className="flex items-center gap-2 shrink-0 mt-2">
                <input
                  type="radio"
                  name="_correct_choice_display"
                  checked={correctChoice === key}
                  onChange={() => setCorrectChoice(key)}
                  className="accent-primary"
                />
                <span className="text-xs font-bold uppercase w-4">{key}</span>
              </label>
              <input
                type="text"
                name={`choice_${key}`}
                required
                defaultValue={
                  question?.[`choice_${key}` as keyof QuestionData] as string
                }
                placeholder={`Choice ${key.toUpperCase()}…`}
                className={cn(inputCls, "flex-1")}
              />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Select the radio button next to the correct answer.
          </p>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4">
          <label className={labelCls}>Explanation *</label>
          <textarea
            name="explanation"
            required
            rows={3}
            defaultValue={question?.explanation}
            placeholder="Explain the correct answer…"
            className={cn(inputCls, "resize-y")}
          />
        </CardContent>
      </Card>

      {/* Difficulty + Status */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={inputCls}
            >
              <option value="1">1 — Easy</option>
              <option value="2">2 — Medium</option>
              <option value="3">3 — Hard</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuestionStatus)}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Access</label>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={questionIsPremium}
                onChange={(e) => setQuestionIsPremium(e.target.checked)}
                className="accent-primary h-4 w-4"
              />
              <span className="text-sm">Premium only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-xl flex-1 justify-center"
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending || !topicId}
          className={cn(
            buttonVariants(),
            "rounded-xl flex-1 justify-center gap-2",
            (pending || !topicId) && "opacity-60 cursor-not-allowed"
          )}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {question ? "Save Changes" : "Create Question"}
        </button>
      </div>
    </form>
  );
}
