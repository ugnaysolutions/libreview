"use server";

import { createClient } from "@/lib/supabase/server";
import { isPremium } from "@/lib/plan";
import { revalidatePath } from "next/cache";

const FREE_BOOKMARK_LIMIT = 20;

export async function toggleBookmark(
  questionId: string
): Promise<{ bookmarked: boolean; limitReached?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("bookmarked_questions")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .single();

  if (existing) {
    await supabase.from("bookmarked_questions").delete().eq("id", existing.id);
    revalidatePath("/bookmarks");
    return { bookmarked: false };
  }

  // Enforce free limit
  const premium = await isPremium(user.id);
  if (!premium) {
    const { count } = await supabase
      .from("bookmarked_questions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) >= FREE_BOOKMARK_LIMIT) {
      return { bookmarked: false, limitReached: true };
    }
  }

  await supabase
    .from("bookmarked_questions")
    .insert({ user_id: user.id, question_id: questionId });
  revalidatePath("/bookmarks");
  return { bookmarked: true };
}
