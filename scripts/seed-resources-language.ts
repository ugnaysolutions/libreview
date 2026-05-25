/**
 * Seeds 23 YouTube resources for the Language Proficiency subtest across 3 topics:
 *   Grammar and Usage (13), Sentence Correction (5), Filipino Grammar and Language (5)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-language.ts
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

const LANGUAGE_RESOURCES: Record<string, Resource[]> = {
  // ── Grammar and Usage (Parts of Speech + Agreement + Phrases & Clauses) ──
  "grammar-usage": [
    {
      title: "Nouns",
      description:
        "Identify and classify common, proper, abstract, and collective nouns in sentences.",
      url: "https://www.youtube.com/watch?v=6wz2Daf1n8c&pp=ygUFTm91bnM%3D",
    },
    {
      title: "Pronouns",
      description:
        "Types of pronouns (personal, reflexive, relative, demonstrative) and how to use them correctly.",
      url: "https://www.youtube.com/watch?v=acqD-uZGMWc&pp=ygUbcHJvbm91bnMgaW4gZW5nbGlzaCBncmFtbWFy",
    },
    {
      title: "Verbs",
      description:
        "Action, linking, and helping verbs; verb tenses and conjugation rules.",
      url: "https://www.youtube.com/watch?v=82jtl7FAPsQ&pp=ygUFVmVyYnM%3D",
    },
    {
      title: "Adjectives",
      description:
        "Descriptive, comparative, and superlative adjectives and how they modify nouns.",
      url: "https://www.youtube.com/watch?v=hifcUYaACzI&pp=ygUKQWRqZWN0aXZlcw%3D%3D",
    },
    {
      title: "Adverbs",
      description:
        "How adverbs modify verbs, adjectives, and other adverbs; types and placement rules.",
      url: "https://www.youtube.com/watch?v=94aFcx6oliY&pp=ygUHQWR2ZXJic9IHCQnFCgGHKiGM7w%3D%3D",
    },
    {
      title: "Prepositions",
      description:
        "Common prepositions of time, place, and direction and how to form prepositional phrases.",
      url: "https://www.youtube.com/watch?v=XyQQMj0152Q&pp=ygUMUHJlcG9zaXRpb25z",
    },
    {
      title: "Conjunctions",
      description:
        "Coordinating, subordinating, and correlative conjunctions and how they join clauses.",
      url: "https://www.youtube.com/watch?v=3qbfcHiUrcI&pp=ygUMQ29uanVuY3Rpb25z0gcJCcUKAYcqIYzv",
    },
    {
      title: "Interjections",
      description:
        "Expressions of emotion and how interjections function in sentences.",
      url: "https://www.youtube.com/watch?v=7zDPo2OGRrY&pp=ygUNaW50ZXJqZWN0aW9ucw%3D%3D",
    },
    {
      title: "Determiners",
      description:
        "Articles, quantifiers, and demonstratives that introduce and specify nouns.",
      url: "https://www.youtube.com/watch?v=WwYEeRzPnsY&pp=ygULRGV0ZXJtaW5lcnM%3D",
    },
    {
      title: "Subject-Verb Agreement",
      description:
        "Rules for matching singular and plural subjects with the correct verb form.",
      url: "https://www.youtube.com/watch?v=LfJPA8GwTdk&pp=ygUWU3ViamVjdC1WZXJiIEFncmVlbWVudA%3D%3D",
    },
    {
      title: "Pronoun-Antecedent Agreement",
      description:
        "Ensuring pronouns match their antecedents in number, gender, and person.",
      url: "https://www.youtube.com/watch?v=A9zHVXmRqiA&pp=ygUcUHJvbm91bi1BbnRlY2VkZW50IEFncmVlbWVudA%3D%3D",
    },
    {
      title: "Main Parts of a Sentence",
      description:
        "Subject, predicate, objects, and complements that make up a complete sentence.",
      url: "https://www.youtube.com/watch?v=Dp0jrAOUZxM&pp=ygUXTWFpbiBQYXJ0IG9mIGEgU2VudGVuY2U%3D",
    },
    {
      title: "Basic Sentence Structure",
      description:
        "Simple, compound, complex, and compound-complex sentence patterns explained.",
      url: "https://www.youtube.com/watch?v=gKGpjcPjS18&t=193s&pp=ygUYQmFzaWMgU2VudGVuY2UgU3RydWN0dXJl",
    },
  ],

  // ── Sentence Correction (Error Identification) ────────────────────────────
  "sentence-correction": [
    {
      title: "Parallelism",
      description:
        "Maintaining consistent grammatical structure in lists, comparisons, and paired ideas.",
      url: "https://www.youtube.com/watch?v=fojkyh3qfHI&pp=ygULUGFyYWxsZWxpc20%3D",
    },
    {
      title: "Redundancy",
      description:
        "Identifying and eliminating unnecessary repetition of words or ideas in sentences.",
      url: "https://www.youtube.com/shorts/euyF3-7ehw0",
    },
    {
      title: "Double Negatives",
      description:
        "Recognizing and correcting the use of two negatives in a single clause.",
      url: "https://www.youtube.com/watch?v=3u405eiJiEU&pp=ygUQRG91YmxlIE5lZ2F0aXZlcw%3D%3D",
    },
    {
      title: "Misplaced Modifiers",
      description:
        "Identifying modifiers placed too far from the word they describe and correcting them.",
      url: "https://www.youtube.com/watch?v=Qu5pvwL9u4Q&pp=ygUTTWlzcGxhY2VkIE1vZGlmaWVycw%3D%3D",
    },
    {
      title: "Special Agreements",
      description:
        "Subject-verb agreement in special cases: collective nouns, indefinite pronouns, and inverted sentences.",
      url: "https://www.youtube.com/watch?v=VkNM8O3SxFQ&pp=ygUSU3BlY2lhbCBBZ3JlZW1lbnRz",
    },
  ],

  // ── Filipino Grammar and Language ─────────────────────────────────────────
  "filipino-grammar": [
    {
      title: "Iba't Ibang Uri ng Panitikan",
      description:
        "Suriin ang iba't ibang uri ng panitikang Filipino: maikling kwento, tula, dulaan, at sanaysay.",
      url: "https://www.youtube.com/watch?v=ryz4XzqhSy0&pp=ygUcSWJhJ3QgSWJhbmcgVXJpIG5nIFBhbml0aWthbg%3D%3D",
    },
    {
      title: "Bahagi ng Pananalita",
      description:
        "Mga uri ng salita sa Filipino: pangngalan, panghalip, pandiwa, pang-uri, at iba pa.",
      url: "https://www.youtube.com/watch?v=MbpLuyNxr7k&list=PLfG2kNmC2lCHbcBdvW0mFl8EljikiPvW1",
    },
    {
      title: "Paksa ng Talata",
      description:
        "Paano makilala ang pangunahing paksa ng isang talata at ang mga sumusuportang detalye.",
      url: "https://www.youtube.com/watch?v=JSF8dldPwbQ&pp=ygUPUGFrc2EgbmcgVGFsYXRh",
    },
    {
      title: "Tayutay",
      description:
        "Mga uri ng tayutay: simile, metapora, personipikasyon, at iba pang mga pigura ng pananalita.",
      url: "https://www.youtube.com/watch?v=q2saMGiDvGk&pp=ygUHVGF5dXRheQ%3D%3D",
    },
    {
      title: "Sawikain o Idyoma",
      description:
        "Mga kahulugan ng mga kilalang sawikain at idyomang Filipino at paano gamitin ang mga ito.",
      url: "https://www.youtube.com/watch?v=1YvDYVIK694&pp=ygURU2F3aWthaW4gbyBJZHlvbWE%3D",
    },
  ],
};

async function main() {
  console.log("Seeding Language Proficiency resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "language-proficiency")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find language-proficiency subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const [topicSlug, resources] of Object.entries(LANGUAGE_RESOURCES)) {
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

  console.log(`\n✅  Done! Inserted ${total} resources across ${Object.keys(LANGUAGE_RESOURCES).length} topics.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
