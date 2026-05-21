import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default async function NewQuestionPage() {
  const supabase = await createClient();
  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, name, slug, display_order, topics(id, name, display_order)")
    .order("display_order");

  const enriched = (subtests ?? []).map((s) => ({
    ...s,
    topics: (s.topics as unknown as { id: string; name: string; display_order: number | null }[]) ?? [],
  }));

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/questions"
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold font-heading text-foreground">
          New Question
        </h1>
      </div>
      <QuestionForm subtests={enriched} />
    </div>
  );
}
