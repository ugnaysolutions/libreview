import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionTable } from "@/components/admin/QuestionTable";
import { AutoSubmitSelect } from "@/components/admin/AutoSubmitSelect";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    subtest?: string;
    topic?: string;
  }>;
}) {
  const { status, subtest, topic } = await searchParams;
  const supabase = await createClient();

  // Fetch subtests for filter UI
  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, name, slug, display_order, topics(id, name)")
    .order("display_order");

  // Build question query
  let query = supabase
    .from("questions")
    .select(
      "id, question_text, correct_choice, difficulty, status, created_at, topics(name, subtests(name))"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (topic) {
    query = query.eq("topic_id", topic);
  } else if (subtest) {
    const sub = (subtests ?? []).find((s) => s.id === subtest);
    if (sub) {
      const topicIds = (sub.topics as { id: string }[]).map((t) => t.id);
      if (topicIds.length > 0) query = query.in("topic_id", topicIds);
    }
  }

  const { data: questionsRaw } = await query;
  const questions = (questionsRaw ?? []).map((q) => ({
    ...q,
    topic: q.topics as unknown as {
      name: string;
      subtest: { name: string } | null;
    } | null,
  }));

  const currentSubtest = subtest ?? "";
  const currentTopics =
    (subtests ?? []).find((s) => s.id === currentSubtest)?.topics ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Questions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the question bank
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex rounded-xl overflow-hidden border border-border text-sm">
          {["all", "draft", "approved", "rejected"].map((s) => {
            const params = new URLSearchParams(
              [
                subtest ? ["subtest", subtest] : [],
                topic ? ["topic", topic] : [],
                s !== "all" ? ["status", s] : [],
              ]
                .filter((p) => p.length > 0)
                .map((p) => p as [string, string])
            );
            const isActive = (status ?? "all") === s;
            return (
              <Link
                key={s}
                href={`/admin/questions?${params.toString()}`}
                className={cn(
                  "px-3 py-1.5 capitalize transition-colors",
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                {s}
              </Link>
            );
          })}
        </div>

        {/* Subtest filter */}
        <form method="get" action="/admin/questions">
          {status && status !== "all" && (
            <input type="hidden" name="status" value={status} />
          )}
          <AutoSubmitSelect
            name="subtest"
            defaultValue={subtest ?? ""}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="">All subtests</option>
            {(subtests ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </AutoSubmitSelect>
        </form>

        {/* Topic filter (only when subtest is selected) */}
        {currentSubtest && currentTopics.length > 0 && (
          <form method="get" action="/admin/questions">
            {status && status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}
            <input type="hidden" name="subtest" value={currentSubtest} />
            <AutoSubmitSelect
              name="topic"
              defaultValue={topic ?? ""}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All topics</option>
              {(currentTopics as { id: string; name: string }[]).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </AutoSubmitSelect>
          </form>
        )}
      </div>

      <QuestionTable questions={questions} />
    </div>
  );
}
