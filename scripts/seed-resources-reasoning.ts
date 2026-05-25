/**
 * Adds the "Abstract Reasoning" topic to the Reasoning subtest (if missing),
 * then seeds its YouTube resources.
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-reasoning.ts
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

const TOPICS_AND_RESOURCES = [
  {
    topic: {
      name: "Abstract Reasoning",
      slug: "abstract-reasoning",
      description: "Identifying patterns, sequences, and relationships in non-verbal, visual stimuli.",
      display_order: 6,
    },
    resources: [
      {
        title: "Abstract Reasoning",
        description:
          "Introduction to abstract reasoning: identifying visual patterns, sequences, and logical rules applied to shapes and figures.",
        url: "https://www.youtube.com/watch?v=oOdQYmW1JFc",
      },
    ],
  },
];

async function main() {
  console.log("Seeding Reasoning resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "reasoning")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find reasoning subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const { topic, resources } of TOPICS_AND_RESOURCES) {
    const { data: topicRow, error: topicErr } = await supabase
      .from("topics")
      .upsert(
        { ...topic, subtest_id: subtest.id },
        { onConflict: "subtest_id,slug" }
      )
      .select("id, name")
      .single();
    if (topicErr || !topicRow) {
      throw new Error(`Could not upsert topic "${topic.slug}": ${topicErr?.message}`);
    }

    const rows = resources.map((r, i) => ({
      topic_id: topicRow.id,
      title: r.title,
      description: r.description,
      resource_type: "youtube" as const,
      url: r.url,
      is_published: true,
      display_order: i + 1,
    }));

    const { error: insertErr } = await supabase.from("resources").insert(rows);
    if (insertErr) {
      throw new Error(`Resources for "${topicRow.name}": ${insertErr.message}`);
    }

    console.log(`  ✓ ${topicRow.name}: ${rows.length} resources`);
    total += rows.length;
  }

  console.log(`\n✅  Done! Inserted ${total} resources.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
