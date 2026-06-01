import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CsvImportForm } from "@/components/admin/CsvImportForm";

export default async function AdminImportPage() {
  const supabase = await createClient();

  const { data: topics } = await supabase
    .from("topics")
    .select("slug")
    .order("slug");

  const topicSlugs = (topics ?? []).map((t) => t.slug);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/questions"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Questions
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">Bulk Import</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload a CSV file to import multiple questions at once. All imported questions are saved as <strong>drafts</strong> for review.
        </p>
      </div>

      <CsvImportForm topicSlugs={topicSlugs} />
    </div>
  );
}
