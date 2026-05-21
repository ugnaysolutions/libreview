/**
 * Adds 3 new Mathematics topics with 15 questions each:
 *   - Arithmetic & Number Sense (display_order 4)
 *   - Word Problems (display_order 5)
 *   - Trigonometry (display_order 6)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-math-new-topics.ts
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

const NEW_TOPICS = [
  {
    name: "Arithmetic & Number Sense",
    slug: "arithmetic",
    description: "Number properties, divisibility, fractions, decimals, percentages, ratios, and exponents.",
    display_order: 4,
  },
  {
    name: "Word Problems",
    slug: "word-problems",
    description: "Applied problems involving age, distance, mixture, work, coins, and interest.",
    display_order: 5,
  },
  {
    name: "Trigonometry",
    slug: "trigonometry",
    description: "Trigonometric ratios, special angles, identities, and applications to triangles.",
    display_order: 6,
  },
];

const QUESTIONS: Record<string, Q[]> = {
  // ── Arithmetic & Number Sense ─────────────────────────────────────────────
  arithmetic: [
    {
      question_text: "Which of the following numbers is divisible by both 4 and 9?",
      choice_a: "108",
      choice_b: "112",
      choice_c: "120",
      choice_d: "132",
      correct_choice: "a",
      explanation: "108 ÷ 4 = 27 ✓ and 108 ÷ 9 = 12 ✓. A number is divisible by 36 if it is divisible by both 4 and 9. 108 = 4 × 27 = 9 × 12.",
      difficulty: 1,
    },
    {
      question_text: "What is the Least Common Multiple (LCM) of 12 and 18?",
      choice_a: "6",
      choice_b: "24",
      choice_c: "36",
      choice_d: "216",
      correct_choice: "c",
      explanation: "12 = 2² × 3 and 18 = 2 × 3². LCM takes the highest power of each prime: 2² × 3² = 36.",
      difficulty: 1,
    },
    {
      question_text: "What is the Greatest Common Factor (GCF) of 48 and 72?",
      choice_a: "6",
      choice_b: "12",
      choice_c: "24",
      choice_d: "36",
      correct_choice: "c",
      explanation: "48 = 2⁴ × 3 and 72 = 2³ × 3². GCF takes the lowest power of shared primes: 2³ × 3 = 24.",
      difficulty: 1,
    },
    {
      question_text: "Simplify: 2/3 + 3/4 − 1/6",
      choice_a: "3/4",
      choice_b: "7/12",
      choice_c: "5/4",
      choice_d: "4/3",
      correct_choice: "c",
      explanation: "LCD = 12. Rewrite: 8/12 + 9/12 − 2/12 = 15/12 = 5/4.",
      difficulty: 2,
    },
    {
      question_text: "Which fraction is equivalent to 0.375?",
      choice_a: "3/7",
      choice_b: "3/8",
      choice_c: "3/10",
      choice_d: "3/5",
      correct_choice: "b",
      explanation: "0.375 = 375/1000. Simplify: GCF(375, 1000) = 125. 375/1000 = 3/8.",
      difficulty: 1,
    },
    {
      question_text: "What is 35% of 240?",
      choice_a: "80",
      choice_b: "84",
      choice_c: "85",
      choice_d: "90",
      correct_choice: "b",
      explanation: "0.35 × 240 = 84. Alternatively, 10% of 240 = 24; 35% = 3.5 × 24 = 84.",
      difficulty: 1,
    },
    {
      question_text: "Express 0.0000045 in scientific notation.",
      choice_a: "4.5 × 10⁻⁵",
      choice_b: "4.5 × 10⁻⁶",
      choice_c: "4.5 × 10⁻⁷",
      choice_d: "45 × 10⁻⁷",
      correct_choice: "b",
      explanation: "Move the decimal 6 places to the right to get 4.5, so the exponent is −6. 0.0000045 = 4.5 × 10⁻⁶.",
      difficulty: 2,
    },
    {
      question_text: "Which of the following is NOT a prime number?",
      choice_a: "17",
      choice_b: "23",
      choice_c: "51",
      choice_d: "61",
      correct_choice: "c",
      explanation: "51 = 3 × 17, so it has factors other than 1 and itself. All others (17, 23, 61) are prime.",
      difficulty: 1,
    },
    {
      question_text: "If 5 workers can build a wall in 8 days, how many days will 10 workers take to build the same wall?",
      choice_a: "2 days",
      choice_b: "4 days",
      choice_c: "6 days",
      choice_d: "16 days",
      correct_choice: "b",
      explanation: "Inverse proportion: workers × days is constant. 5 × 8 = 10 × d → d = 40/10 = 4 days.",
      difficulty: 1,
    },
    {
      question_text: "Evaluate: (2³)² ÷ 2⁴",
      choice_a: "2",
      choice_b: "4",
      choice_c: "8",
      choice_d: "16",
      correct_choice: "b",
      explanation: "(2³)² = 2⁶ = 64. Then 64 ÷ 2⁴ = 64 ÷ 16 = 4 = 2².",
      difficulty: 2,
    },
    {
      question_text: "The sum of four consecutive integers is 90. What is the largest integer?",
      choice_a: "22",
      choice_b: "23",
      choice_c: "24",
      choice_d: "25",
      correct_choice: "c",
      explanation: "Let integers be n, n+1, n+2, n+3. Then 4n + 6 = 90 → 4n = 84 → n = 21. Largest = 21 + 3 = 24.",
      difficulty: 1,
    },
    {
      question_text: "What is the next term in the sequence: 2, 5, 10, 17, 26, ___?",
      choice_a: "33",
      choice_b: "35",
      choice_c: "37",
      choice_d: "39",
      correct_choice: "c",
      explanation: "Differences between terms: 3, 5, 7, 9 — an arithmetic sequence increasing by 2. Next difference = 11. 26 + 11 = 37.",
      difficulty: 2,
    },
    {
      question_text: "Which of the following is a perfect square?",
      choice_a: "150",
      choice_b: "169",
      choice_c: "180",
      choice_d: "200",
      correct_choice: "b",
      explanation: "169 = 13². None of the others (150, 180, 200) are perfect squares.",
      difficulty: 1,
    },
    {
      question_text: "Which of the following is an irrational number?",
      choice_a: "√49",
      choice_b: "√64",
      choice_c: "√81",
      choice_d: "√50",
      correct_choice: "d",
      explanation: "√49 = 7, √64 = 8, √81 = 9 — all rational. √50 = 5√2, which cannot be expressed as a ratio of integers, so it is irrational.",
      difficulty: 2,
    },
    {
      question_text: "A number is increased by 20% and then decreased by 20%. What is the net change?",
      choice_a: "No change",
      choice_b: "4% decrease",
      choice_c: "4% increase",
      choice_d: "2% decrease",
      correct_choice: "b",
      explanation: "Let the number = 100. After 20% increase: 120. After 20% decrease: 120 × 0.80 = 96. Net change = 96 − 100 = −4, or a 4% decrease.",
      difficulty: 2,
    },
  ],

  // ── Word Problems ─────────────────────────────────────────────────────────
  "word-problems": [
    {
      question_text: "A car travels 240 km in 4 hours. At the same speed, how long will it take to travel 360 km?",
      choice_a: "5 hours",
      choice_b: "6 hours",
      choice_c: "7 hours",
      choice_d: "8 hours",
      correct_choice: "b",
      explanation: "Speed = 240 ÷ 4 = 60 km/h. Time = 360 ÷ 60 = 6 hours.",
      difficulty: 1,
    },
    {
      question_text: "Maria is 3 times as old as her daughter. In 12 years, Maria will be twice as old as her daughter. How old is Maria now?",
      choice_a: "24",
      choice_b: "30",
      choice_c: "36",
      choice_d: "48",
      correct_choice: "c",
      explanation: "Let daughter = d, Maria = 3d. In 12 years: 3d + 12 = 2(d + 12) → 3d + 12 = 2d + 24 → d = 12. Maria = 3 × 12 = 36.",
      difficulty: 2,
    },
    {
      question_text: "Two workers together can complete a job in 6 days. Worker A can do it alone in 10 days. How many days would Worker B take alone?",
      choice_a: "12 days",
      choice_b: "15 days",
      choice_c: "18 days",
      choice_d: "20 days",
      correct_choice: "b",
      explanation: "Combined rate = 1/6. Worker A's rate = 1/10. Worker B's rate = 1/6 − 1/10 = 5/30 − 3/30 = 2/30 = 1/15. Worker B alone: 15 days.",
      difficulty: 2,
    },
    {
      question_text: "How many liters of a 20% salt solution must be mixed with 5 liters of a 60% salt solution to produce a 40% salt solution?",
      choice_a: "3 liters",
      choice_b: "4 liters",
      choice_c: "5 liters",
      choice_d: "6 liters",
      correct_choice: "c",
      explanation: "Let x = liters of 20% solution. 0.20x + 0.60(5) = 0.40(x + 5) → 0.20x + 3 = 0.40x + 2 → 1 = 0.20x → x = 5 liters.",
      difficulty: 3,
    },
    {
      question_text: "The sum of two numbers is 45 and their difference is 11. What is the product of the two numbers?",
      choice_a: "460",
      choice_b: "476",
      choice_c: "484",
      choice_d: "495",
      correct_choice: "b",
      explanation: "x + y = 45 and x − y = 11. Adding: 2x = 56, so x = 28 and y = 17. Product = 28 × 17 = 476.",
      difficulty: 2,
    },
    {
      question_text: "A shirt originally priced at ₱800 was sold for ₱560. What was the percentage discount?",
      choice_a: "20%",
      choice_b: "25%",
      choice_c: "30%",
      choice_d: "35%",
      correct_choice: "c",
      explanation: "Discount = ₱800 − ₱560 = ₱240. Percentage = 240/800 × 100 = 30%.",
      difficulty: 1,
    },
    {
      question_text: "What is the simple interest on ₱15,000 invested at 8% per year for 3 years?",
      choice_a: "₱1,200",
      choice_b: "₱2,400",
      choice_c: "₱3,600",
      choice_d: "₱4,800",
      correct_choice: "c",
      explanation: "Simple Interest = P × R × T = 15,000 × 0.08 × 3 = ₱3,600.",
      difficulty: 1,
    },
    {
      question_text: "Two trains leave the same station at the same time traveling in opposite directions — one at 80 km/h, the other at 70 km/h. After how many hours will they be 450 km apart?",
      choice_a: "2 hours",
      choice_b: "2.5 hours",
      choice_c: "3 hours",
      choice_d: "4 hours",
      correct_choice: "c",
      explanation: "Combined speed = 80 + 70 = 150 km/h. Time = 450 ÷ 150 = 3 hours.",
      difficulty: 2,
    },
    {
      question_text: "The ratio of boys to girls in a class is 3:5. If there are 24 boys, how many students are there in total?",
      choice_a: "40",
      choice_b: "48",
      choice_c: "56",
      choice_d: "64",
      correct_choice: "d",
      explanation: "Each ratio unit = 24 ÷ 3 = 8 students. Total = (3 + 5) × 8 = 64 students.",
      difficulty: 1,
    },
    {
      question_text: "A company's profit increased from ₱200,000 to ₱250,000. What is the percentage increase?",
      choice_a: "20%",
      choice_b: "25%",
      choice_c: "30%",
      choice_d: "50%",
      correct_choice: "b",
      explanation: "Increase = ₱50,000. Percentage = 50,000 ÷ 200,000 × 100 = 25%.",
      difficulty: 1,
    },
    {
      question_text: "A piggy bank has only 1-peso and 5-peso coins totaling 30 coins worth ₱90. How many 5-peso coins are there?",
      choice_a: "10",
      choice_b: "12",
      choice_c: "15",
      choice_d: "18",
      correct_choice: "c",
      explanation: "Let x = number of 5-peso coins. 5x + 1(30 − x) = 90 → 4x + 30 = 90 → 4x = 60 → x = 15.",
      difficulty: 2,
    },
    {
      question_text: "A bus leaves a station at 8:00 AM at 60 km/h. A car leaves the same station at 10:00 AM in the same direction at 90 km/h. At what time does the car overtake the bus?",
      choice_a: "12:00 PM",
      choice_b: "1:00 PM",
      choice_c: "2:00 PM",
      choice_d: "3:00 PM",
      correct_choice: "c",
      explanation: "Bus head start = 2 h × 60 = 120 km. Relative speed = 90 − 60 = 30 km/h. Time to close gap = 120 ÷ 30 = 4 hours after 10:00 AM = 2:00 PM.",
      difficulty: 2,
    },
    {
      question_text: "On a map, 2 cm represents 50 km. How many centimeters represent 325 km?",
      choice_a: "10 cm",
      choice_b: "11 cm",
      choice_c: "12 cm",
      choice_d: "13 cm",
      correct_choice: "d",
      explanation: "2/50 = x/325 → x = 325 × 2 ÷ 50 = 650 ÷ 50 = 13 cm.",
      difficulty: 1,
    },
    {
      question_text: "Pipe A fills a tank in 4 hours and Pipe B fills it in 6 hours. How long will both pipes take together?",
      choice_a: "2 hours",
      choice_b: "2 hours 24 minutes",
      choice_c: "2 hours 30 minutes",
      choice_d: "3 hours",
      correct_choice: "b",
      explanation: "Combined rate = 1/4 + 1/6 = 3/12 + 2/12 = 5/12. Time = 12/5 = 2.4 hours = 2 hours 24 minutes.",
      difficulty: 2,
    },
    {
      question_text: "A store buys an item for ₱500 and marks it up by 40%. What is the selling price?",
      choice_a: "₱540",
      choice_b: "₱600",
      choice_c: "₱700",
      choice_d: "₱750",
      correct_choice: "c",
      explanation: "Selling price = Cost × (1 + markup rate) = 500 × 1.40 = ₱700.",
      difficulty: 1,
    },
  ],

  // ── Trigonometry ──────────────────────────────────────────────────────────
  trigonometry: [
    {
      question_text: "In a right triangle, which ratio defines the sine of an angle?",
      choice_a: "Adjacent ÷ Hypotenuse",
      choice_b: "Opposite ÷ Hypotenuse",
      choice_c: "Opposite ÷ Adjacent",
      choice_d: "Hypotenuse ÷ Opposite",
      correct_choice: "b",
      explanation: "SOH CAH TOA: Sine = Opposite ÷ Hypotenuse. Cosine = Adjacent ÷ Hypotenuse. Tangent = Opposite ÷ Adjacent.",
      difficulty: 1,
    },
    {
      question_text: "In a right triangle, the hypotenuse is 10 cm and one angle is 30°. What is the length of the side opposite the 30° angle?",
      choice_a: "5 cm",
      choice_b: "5√2 cm",
      choice_c: "5√3 cm",
      choice_d: "10 cm",
      correct_choice: "a",
      explanation: "sin 30° = opposite ÷ hypotenuse → opposite = 10 × sin 30° = 10 × 0.5 = 5 cm.",
      difficulty: 1,
    },
    {
      question_text: "What is the exact value of cos 60°?",
      choice_a: "1",
      choice_b: "√3/2",
      choice_c: "1/2",
      choice_d: "√2/2",
      correct_choice: "c",
      explanation: "From the 30-60-90 triangle ratios: cos 60° = 1/2. The full set: sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3.",
      difficulty: 1,
    },
    {
      question_text: "What is the exact value of tan 45°?",
      choice_a: "0",
      choice_b: "1",
      choice_c: "√3",
      choice_d: "√2",
      correct_choice: "b",
      explanation: "In a 45-45-90 triangle, the two legs are equal, so tan 45° = opposite ÷ adjacent = 1. Also, sin 45° = cos 45° = √2/2, and their ratio is 1.",
      difficulty: 1,
    },
    {
      question_text: "Which of the following is the fundamental Pythagorean trigonometric identity?",
      choice_a: "sin²θ + cos²θ = 2",
      choice_b: "sin²θ − cos²θ = 1",
      choice_c: "sin²θ + cos²θ = 1",
      choice_d: "sinθ × cosθ = 1",
      correct_choice: "c",
      explanation: "The Pythagorean identity sin²θ + cos²θ = 1 is derived directly from the Pythagorean theorem applied to a unit circle.",
      difficulty: 1,
    },
    {
      question_text: "A person stands 60 m from the base of a tree and observes the top at an angle of elevation of 30°. How tall is the tree?",
      choice_a: "20 m",
      choice_b: "30 m",
      choice_c: "20√3 m",
      choice_d: "60√3 m",
      correct_choice: "c",
      explanation: "tan 30° = height ÷ 60 → height = 60 × tan 30° = 60 × (1/√3) = 60/√3 = 60√3/3 = 20√3 m.",
      difficulty: 2,
    },
    {
      question_text: "In a right triangle, if angle A = 45° and the side opposite A is 6 cm, what is the length of the adjacent side?",
      choice_a: "3 cm",
      choice_b: "6 cm",
      choice_c: "6√2 cm",
      choice_d: "12 cm",
      correct_choice: "b",
      explanation: "tan 45° = opposite ÷ adjacent → 1 = 6 ÷ adjacent → adjacent = 6 cm. In a 45-45-90 triangle, both legs are equal.",
      difficulty: 1,
    },
    {
      question_text: "Given that sin 35° ≈ 0.574, what is cos 55°?",
      choice_a: "0.426",
      choice_b: "0.574",
      choice_c: "0.819",
      choice_d: "0.707",
      correct_choice: "b",
      explanation: "Complementary angle identity: sin θ = cos(90° − θ). So cos 55° = cos(90° − 35°) = sin 35° ≈ 0.574.",
      difficulty: 1,
    },
    {
      question_text: "In triangle ABC, angle A = 30°, angle B = 60°, and the side opposite A (side a) = 5 cm. What is side b (opposite B)?",
      choice_a: "5 cm",
      choice_b: "5√2 cm",
      choice_c: "5√3 cm",
      choice_d: "10 cm",
      correct_choice: "c",
      explanation: "By the Law of Sines: a/sin A = b/sin B → 5/sin 30° = b/sin 60° → 5/0.5 = b/(√3/2) → b = 10 × (√3/2) = 5√3 cm.",
      difficulty: 2,
    },
    {
      question_text: "A right triangle has legs 3 and 4, and hypotenuse 5. What is sin of the angle opposite the leg of length 3?",
      choice_a: "3/4",
      choice_b: "3/5",
      choice_c: "4/5",
      choice_d: "4/3",
      correct_choice: "b",
      explanation: "sin = opposite ÷ hypotenuse = 3 ÷ 5 = 3/5.",
      difficulty: 1,
    },
    {
      question_text: "If cos θ = 0.5 and 0° ≤ θ ≤ 90°, what is θ?",
      choice_a: "30°",
      choice_b: "45°",
      choice_c: "60°",
      choice_d: "90°",
      correct_choice: "c",
      explanation: "cos⁻¹(0.5) = 60°. From the special angles table: cos 60° = 1/2 = 0.5.",
      difficulty: 1,
    },
    {
      question_text: "A triangle has sides a = 8 cm and b = 10 cm with included angle C = 30°. What is its area?",
      choice_a: "10 cm²",
      choice_b: "20 cm²",
      choice_c: "40 cm²",
      choice_d: "80 cm²",
      correct_choice: "b",
      explanation: "Area = ½ab sin C = ½ × 8 × 10 × sin 30° = ½ × 8 × 10 × 0.5 = 20 cm².",
      difficulty: 2,
    },
    {
      question_text: "If sin θ = 1/2, what is csc θ?",
      choice_a: "1/2",
      choice_b: "1",
      choice_c: "2",
      choice_d: "√3",
      correct_choice: "c",
      explanation: "csc θ (cosecant) is the reciprocal of sin θ: csc θ = 1 ÷ sin θ = 1 ÷ (1/2) = 2.",
      difficulty: 1,
    },
    {
      question_text: "What is the range of values for sin θ for any angle θ?",
      choice_a: "0 ≤ sin θ ≤ 1",
      choice_b: "−1 ≤ sin θ ≤ 1",
      choice_c: "−∞ < sin θ < ∞",
      choice_d: "0 ≤ sin θ ≤ 2π",
      correct_choice: "b",
      explanation: "The sine function always outputs values between −1 and 1 inclusive, since it equals the y-coordinate on the unit circle.",
      difficulty: 1,
    },
    {
      question_text: "What is the exact value of sin 45°?",
      choice_a: "1/2",
      choice_b: "√3/2",
      choice_c: "1",
      choice_d: "√2/2",
      correct_choice: "d",
      explanation: "In a 45-45-90 triangle with hypotenuse 1, each leg = √2/2. So sin 45° = opposite ÷ hypotenuse = (√2/2) ÷ 1 = √2/2 (also written as 1/√2 ≈ 0.707).",
      difficulty: 1,
    },
  ],
};

async function main() {
  console.log("Seeding new Mathematics topics...\n");

  // Get the mathematics subtest ID
  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "mathematics")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find mathematics subtest: ${subtestErr?.message}`);
  }

  let totalQuestions = 0;

  for (const topic of NEW_TOPICS) {
    console.log(`Seeding topic: ${topic.name}...`);

    const { data: topicRow, error: topicErr } = await supabase
      .from("topics")
      .upsert(
        { ...topic, subtest_id: subtest.id },
        { onConflict: "subtest_id,slug" }
      )
      .select("id, slug")
      .single();
    if (topicErr || !topicRow) {
      throw new Error(`Topic ${topic.slug}: ${topicErr?.message}`);
    }

    const questions = QUESTIONS[topic.slug];
    const rows = questions.map((q) => ({
      ...q,
      topic_id: topicRow.id,
      status: "approved" as const,
    }));

    const { error: insertErr } = await supabase.from("questions").insert(rows);
    if (insertErr) {
      throw new Error(`Questions for ${topic.slug}: ${insertErr.message}`);
    }

    console.log(`  ✓ ${rows.length} questions`);
    totalQuestions += rows.length;
  }

  console.log(`\n✅  Done! Added ${NEW_TOPICS.length} topics and ${totalQuestions} questions.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
