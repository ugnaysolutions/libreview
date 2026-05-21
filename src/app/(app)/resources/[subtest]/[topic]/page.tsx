import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default async function ResourcesTopicPage({
  params,
}: {
  params: Promise<{ subtest: string; topic: string }>;
}) {
  const { subtest: subtestSlug, topic: topicSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [subtestRes, topicRes] = await Promise.all([
    supabase
      .from("subtests")
      .select("id, name, slug")
      .eq("slug", subtestSlug)
      .single(),
    supabase
      .from("topics")
      .select(
        "id, name, slug, resources(id, title, description, resource_type, url, display_order)"
      )
      .eq("slug", topicSlug)
      .single(),
  ]);

  if (!subtestRes.data || !topicRes.data) notFound();

  const subtest = subtestRes.data;
  const topic = topicRes.data;

  const resources = (
    topic.resources as unknown as {
      id: string;
      title: string;
      description: string | null;
      resource_type: string;
      url: string;
      display_order: number | null;
    }[]
  ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const published = resources; // RLS already filters to is_published

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/resources/${subtestSlug}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">{subtest.name}</p>
          <h1 className="text-xl font-bold font-heading text-foreground leading-tight">
            {topic.name}
          </h1>
        </div>
      </div>

      {published.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No resources yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Check back later — we&apos;re adding videos and articles for this topic.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {published.map((resource) => {
            const isYoutube = resource.resource_type === "youtube";
            const youtubeId = isYoutube ? extractYoutubeId(resource.url) : null;

            return (
              <Card key={resource.id} className="rounded-2xl border-border shadow-sm overflow-hidden">
                {isYoutube && youtubeId && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video bg-muted"
                  >
                    <Image
                      src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 672px) 100vw, 672px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <PlayCircle className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </a>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {!isYoutube && (
                      <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-xl gap-1.5 w-full"
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isYoutube ? "Watch on YouTube" : "Read Article"}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
