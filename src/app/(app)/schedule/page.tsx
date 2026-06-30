import { createClient } from "@/lib/supabase/server";
import { ScheduleClient } from "./ScheduleClient";
import type { MilestoneCardData } from "@/components/schedule/MilestoneCard";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = await createClient();

  const [{ data: configs }, { data: milestones }] = await Promise.all([
    supabase
      .from("exam_configs")
      .select("id, slug, name, color")
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false }),

    supabase
      .from("exam_schedules")
      .select(
        "id, milestone_type, milestone_label, scheduled_date, academic_year, notes, is_confirmed, source_url, exam_configs!inner(name, slug, color, is_active)"
      )
      .order("scheduled_date", { ascending: true }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  // Supabase returns joined rows as single objects; cast through unknown to satisfy types
  const all = (milestones ?? []) as unknown as MilestoneCardData[];

  // Filter to only active exams
  const activeSlugs = new Set((configs ?? []).map((c) => c.slug));
  const filtered = all.filter((m) => activeSlugs.has(m.exam_configs.slug));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Exam Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Key milestones for college entrance exams in the Philippines.
        </p>
      </div>

      <ScheduleClient
        milestones={filtered}
        examConfigs={configs ?? []}
        today={today}
      />
    </div>
  );
}
