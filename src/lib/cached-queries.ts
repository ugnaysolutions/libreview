import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const getCachedSubtestsWithResources = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("subtests")
      .select("id, name, slug, display_order, topics(id, resources(id, is_published))")
      .order("display_order");
    return data ?? [];
  },
  ["subtests-with-resources"],
  { revalidate: 86400, tags: ["subtests"] }
);

export const getCachedPracticeSubtests = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("subtests")
      .select("id, name, slug, display_order, topics(id)")
      .eq("exam_type", "upcat")
      .order("display_order");
    return data ?? [];
  },
  ["practice-subtests"],
  { revalidate: 86400, tags: ["subtests"] }
);
