"use server";

import { createClient } from "@/lib/supabase/server";
import { isPremium } from "@/lib/plan";
import { revalidatePath } from "next/cache";

const FREE_WISH_LIMIT = 3;

export async function submitWish(
  category: string,
  title: string,
  description: string
): Promise<{ success: boolean; limitReached?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const premium = await isPremium(user.id);
  if (!premium) {
    const { count } = await supabase
      .from("wishlist_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) >= FREE_WISH_LIMIT) {
      return { success: false, limitReached: true };
    }
  }

  const { error } = await supabase.from("wishlist_requests").insert({
    user_id: user.id,
    category,
    title: title.trim(),
    description: description.trim() || null,
  });

  if (error) throw error;
  revalidatePath("/wishlist");
  return { success: true };
}
