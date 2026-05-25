"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createResource, updateResource } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
interface ResourceData {
  id: string;
  topic_id: string;
  title: string;
  description: string | null;
  resource_type: "youtube" | "article";
  url: string;
  is_published: boolean;
  display_order: number | null;
}

interface Props {
  subtests: Subtest[];
  resource?: ResourceData;
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelCls = "block text-xs font-semibold text-foreground mb-1";

export function ResourceForm({ subtests, resource }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const findInitialSubtest = () => {
    if (!resource) return subtests[0]?.id ?? "";
    for (const st of subtests) {
      if (st.topics.find((t) => t.id === resource.topic_id)) return st.id;
    }
    return subtests[0]?.id ?? "";
  };

  const [subtestId, setSubtestId] = useState(findInitialSubtest);
  const [topicId, setTopicId] = useState(resource?.topic_id ?? "");
  const [resourceType, setResourceType] = useState<"youtube" | "article">(
    resource?.resource_type ?? "youtube"
  );
  const [isPublished, setIsPublished] = useState(
    resource?.is_published ?? false
  );

  const topics = (
    subtests.find((s) => s.id === subtestId)?.topics ?? []
  ).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  function handleSubtestChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubtestId(e.target.value);
    setTopicId(
      subtests.find((s) => s.id === e.target.value)?.topics[0]?.id ?? ""
    );
  }

  function handleSubmit(formData: FormData) {
    formData.set("topic_id", topicId);
    formData.set("resource_type", resourceType);
    formData.set("is_published", String(isPublished));

    startTransition(async () => {
      const result = resource
        ? await updateResource(resource.id, formData)
        : await createResource(formData);

      if (result.success) {
        toast.success(resource ? "Resource updated." : "Resource created.");
        router.push("/admin/resources");
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

      {/* Title + Description */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={resource?.title}
              placeholder="Resource title…"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Description (optional)</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={resource?.description ?? ""}
              placeholder="Brief description…"
              className={cn(inputCls, "resize-y")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Type + URL */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div>
            <label className={labelCls}>Type</label>
            <select
              value={resourceType}
              onChange={(e) =>
                setResourceType(e.target.value as "youtube" | "article")
              }
              className={inputCls}
            >
              <option value="youtube">YouTube</option>
              <option value="article">Article</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>URL *</label>
            <input
              type="url"
              name="url"
              required
              defaultValue={resource?.url}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
        </CardContent>
      </Card>

      {/* Published + Order */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 grid grid-cols-2 gap-4 items-end">
          <div>
            <label className={labelCls}>Display order</label>
            <input
              type="number"
              name="display_order"
              min={0}
              defaultValue={resource?.display_order ?? ""}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Published
              </span>
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
          {resource ? "Save Changes" : "Create Resource"}
        </button>
      </div>
    </form>
  );
}
