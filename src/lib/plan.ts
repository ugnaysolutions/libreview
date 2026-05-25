import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_PLAN } from "@/lib/constants";
import { unstable_cache } from "next/cache";

export function isPremium(userId: string): Promise<boolean> {
  return unstable_cache(
    async () => {
      // Must use admin client here — unstable_cache runs outside request
      // context so cookies() (used by createClient) is not available.
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("user_profiles")
        .select("plan, plan_expires_at")
        .eq("id", userId)
        .single();

      if (!data || data.plan !== "premium") return false;
      if (!data.plan_expires_at) return true;
      return new Date(data.plan_expires_at) > new Date();
    },
    ["is-premium", userId],
    { revalidate: 60, tags: [`premium-${userId}`] }
  )();
}

function todayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function canStartPractice(userId: string): Promise<boolean> {
  if (await isPremium(userId)) return true;

  const supabase = await createClient();
  const { start, end } = todayWindow();
  const { count } = await supabase
    .from("exam_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("session_type", "topic_practice")
    .neq("status", "abandoned")
    .gte("started_at", start)
    .lt("started_at", end);

  return (count ?? 0) < FREE_PLAN.dailyPracticeLimit;
}

export async function canStartMockExam(userId: string): Promise<boolean> {
  if (await isPremium(userId)) return true;

  const supabase = await createClient();
  const { start, end } = todayWindow();
  const { count } = await supabase
    .from("exam_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("session_type", "mock_exam")
    .neq("status", "abandoned")
    .gte("started_at", start)
    .lt("started_at", end);

  return (count ?? 0) < FREE_PLAN.dailyMockLimit;
}
