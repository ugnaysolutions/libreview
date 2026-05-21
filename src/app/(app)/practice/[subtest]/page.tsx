import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccuracyRing } from "@/components/ui/AccuracyRing";

export default async function SubtestPage({
  params,
}: {
  params: Promise<{ subtest: string }>;
}) {
  const { subtest: subtestSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subtestRes, progressRes] = await Promise.all([
    supabase
      .from("subtests")
      .select(
        "id, name, slug, topics(id, name, slug, description, display_order)"
      )
      .eq("slug", subtestSlug)
      .single(),
    supabase
      .from("user_topic_progress")
      .select("topic_id, accuracy_percentage, total_attempts")
      .eq("user_id", user.id),
  ]);

  if (!subtestRes.data) notFound();

  const subtest = subtestRes.data;
  const progress = progressRes.data ?? [];
  const progressMap = new Map(progress.map((p) => [p.topic_id, p]));

  const topics = (
    subtest.topics as unknown as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      display_order: number | null;
    }[]
  ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/practice"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {subtest.name}
          </h1>
          <p className="text-sm text-muted-foreground">{topics.length} topics</p>
        </div>
      </div>

      <div className="space-y-2">
        {topics.map((topic) => {
          const p = progressMap.get(topic.id);
          const accuracy = p ? Math.round(Number(p.accuracy_percentage)) : 0;
          const hasStarted = p && p.total_attempts > 0;

          return (
            <Link
              key={topic.id}
              href={`/practice/${subtestSlug}/${topic.slug}`}
            >
              <Card className="rounded-2xl border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <AccuracyRing accuracy={accuracy} size={52} strokeWidth={5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {topic.name}
                    </p>
                    {topic.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  {!hasStarted ? (
                    <Badge
                      variant="secondary"
                      className="text-[10px] shrink-0 whitespace-nowrap"
                    >
                      Not started
                    </Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {p.total_attempts} ans.
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
