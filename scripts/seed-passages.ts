/**
 * Example seed script for passage-grouped questions.
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-passages.ts
 *
 * Adjust topicSlug and passage/question content before running.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Find the topic you want to link the passage to
  const topicSlug = "reading-main-idea"; // change to actual slug
  const { data: topic, error: topicErr } = await supabase
    .from("topics")
    .select("id")
    .eq("slug", topicSlug)
    .single();

  if (topicErr || !topic) {
    console.error("Topic not found:", topicSlug, topicErr?.message);
    process.exit(1);
  }

  // 2. Insert the passage
  const { data: passage, error: passageErr } = await supabase
    .from("passages")
    .insert({
      topic_id: topic.id,
      content: `The barangay captain stood at the podium and addressed the crowd gathered in the plaza.
"We have received funding for a new health center," she announced. "Construction will begin next month."
The residents applauded, relieved that their years of petitioning had finally yielded results.`,
      image_url: null,
    })
    .select("id")
    .single();

  if (passageErr || !passage) {
    console.error("Failed to insert passage:", passageErr?.message);
    process.exit(1);
  }

  console.log("Inserted passage:", passage.id);

  // 3. Insert 2–3 questions linked to the passage
  const questions = [
    {
      topic_id: topic.id,
      passage_id: passage.id,
      question_text: "What was the main announcement made by the barangay captain?",
      choice_a: "A new school would be built",
      choice_b: "A new health center would be constructed",
      choice_c: "The plaza would be renovated",
      choice_d: "Construction on roads would begin",
      correct_choice: "b",
      explanation: "The captain explicitly announced funding for a new health center.",
      difficulty: 1,
      status: "approved",
    },
    {
      topic_id: topic.id,
      passage_id: passage.id,
      question_text: "What can be inferred about the residents' earlier actions?",
      choice_a: "They had organized protests",
      choice_b: "They had submitted formal petitions",
      choice_c: "They had voted in a local election",
      choice_d: "They had donated money for the project",
      correct_choice: "b",
      explanation: "The phrase 'years of petitioning' indicates they had submitted formal petitions.",
      difficulty: 2,
      status: "approved",
    },
  ];

  const { error: questionsErr } = await supabase
    .from("questions")
    .insert(questions);

  if (questionsErr) {
    console.error("Failed to insert questions:", questionsErr.message);
    process.exit(1);
  }

  console.log(`Inserted ${questions.length} passage-linked questions.`);
}

main();
