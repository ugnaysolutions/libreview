import { createAdminClient } from "@/lib/supabase/admin";

export async function activatePremium(userId: string, expiresAt: Date) {
  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({
      plan: "premium",
      plan_expires_at: expiresAt.toISOString(),
    })
    .eq("id", userId);
}

export async function deactivatePremium(userId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("user_profiles")
    .update({ plan: "free", plan_expires_at: null })
    .eq("id", userId);
}
