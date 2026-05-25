/**
 * Seeds 39 YouTube resources for the Mathematics subtest across 5 topics:
 *   Arithmetic (10), Geometry (9), Algebra (13), Statistics (4), Trigonometry (3)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-math.ts
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

const MATH_RESOURCES: Record<string, Resource[]> = {
  // ── Arithmetic & Number Sense ────────────────────────────────────────────
  arithmetic: [
    {
      title: "Order of Operations (PEMDAS)",
      description:
        "Learn to evaluate expressions using PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.",
      url: "https://www.youtube.com/watch?v=saTBf8AO4Ok&pp=ygUcT3JkZXIgb2YgT3BlcmF0aW9ucyAoUEVNREFTKQ%3D%3D",
    },
    {
      title: "Operations on Integers",
      description:
        "Practice adding, subtracting, multiplying, and dividing positive and negative integers.",
      url: "https://www.youtube.com/watch?v=O6bRgxVRoZ4&t=5s&pp=ygUWT3BlcmF0aW9ucyBvbiBJbnRlZ2Vycw%3D%3D",
    },
    {
      title: "Prime Factorization",
      description:
        "Break numbers into their prime factor components using factor trees and division methods.",
      url: "https://www.youtube.com/watch?v=KpEyLdXukAA&pp=ygUTUHJpbWUgRmFjdG9yaXphdGlvbg%3D%3D",
    },
    {
      title: "GCF and LCM",
      description:
        "Find the Greatest Common Factor and Least Common Multiple of two or more numbers.",
      url: "https://www.youtube.com/watch?v=Y7Xav-XAhXs&pp=ygULaGNmIGFuZCBsY20%3D",
    },
    {
      title: "Real and Imaginary Numbers",
      description:
        "Explore the number line, classify real numbers, and introduce imaginary and complex numbers.",
      url: "https://www.youtube.com/watch?v=LAw835fVJ1U&pp=ygUacmVhbCBhbmQgaW1hZ2luYXJ5IG51bWJlcnM%3D",
    },
    {
      title: "Fractions and Decimal",
      description:
        "Convert between fractions and decimals and perform operations on both.",
      url: "https://www.youtube.com/watch?v=xYZQaRf_Rz8&pp=ygUVRnJhY3Rpb25zIGFuZCBEZWNpbWFs",
    },
    {
      title: "Ratio and Proportion",
      description:
        "Understand part-to-part and part-to-whole ratios and solve proportional equations.",
      url: "https://www.youtube.com/watch?v=JOZSFwuyqok&pp=ygUccmF0aW8gYW5kIHByb3BvcnRpb24gZ3JhZGUgNg%3D%3D",
    },
    {
      title: "Percentage",
      description:
        "Calculate percentages, percentage increase/decrease, and solve real-world percent problems.",
      url: "https://www.youtube.com/watch?v=WYWPuG-8U5Q&pp=ygUKcGVyY2VudGFnZQ%3D%3D",
    },
    {
      title: "Discounts, Markups, Interests, Conversion",
      description:
        "Apply percentages to solve problems involving discounts, markups, simple interest, and unit conversion.",
      url: "https://www.youtube.com/watch?v=yqcviyn5wxs&list=PLtQqxDEgSqMCJ9UsfsVPcOKSll6RQsCWh",
    },
    {
      title: "Divisibility Rules",
      description:
        "Quick rules to determine if a number is divisible by 2, 3, 4, 5, 6, 8, 9, and 10.",
      url: "https://www.youtube.com/watch?v=gEbpMuPs6Uk&list=PLtQqxDEgSqMCX5YXm8hBD1KVshwQMBcgq",
    },
  ],

  // ── Geometry ────────────────────────────────────────────────────────────
  geometry: [
    {
      title: "Postulates and Theorems",
      description:
        "Foundational rules of geometry: undefined terms, postulates, and theorems used as building blocks of proof.",
      url: "https://www.youtube.com/watch?v=F8yukF4oXA0&pp=ygUXUG9zdHVsYXRlcyBhbmQgVGhlb3JlbXM%3D",
    },
    {
      title: "Pythagorean Theorem",
      description:
        "Use the relationship a² + b² = c² to solve for missing sides in right triangles.",
      url: "https://www.youtube.com/watch?v=d8EA5TxGzcY&pp=ygUbcHl0aGFnb3JlYW4gdGhlb3JlbSBncmFkZSA4",
    },
    {
      title: "Euclidean Geometry",
      description:
        "Study geometry based on Euclid's five postulates covering planes, lines, angles, and shapes.",
      url: "https://www.youtube.com/watch?v=DHDKaIuUGnA&list=PLU_DCVXL8MyMfSj1cUq05oB6enr8aVRGg",
    },
    {
      title: "Non-Euclidean Geometry",
      description:
        "Introduction to spherical and hyperbolic geometry where Euclid's parallel postulate doesn't hold.",
      url: "https://www.youtube.com/watch?v=Di9Kgr7Bu54&pp=ygUQBNOrnQlzo3ftqm0Jj5Sf9zEHlPApapd-rWsAHREzkweiTw%3D%3D",
    },
    {
      title: "Lines and Angles",
      description:
        "Classify lines (parallel, perpendicular, transversal) and angles (acute, obtuse, complementary, supplementary).",
      url: "https://www.youtube.com/watch?v=DCgCdTUrMZQ&pp=ygUYbGluZXMgYW5kIGFuZ2xlcyBjbGFzcyA5",
    },
    {
      title: "Polygons",
      description:
        "Properties, classification, and angle sums of triangles, quadrilaterals, and higher-order polygons.",
      url: "https://www.youtube.com/watch?v=E_-3ulbtcLk&pp=ygUIUG9seWdvbnM%3D",
    },
    {
      title: "Circles",
      description:
        "Parts of a circle, arc length, chord theorems, inscribed angles, and circle equations.",
      url: "https://www.youtube.com/watch?v=Fzaof9cX-PM&pp=ygUHQ2lyY2xlcw%3D%3D",
    },
    {
      title: "Areas and Volumes",
      description:
        "Compute surface area and volume of 2D shapes and 3D solids like prisms, cylinders, and spheres.",
      url: "https://www.youtube.com/watch?v=JnLDmw3bbuw&pp=ygURQXJlYXMgYW5kIFZvbHVtZXM%3D",
    },
    {
      title: "Circumference",
      description:
        "Calculate the perimeter of a circle using C = 2πr and relate it to diameter and arc length.",
      url: "https://www.youtube.com/watch?v=w_sR3DHzTt0&pp=ygUNQ2lyY3VtZmVyZW5jZQ%3D%3D",
    },
  ],

  // ── Algebra (includes Sequences + Functions & Graphs sub-groups) ─────────
  algebra: [
    {
      title: "Set and Set Notation",
      description:
        "Represent collections of objects using roster and set-builder notation; union, intersection, and complement.",
      url: "https://www.youtube.com/watch?v=FLgiccWl434&pp=ygUUU2V0IGFuZCBTZXQgTm90YXRpb24%3D",
    },
    {
      title: "Algebraic Expression",
      description:
        "Translate verbal phrases into algebraic expressions and simplify using properties.",
      url: "https://www.youtube.com/watch?v=aR6phzMLuKM&pp=ygUUQWxnZWJyYWljIEV4cHJlc3Npb24%3D",
    },
    {
      title: "Operations on Expressions",
      description:
        "Add, subtract, multiply, and divide algebraic expressions including polynomials.",
      url: "https://www.youtube.com/watch?v=ZvL9aDGNHqA&t=317s&pp=ygUZT3BlcmF0aW9ucyBvbiBFeHByZXNzaW9ucw%3D%3D",
    },
    {
      title: "Arithmetic Sequence",
      description:
        "Identify and extend sequences with a common difference; find the nth term and partial sums.",
      url: "https://www.youtube.com/watch?v=XZJdyPkCxuE&pp=ygUTQXJpdGhtZXRpYyBTZXF1ZW5jZQ%3D%3D",
    },
    {
      title: "Geometric Sequence",
      description:
        "Identify and extend sequences with a common ratio; find the nth term and sum of a geometric series.",
      url: "https://www.youtube.com/watch?v=zRKZ0-kOUZM&pp=ygUSR2VvbWV0cmljIFNlcXVlbmNl",
    },
    {
      title: "Domain and Range",
      description:
        "Determine valid inputs (domain) and outputs (range) of functions from equations and graphs.",
      url: "https://www.youtube.com/watch?v=KirGQOwjBVI&pp=ygUQRG9tYWluIGFuZCBSYW5nZQ%3D%3D",
    },
    {
      title: "Quadratic Function",
      description:
        "Graph parabolas, identify vertex and axis of symmetry, and solve quadratic equations.",
      url: "https://www.youtube.com/watch?v=S7YFJ3poK44&pp=ygUScXVhZHJhdGljIGZ1bmN0aW9u",
    },
    {
      title: "Rational Functions",
      description:
        "Analyze functions with polynomial numerators and denominators, including asymptotes and holes.",
      url: "https://www.youtube.com/watch?v=bWVhwYdSnfk&pp=ygUSUmF0aW9uYWwgRnVuY3Rpb25z",
    },
    {
      title: "Absolute Value Functions",
      description:
        "Graph and solve equations and inequalities involving absolute value expressions.",
      url: "https://www.youtube.com/watch?v=ld4UD98yHio&pp=ygUmYWJzb2x1dGUgdmFsdWUgZnVuY3Rpb25zIGFuZCBlcXVhdGlvbnM%3D",
    },
    {
      title: "Exponential Functions",
      description:
        "Model growth and decay with f(x) = aˣ and solve exponential equations.",
      url: "https://www.youtube.com/watch?v=3G5WluJ7LFA&pp=ygUVZXhwb25lbnRpYWwgZnVuY3Rpb25z",
    },
    {
      title: "Logarithmic Functions",
      description:
        "Convert between exponential and logarithmic form and apply logarithm properties.",
      url: "https://www.youtube.com/watch?v=-nptxS9rZNA&pp=ygUVbG9nYXJpdGhtaWMgZnVuY3Rpb25z",
    },
    {
      title: "Radical Functions",
      description:
        "Simplify radical expressions and graph square root and cube root functions.",
      url: "https://www.youtube.com/watch?v=SLV600BpHpE&pp=ygURUmFkaWNhbCBGdW5jdGlvbnPSBwkJxQoBhyohjO8%3D",
    },
    {
      title: "Piecewise Functions",
      description:
        "Define and evaluate functions using different rules over different intervals of the domain.",
      url: "https://www.youtube.com/watch?v=Uzw9tsGq2Pw&pp=ygUTUGllY2V3aXNlIEZ1bmN0aW9ucw%3D%3D",
    },
  ],

  // ── Statistics and Probability ───────────────────────────────────────────
  statistics: [
    {
      title: "Graphs",
      description:
        "Read and interpret bar graphs, line graphs, pie charts, histograms, and frequency tables.",
      url: "https://www.youtube.com/watch?v=rllw15xkmUU&pp=ygULU3RhdCBncmFwaHM%3D",
    },
    {
      title: "Measures of Central Tendency",
      description:
        "Calculate mean, median, and mode and choose the appropriate measure for a data set.",
      url: "https://www.youtube.com/watch?v=1M6KDrFAYFE&pp=DcJHrrHSgvFpsYxqb6g97uaQTd2kE31rPUeDZTeDsjVq%3D%3D",
    },
    {
      title: "Combination and Permutation",
      description:
        "Count arrangements (permutations) and selections (combinations) using factorial formulas.",
      url: "https://www.youtube.com/watch?v=XJnIdRXUi7A&pp=ygUbY29tYmluYXRpb24gYW5kIHBlcm11dGF0aW9u",
    },
    {
      title: "Probability",
      description:
        "Compute theoretical and experimental probability for single and compound events.",
      url: "https://www.youtube.com/watch?v=SkidyDQuupA&pp=ygULUHJvYmFiaWxpdHk%3D",
    },
  ],

  // ── Trigonometry ─────────────────────────────────────────────────────────
  trigonometry: [
    {
      title: "Unit Circle",
      description:
        "Memorize angle measures in degrees and radians, and their corresponding sine, cosine, and tangent values.",
      url: "https://www.youtube.com/watch?v=75dMcyCUo2g&pp=ygULVW5pdCBDaXJjbGXSBwkJxQoBhyohjO8%3D",
    },
    {
      title: "Trigonometric Ratios",
      description:
        "Define sine, cosine, and tangent using SOH-CAH-TOA in right triangles.",
      url: "https://www.youtube.com/watch?v=9-eHMMpQC2k&pp=ygUUdHJpZ29ub21ldHJpYyByYXRpb3M%3D",
    },
    {
      title: "Basic Trigonometric Functions",
      description:
        "Graph sin, cos, and tan functions and identify their amplitude, period, and transformations.",
      url: "https://www.youtube.com/watch?v=WvoFgL4P_rw&pp=ygUdQmFzaWMgVHJpZ29ub21ldHJpYyBGdW5jdGlvbnM%3D",
    },
  ],
};

async function main() {
  console.log("Seeding Math resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "mathematics")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find mathematics subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const [topicSlug, resources] of Object.entries(MATH_RESOURCES)) {
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

  console.log(`\n✅  Done! Inserted ${total} resources across ${Object.keys(MATH_RESOURCES).length} topics.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
