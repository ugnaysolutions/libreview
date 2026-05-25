import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookMarked, FlaskConical, Calculator, Brain, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SUBTEST_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "language-proficiency": {
    icon: <BookOpen className="h-5 w-5 text-violet-500" />,
    color: "bg-violet-50",
  },
  "reading-comprehension": {
    icon: <BookMarked className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-50",
  },
  science: {
    icon: <FlaskConical className="h-5 w-5 text-green-500" />,
    color: "bg-green-50",
  },
  mathematics: {
    icon: <Calculator className="h-5 w-5 text-amber-500" />,
    color: "bg-amber-50",
  },
  reasoning: {
    icon: <Brain className="h-5 w-5 text-rose-500" />,
    color: "bg-rose-50",
  },
};

export default async function ResourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subtests } = await supabase
    .from("subtests")
    .select(
      "id, name, slug, display_order, topics(id, resources(id, is_published))"
    )
    .order("display_order");

  const subtestData = (subtests ?? []).map((s) => {
    const topics = (
      s.topics as unknown as {
        id: string;
        resources: { id: string; is_published: boolean }[];
      }[]
    ) ?? [];
    const resourceCount = topics.reduce(
      (sum, t) =>
        sum + t.resources.filter((r) => r.is_published).length,
      0
    );
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      topicCount: topics.length,
      resourceCount,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Resources
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Videos and articles to help you review
        </p>
      </div>

      <div className="space-y-3">
        {subtestData.map((subtest) => {
          const meta = SUBTEST_META[subtest.slug];
          if (!meta) return null;
          return (
            <Link key={subtest.id} href={`/resources/${subtest.slug}`}>
              <Card className="rounded-2xl border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">
                      {subtest.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subtest.topicCount} topics ·{" "}
                      {subtest.resourceCount === 0
                        ? "No resources yet"
                        : `${subtest.resourceCount} resource${subtest.resourceCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
