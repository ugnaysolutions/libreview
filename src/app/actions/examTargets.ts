"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertExamTarget(examType: string, examDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("user_exam_targets").upsert(
    { user_id: user.id, exam_type: examType, exam_date: examDate },
    { onConflict: "user_id,exam_type" }
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { error: null };
}

export async function deleteExamTarget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_exam_targets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { error: null };
}
