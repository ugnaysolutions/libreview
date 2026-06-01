import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag } from "next/cache";

export async function activatePremium(
  userId: string,
  expiresAt: Date,
  planType: "monthly" | "annual" = "monthly"
) {
  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({
      plan: "premium",
      plan_expires_at: expiresAt.toISOString(),
      plan_type: planType,
    })
    .eq("id", userId);

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "premium_activated",
    title: "Premium is active! ⚡",
    body: "All features are now unlocked. Good luck with your exam prep!",
    action_url: "/upgrade",
  });

  revalidateTag(`premium-${userId}`, "default");
}

export async function deactivatePremium(userId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({ plan: "free", plan_expires_at: null })
    .eq("id", userId);
  revalidateTag(`premium-${userId}`, "default");
}
