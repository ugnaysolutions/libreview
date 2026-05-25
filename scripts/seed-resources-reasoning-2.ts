/**
 * Seeds additional YouTube resources for the Reasoning subtest:
 *   Logic & Critical Thinking (1), Numerical (1), Visual Pattern (2), Verbal (1)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-reasoning-2.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type Resource = { title: string; description: string; url: string };

const REASONING_RESOURCES: Record<string, Resource[]> = {
  // ── Logic & Critical Thinking ─────────────────────────────────────────────
  logic: [
    {
      title: "Logical Reasoning",
      description:
        "Step-by-step approach to solving logical reasoning problems using deductive and inductive methods.",
      url: "https://www.youtube.com/watch?v=EFNFo1sGCCc&list=PLzahD1KhmHzoQR3-4nS1RJawKYoQID9DB",
    },
  ],

  // ── Numerical Reasoning ───────────────────────────────────────────────────
  numerical: [
    {
      title: "Number Series",
      description:
        "Identify the pattern in number sequences and find the missing or next term.",
      url: "https://www.youtube.com/watch?v=QhW2TZNeBLk",
    },
  ],

  // ── Visual and Spatial Patterns ───────────────────────────────────────────
  "visual-pattern": [
    {
      title: "Abstract Reasoning",
      description:
        "Practice identifying patterns and rules applied to abstract visual shapes and matrices.",
      url: "https://www.youtube.com/watch?v=USBha7DFElg&list=PLzahD1KhmHzqq_hnn0sHDQON6ju2CFO7L",
    },
    {
      title: "Spatial Reasoning",
      description:
        "Visualize and mentally manipulate 2D and 3D shapes to solve spatial reasoning problems.",
      url: "https://www.youtube.com/watch?v=iZn4Dj331fI",
    },
  ],

  // ── Verbal Reasoning ──────────────────────────────────────────────────────
  verbal: [
    {
      title: "Verbal Reasoning",
      description:
        "Analyze written passages, identify logical relationships, and draw valid conclusions.",
      url: "https://www.youtube.com/watch?v=LSbGu8sCf6E",
    },
  ],
};

async function main() {
  console.log("Seeding additional Reasoning resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "reasoning")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find reasoning subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const [topicSlug, resources] of Object.entries(REASONING_RESOURCES)) {
    const { data: topic, error: topicErr } = await supabase
      .from("topics")
      .select("id, name")
      .eq("subtest_id", subtest.id)
      .eq("slug", topicSlug)
      .single();
    if (topicErr || !topic) {
      throw new Error(`Could not find topic "${topicSlug}": ${topicErr?.message}`);
    }

    const rows = resources.map((r, i) => ({
      topic_id: topic.id,
      title: r.title,
      description: r.description,
      resource_type: "youtube" as const,
      url: r.url,
      is_published: true,
      display_order: i + 1,
    }));

    const { error: insertErr } = await supabase.from("resources").insert(rows);
    if (insertErr) {
      throw new Error(`Resources for "${topic.name}": ${insertErr.message}`);
    }

    console.log(`  ✓ ${topic.name}: ${rows.length} resources`);
    total += rows.length;
  }

  console.log(`\n✅  Done! Inserted ${total} resources across ${Object.keys(REASONING_RESOURCES).length} topics.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
