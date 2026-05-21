import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil, PlayCircle, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { DeleteResourceButton } from "@/components/admin/DeleteResourceButton";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ subtest?: string; topic?: string }>;
}) {
  const { subtest, topic } = await searchParams;
  const supabase = await createClient();

  const { data: subtests } = await supabase
    .from("subtests")
    .select("id, name, slug, display_order, topics(id, name)")
    .order("display_order");

  let query = supabase
    .from("resources")
    .select(
      "id, title, description, resource_type, url, is_published, display_order, topics(name, subtests(name))"
    )
    .order("display_order", { ascending: true });

  if (topic) {
    query = query.eq("topic_id", topic);
  } else if (subtest) {
    const sub = (subtests ?? []).find((s) => s.id === subtest);
    if (sub) {
      const topicIds = (sub.topics as { id: string }[]).map((t) => t.id);
      if (topicIds.length > 0) query = query.in("topic_id", topicIds);
    }
  }

  const { data: resources } = await query;
  const currentSubtest = subtest ?? "";
  const currentTopics =
    (subtests ?? []).find((s) => s.id === currentSubtest)?.topics ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            YouTube videos and articles per topic
          </p>
        </div>
        <Link
          href="/admin/resources/new"
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form method="get" action="/admin/resources">
          <select
            name="subtest"
            defaultValue={subtest ?? ""}
            onChange={(e) =>
              (e.currentTarget.form as HTMLFormElement).requestSubmit()
            }
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="">All subtests</option>
            {(subtests ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </form>

        {currentSubtest && (currentTopics as { id: string }[]).length > 0 && (
          <form method="get" action="/admin/resources">
            <input type="hidden" name="subtest" value={currentSubtest} />
            <select
              name="topic"
              defaultValue={topic ?? ""}
              onChange={(e) =>
                (e.currentTarget.form as HTMLFormElement).requestSubmit()
              }
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All topics</option>
              {(currentTopics as { id: string; name: string }[]).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </form>
        )}
      </div>

      {/* Resource list */}
      {!resources || resources.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No resources found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => {
            const topic = r.topics as unknown as {
              name: string;
              subtests: { name: string } | null;
            } | null;
            return (
              <Card key={r.id} className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {r.resource_type === "youtube" ? (
                      <PlayCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic?.subtests?.name} · {topic?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <PublishToggle id={r.id} published={r.is_published} />
                    <Link
                      href={`/admin/resources/${r.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "rounded-lg"
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteResourceButton id={r.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
