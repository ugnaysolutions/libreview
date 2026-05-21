import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ResourcesSubtestPage({
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

  const { data: subtestData } = await supabase
    .from("subtests")
    .select(
      "id, name, slug, topics(id, name, slug, display_order, resources(id, is_published))"
    )
    .eq("slug", subtestSlug)
    .single();

  if (!subtestData) notFound();

  const topics = (
    subtestData.topics as unknown as {
      id: string;
      name: string;
      slug: string;
      display_order: number | null;
      resources: { id: string; is_published: boolean }[];
    }[]
  )
    .map((t) => ({
      ...t,
      resourceCount: t.resources.filter((r) => r.is_published).length,
    }))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/resources"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {subtestData.name}
          </h1>
          <p className="text-sm text-muted-foreground">{topics.length} topics</p>
        </div>
      </div>

      <div className="space-y-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/resources/${subtestSlug}/${topic.slug}`}
          >
            <Card className="rounded-2xl border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {topic.name}
                  </p>
                </div>
                {topic.resourceCount === 0 ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] shrink-0 whitespace-nowrap"
                  >
                    No resources
                  </Badge>
                ) : (
                  <Badge className="text-[10px] shrink-0 whitespace-nowrap bg-primary/10 text-primary border-primary/20">
                    {topic.resourceCount} resource{topic.resourceCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
