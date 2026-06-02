"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function setWeeklyGoal(goal: number | null): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { error } = await supabase
      .from("user_profiles")
      .update({ weekly_goal: goal })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$/;

export async function updateUsername(
  username: string
): Promise<{ error: "taken" | "invalid" } | void> {
  if (!USERNAME_REGEX.test(username)) return { error: "invalid" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { error } = await supabase
      .from("user_profiles")
      .update({ username })
      .eq("id", user.id);

    if (error?.code === "23505") return { error: "taken" };
    if (error) throw new Error(error.message);

    revalidatePath("/settings");
    revalidatePath("/leaderboard");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    throw err;
  }
}
