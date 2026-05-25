/**
 * Seeds 6 YouTube resources for the Reading Comprehension subtest across 2 topics:
 *   Reading Materials (5), Fact vs Opinion (1)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-reading.ts
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

type Resource = {
  title: string;
  description: string;
  url: string;
};

const READING_RESOURCES: Record<string, Resource[]> = {
  // ── Reading Materials (genres) ────────────────────────────────────────────
  "reading-materials": [
    {
      title: "Poetry",
      description:
        "Elements of poetry: stanza, rhyme scheme, meter, tone, and common figures of speech.",
      url: "https://www.youtube.com/watch?v=ImBO35GznsY&pp=ygUGUG9ldHJ5",
    },
    {
      title: "Essays, Articles, Speeches",
      description:
        "Structure and purpose of expository writing: thesis, arguments, supporting evidence, and conclusion.",
      url: "https://www.youtube.com/watch?v=GauwoIz_nHI&pp=ygUkRXNzYXlzLCBBcnRpY2xlcywgU3BlZWNoZXMgc3RydWN0dXJl",
    },
    {
      title: "Short Stories",
      description:
        "Elements of fiction: plot, setting, character, conflict, theme, and point of view.",
      url: "https://www.youtube.com/watch?v=fG1AnmbW1hc&pp=ygUWd2hhdCBhcmUgU2hvcnQgU3Rvcmllcw%3D%3D",
    },
    {
      title: "Mythology",
      description:
        "Common myths from Philippine, Greek, Roman, and world traditions and their cultural significance.",
      url: "https://www.youtube.com/watch?v=HeX6CX5LEj0&pp=ygUTd2hhdCBpcyBhIG15dGhvbG9neQ%3D%3D",
    },
    {
      title: "Fable",
      description:
        "Short moral stories using animals or objects as characters; identifying the moral lesson.",
      url: "https://www.youtube.com/watch?v=afPUwPAy8sQ&pp=ygUPd2hhdCBpcyBhIEZhYmxl",
    },
  ],

  // ── Fact vs Opinion ────────────────────────────────────────────────────────
  "fact-vs-opinion": [
    {
      title: "Fact and Opinion",
      description:
        "Distinguishing statements of verifiable fact from personal opinions, beliefs, or judgments.",
      url: "https://www.youtube.com/watch?v=aGbhJ0aETYs&pp=ygUQRmFjdCBhbmQgT3Bpbmlvbg%3D%3D",
    },
  ],
};

async function main() {
  console.log("Seeding Reading Comprehension resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "reading-comprehension")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find reading-comprehension subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const [topicSlug, resources] of Object.entries(READING_RESOURCES)) {
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

  console.log(`\n✅  Done! Inserted ${total} resources across ${Object.keys(READING_RESOURCES).length} topics.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
