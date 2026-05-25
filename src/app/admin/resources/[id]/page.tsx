import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { SUBTESTS } from "@/lib/constants";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [resourceRes, subtestsRes] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id, topic_id, title, description, resource_type, url, is_published, display_order"
      )
      .eq("id", id)
      .single(),
    supabase
      .from("subtests")
      .select("id, name, slug, display_order, topics(id, name, display_order)")
      .in("slug", SUBTESTS.map((s) => s.slug))
      .order("display_order"),
  ]);

  if (!resourceRes.data) notFound();

  const enriched = (subtestsRes.data ?? []).map((s) => ({
    ...s,
    topics:
      (s.topics as unknown as {
        id: string;
        name: string;
        display_order: number | null;
      }[]) ?? [],
  }));

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/admin/resources" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold font-heading text-foreground">
          Edit Resource
        </h1>
      </div>
      <ResourceForm subtests={enriched} resource={resourceRes.data} />
    </div>
  );
}
