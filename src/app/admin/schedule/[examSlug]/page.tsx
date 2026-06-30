import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MilestoneManager } from "@/components/admin/MilestoneManager";

export default async function AdminExamMilestonesPage({
  params,
}: {
  params: Promise<{ examSlug: string }>;
}) {
  const { examSlug } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from("exam_configs")
    .select("id, slug, name, color")
    .eq("slug", examSlug)
    .single();

  if (!exam) notFound();

  const { data: milestones } = await supabase
    .from("exam_schedules")
    .select("id, exam_config_id, milestone_type, milestone_label, scheduled_date, date_end, academic_year, notes, is_confirmed, source_url")
    .eq("exam_config_id", exam.id)
    .order("scheduled_date", { ascending: true });

  return (
    <div className="space-y-5">
      <Link
        href="/admin/schedule"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Exams
      </Link>

      <MilestoneManager
        exam={exam}
        milestones={milestones ?? []}
      />
    </div>
  );
}
