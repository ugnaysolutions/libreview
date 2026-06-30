import { createClient } from "@/lib/supabase/server";
import { ExamConfigManager } from "@/components/admin/ExamConfigManager";

export default async function AdminSchedulePage() {
  const supabase = await createClient();

  const [{ data: configs }, { data: universities }] = await Promise.all([
    supabase
      .from("exam_configs")
      .select("id, slug, name, full_name, university_id, color, display_order, is_active, universities(name)")
      .order("display_order", { ascending: true, nullsFirst: false }),
    supabase
      .from("universities")
      .select("id, name")
      .order("display_order", { ascending: true }),
  ]);

  return (
    <ExamConfigManager
      configs={(configs ?? []) as unknown as Parameters<typeof ExamConfigManager>[0]["configs"]}
      universities={universities ?? []}
    />
  );
}
