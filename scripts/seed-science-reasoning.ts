/**
 * Adds the "Scientific Reasoning & Data Interpretation" topic to Science.
 * 15 questions covering: graph interpretation, experimental analysis,
 * scientific method, and data reading.
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-science-reasoning.ts
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

type Q = {
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: 1 | 2 | 3;
};

const TOPIC = {
  name: "Scientific Reasoning & Data Interpretation",
  slug: "scientific-reasoning",
  description: "Graph reading, experimental design, scientific method, and data interpretation.",
  display_order: 5,
};

const QUESTIONS: Q[] = [
  // ── Graph Interpretation ───────────────────────────────────────────────
  {
    question_text:
      "A line graph shows plant height (cm) over 6 weeks. At week 1 the height is 3 cm, week 3 is 9 cm, and week 6 is 18 cm. Which statement best describes the growth trend?",
    choice_a: "Growth is decreasing over time.",
    choice_b: "Growth is constant — the plant adds 3 cm per week.",
    choice_c: "Growth is constant — the plant doubles every week.",
    choice_d: "Growth rate fluctuates with no clear pattern.",
    correct_choice: "b",
    explanation:
      "From week 1 to week 6 the plant gains 15 cm over 5 weeks, which averages 3 cm per week. The data points (3, 9, 18) are consistent with adding 3 cm each week, indicating constant linear growth.",
    difficulty: 1,
  },
  {
    question_text:
      "A bar graph compares the average monthly rainfall (mm) in two cities. City A peaks at 250 mm in July; City B peaks at 180 mm in November. What can be concluded from this data?",
    choice_a: "City A receives more total annual rainfall than City B.",
    choice_b: "City A's rainy season occurs later in the year than City B's.",
    choice_c: "City A's peak rainfall month occurs earlier in the year than City B's.",
    choice_d: "City B has a more uniform rainfall distribution throughout the year.",
    correct_choice: "c",
    explanation:
      "The graph shows City A peaks in July (month 7) while City B peaks in November (month 11). This directly supports the conclusion that City A's peak month occurs earlier. We cannot determine total annual rainfall or uniformity from peak values alone.",
    difficulty: 2,
  },
  {
    question_text:
      "A scatter plot shows the relationship between hours of study and test scores for 30 students. The points form a tight cluster rising from lower-left to upper-right. What type of correlation does this represent?",
    choice_a: "No correlation",
    choice_b: "Negative correlation",
    choice_c: "Strong positive correlation",
    choice_d: "Weak positive correlation",
    correct_choice: "c",
    explanation:
      "A tight cluster of points rising from lower-left to upper-right indicates a strong positive correlation — as hours of study increase, test scores also increase in a consistent pattern.",
    difficulty: 1,
  },
  {
    question_text:
      "A pie chart shows the composition of the atmosphere: Nitrogen 78%, Oxygen 21%, Argon 0.9%, Carbon dioxide 0.04%, Other 0.06%. Which conclusion is directly supported by the chart?",
    choice_a: "Nitrogen is essential for human respiration.",
    choice_b: "Nitrogen makes up more than three-quarters of Earth's atmosphere.",
    choice_c: "Carbon dioxide is the most harmful greenhouse gas.",
    choice_d: "Argon and carbon dioxide together make up about 5% of the atmosphere.",
    correct_choice: "b",
    explanation:
      "78% is more than three-quarters (75%), so this conclusion is directly supported by the chart data. The other options involve interpretation beyond what the chart shows.",
    difficulty: 1,
  },
  // ── Experimental Analysis ─────────────────────────────────────────────
  {
    question_text:
      "A student investigates whether fertilizer type affects plant growth. She grows 10 plants with Fertilizer A and 10 plants with Fertilizer B under identical conditions and measures height after 4 weeks. What is the independent variable in this experiment?",
    choice_a: "Plant height after 4 weeks",
    choice_b: "The type of fertilizer used",
    choice_c: "The number of plants in each group",
    choice_d: "The duration of the experiment",
    correct_choice: "b",
    explanation:
      "The independent variable is what the experimenter deliberately changes — in this case, the type of fertilizer. Plant height is the dependent variable (what is measured). Number of plants and duration are controlled variables.",
    difficulty: 1,
  },
  {
    question_text:
      "In an experiment testing the effect of light intensity on photosynthesis rate, a student keeps temperature, CO₂ concentration, and water constant. Why are these factors kept constant?",
    choice_a: "To make the experiment easier to conduct",
    choice_b: "To eliminate confounding variables that could affect the results",
    choice_c: "Because they have no effect on photosynthesis",
    choice_d: "To save resources during the experiment",
    correct_choice: "b",
    explanation:
      "Keeping temperature, CO₂, and water constant eliminates confounding variables. If these were allowed to vary, any change in photosynthesis rate could be caused by them rather than light intensity, making it impossible to isolate the effect of the independent variable.",
    difficulty: 2,
  },
  {
    question_text:
      "A group of students tests whether saltwater or freshwater affects seed germination. They plant 20 seeds in saltwater and 20 seeds in freshwater, but use different soil types for each group. What is the major flaw in this experiment?",
    choice_a: "The sample size is too small.",
    choice_b: "There is no hypothesis stated.",
    choice_c: "A confounding variable (soil type) was not controlled.",
    choice_d: "The experiment does not include a control group.",
    correct_choice: "c",
    explanation:
      "Using different soil types introduces a confounding variable. Any difference in germination could be due to soil type rather than water type. A well-designed experiment controls all variables except the independent variable.",
    difficulty: 2,
  },
  {
    question_text:
      "An experiment yields results that do not support the original hypothesis. What is the most appropriate next step for the scientist?",
    choice_a: "Discard the data and repeat the experiment until the hypothesis is supported.",
    choice_b: "Publish only the data that supports the hypothesis.",
    choice_c: "Revise or reject the hypothesis based on the evidence and design further tests.",
    choice_d: "Accept the hypothesis since one experiment is not enough to disprove it.",
    correct_choice: "c",
    explanation:
      "Science requires following the evidence. If results do not support a hypothesis, the scientist should revise or reject it and design further tests. Selectively reporting data or ignoring contradictory evidence violates scientific integrity.",
    difficulty: 2,
  },
  // ── Scientific Method ─────────────────────────────────────────────────
  {
    question_text:
      "A student observes that plants near the window grow taller than those in darker corners. She then states: 'Plants that receive more light will grow taller than plants that receive less light.' This statement is best described as a:",
    choice_a: "Conclusion",
    choice_b: "Hypothesis",
    choice_c: "Theory",
    choice_d: "Law",
    correct_choice: "b",
    explanation:
      "A hypothesis is a testable prediction or explanation based on observation, stated before experimentation. It is not yet proven (which would be a conclusion) and is not a broad, well-tested principle (theory or law).",
    difficulty: 1,
  },
  {
    question_text:
      "Which of the following represents the correct order of steps in the scientific method?",
    choice_a: "Observation → Experiment → Hypothesis → Analysis → Conclusion",
    choice_b: "Hypothesis → Observation → Experiment → Conclusion → Analysis",
    choice_c: "Observation → Hypothesis → Experiment → Analysis → Conclusion",
    choice_d: "Experiment → Hypothesis → Observation → Analysis → Conclusion",
    correct_choice: "c",
    explanation:
      "The standard scientific method proceeds: Observation (notice a phenomenon) → Hypothesis (propose an explanation) → Experiment (test the hypothesis) → Analysis (interpret data) → Conclusion (determine if hypothesis is supported). This cycle may then repeat.",
    difficulty: 1,
  },
  {
    question_text:
      "A scientific theory differs from a scientific hypothesis in that a theory:",
    choice_a: "Has not yet been tested through experimentation.",
    choice_b: "Is a guess made before any observations.",
    choice_c: "Is a well-substantiated explanation supported by extensive evidence.",
    choice_d: "Is accepted as absolute truth and cannot be changed.",
    correct_choice: "c",
    explanation:
      "A scientific theory is an explanation that has been tested repeatedly, supported by a large body of evidence, and accepted by the scientific community. Unlike a hypothesis (untested prediction), a theory is well-substantiated — but it can still be revised if new evidence emerges.",
    difficulty: 2,
  },
  {
    question_text:
      "Why is it important that scientific experiments be repeatable and reproducible?",
    choice_a: "So that scientists can publish more papers.",
    choice_b: "To ensure that results are not due to chance or experimental error.",
    choice_c: "To make experiments faster and more efficient.",
    choice_d: "Because government regulations require it.",
    correct_choice: "b",
    explanation:
      "Repeatability (same researcher, same conditions) and reproducibility (different researchers, same conditions) are essential to verify that results reflect real phenomena rather than chance, bias, or experimental error. This is a cornerstone of reliable science.",
    difficulty: 2,
  },
  // ── Data Reading ──────────────────────────────────────────────────────
  {
    question_text:
      "A data table records the temperature (°C) of a solution every 2 minutes during heating: 2 min = 20°C, 4 min = 35°C, 6 min = 50°C, 8 min = 65°C. If the trend continues, what temperature is expected at 10 minutes?",
    choice_a: "75°C",
    choice_b: "80°C",
    choice_c: "85°C",
    choice_d: "90°C",
    correct_choice: "b",
    explanation:
      "The temperature increases by 15°C every 2 minutes (a constant rate). Starting from 65°C at 8 minutes, adding 15°C gives 80°C at 10 minutes.",
    difficulty: 1,
  },
  {
    question_text:
      "A researcher records the number of bacteria in a culture over time: Hour 0 = 100, Hour 1 = 200, Hour 2 = 400, Hour 3 = 800. Which pattern does this data show?",
    choice_a: "Linear growth — bacteria increase by 100 per hour.",
    choice_b: "Exponential growth — bacteria double every hour.",
    choice_c: "Logistic growth — growth rate slows as population increases.",
    choice_d: "Declining growth — the rate of increase is slowing.",
    correct_choice: "b",
    explanation:
      "The population doubles each hour (100 → 200 → 400 → 800), which is the hallmark of exponential growth. In linear growth the increase would be constant (e.g., +100 each hour); logistic and declining growth patterns are not supported by this data.",
    difficulty: 2,
  },
  {
    question_text:
      "A student measures the mass of 5 rock samples: 12.4 g, 11.8 g, 13.1 g, 12.9 g, and 12.3 g. An outlier of 18.5 g was recorded but excluded after instrument error was confirmed. Why is it valid to exclude this data point?",
    choice_a: "Because it makes the average look better.",
    choice_b: "Because excluding data always improves an experiment.",
    choice_c: "Because a confirmed instrument error means the reading does not reflect the true value.",
    choice_d: "Because the value is simply too different from the others.",
    correct_choice: "c",
    explanation:
      "Excluding data is valid only when there is a documented, confirmed reason such as instrument malfunction, human error, or a contamination event. In this case, the instrument error was confirmed, so the data point does not represent a real measurement and excluding it is scientifically justified.",
    difficulty: 3,
  },
];

async function main() {
  console.log("Seeding Scientific Reasoning & Data Interpretation topic...\n");

  // Get Science subtest ID
  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "science")
    .single();

  if (subtestErr || !subtest) {
    console.error("Could not find science subtest:", subtestErr?.message);
    process.exit(1);
  }

  // Upsert topic
  const { data: topic, error: topicErr } = await supabase
    .from("topics")
    .upsert(
      {
        subtest_id: subtest.id,
        name: TOPIC.name,
        slug: TOPIC.slug,
        description: TOPIC.description,
        display_order: TOPIC.display_order,
      },
      { onConflict: "subtest_id,slug" }
    )
    .select("id")
    .single();

  if (topicErr || !topic) {
    console.error("Could not upsert topic:", topicErr?.message);
    process.exit(1);
  }

  // Insert questions
  const rows = QUESTIONS.map((q) => ({
    topic_id: topic.id,
    ...q,
    status: "approved",
    image_url: null,
  }));

  const { error: qErr } = await supabase.from("questions").insert(rows);

  if (qErr) {
    console.error("Could not insert questions:", qErr.message);
    process.exit(1);
  }

  console.log(`  ✓ ${QUESTIONS.length} questions → ${TOPIC.slug}`);
  console.log("\n✅  Done! Added 1 topic and 15 questions.");
}

main();
