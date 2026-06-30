"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

// ── Exam Configs ──────────────────────────────────────────────────────────────

export async function upsertExamConfig(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const id = formData.get("id") as string | null;

    const payload = {
      slug: (formData.get("slug") as string).trim().toLowerCase(),
      name: (formData.get("name") as string).trim(),
      full_name: ((formData.get("full_name") as string) || "").trim() || null,
      university_id: (formData.get("university_id") as string) || null,
      color: (formData.get("color") as string) || "#0D9488",
      display_order: Number(formData.get("display_order")) || null,
      is_active: formData.get("is_active") === "true",
    };

    if (id) {
      const { error } = await supabase
        .from("exam_configs")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("exam_configs").insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteExamConfig(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("exam_configs").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function toggleExamConfigActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("exam_configs")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ── Exam Schedules ────────────────────────────────────────────────────────────

export async function upsertMilestone(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const id = formData.get("id") as string | null;

    const rawDateEnd = ((formData.get("date_end") as string) || "").trim();
    const rawExtraDates = (formData.getAll("extra_dates") as string[])
      .map((d) => d.trim())
      .filter(Boolean);
    const payload = {
      exam_config_id: formData.get("exam_config_id") as string,
      milestone_type: formData.get("milestone_type") as string,
      milestone_label: (formData.get("milestone_label") as string).trim(),
      scheduled_date: formData.get("scheduled_date") as string,
      date_end: rawDateEnd || null,
      extra_dates: rawExtraDates.length > 0 ? rawExtraDates : null,
      date_precision: (formData.get("date_precision") as string) || "exact",
      academic_year: (formData.get("academic_year") as string).trim(),
      notes: ((formData.get("notes") as string) || "").trim() || null,
      is_confirmed: formData.get("is_confirmed") === "true",
      source_url: ((formData.get("source_url") as string) || "").trim() || null,
    };

    if (id) {
      const { error } = await supabase
        .from("exam_schedules")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("exam_schedules").insert(payload);
      if (error) return { success: false, error: error.message };
    }

    const examSlug = formData.get("exam_slug") as string;
    revalidatePath(`/admin/schedule/${examSlug}`);
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteMilestone(id: string, examSlug: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("exam_schedules").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath(`/admin/schedule/${examSlug}`);
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
