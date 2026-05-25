/**
 * Seeds 34 YouTube resources for the Science subtest across 4 topics:
 *   Earth Science (14 incl. Astronomy), Biology (9), Chemistry (7), Physics (4)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-resources-science.ts
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

const SCIENCE_RESOURCES: Record<string, Resource[]> = {
  // ── Earth Science (incl. Astronomy) ─────────────────────────────────────
  "earth-science": [
    {
      title: "Earth's Surface",
      description:
        "Overview of Earth's layers, landforms, and the processes that shape the planet's surface.",
      url: "https://www.youtube.com/watch?v=IHHFsLPKGLE&pp=ygUPRWFydGgncyBTdXJmYWNl",
    },
    {
      title: "Rocks and Minerals",
      description:
        "Classify igneous, sedimentary, and metamorphic rocks; identify minerals by physical properties.",
      url: "https://www.youtube.com/watch?v=CeuYx-AbZdo&pp=ygUSUm9ja3MgYW5kIE1pbmVyYWxz",
    },
    {
      title: "Fossils",
      description:
        "How fossils form, what they tell us about ancient life, and how they are used in relative dating.",
      url: "https://www.youtube.com/watch?v=bRuSmxJo_iA&pp=ygUHRm9zc2lscw%3D%3D",
    },
    {
      title: "Plate Tectonics",
      description:
        "Understand how tectonic plate movement causes earthquakes, volcanoes, and mountain formation.",
      url: "https://www.youtube.com/watch?v=kwfNGatxUJI&pp=ygUPUGxhdGUgVGVjdG9uaWNz",
    },
    {
      title: "Air, Weather, and Climate",
      description:
        "Explore atmospheric layers, weather patterns, and the difference between weather and climate.",
      url: "https://www.youtube.com/watch?v=YbAWny7FV3w&pp=ygUZQWlyLCBXZWF0aGVyLCBhbmQgQ2xpbWF0ZQ%3D%3D",
    },
    {
      title: "Water on Earth",
      description:
        "The water cycle, freshwater distribution, oceans, and the role of water in Earth's systems.",
      url: "https://www.youtube.com/watch?v=wZK2xTNzgq8&pp=ygUOd2F0ZXIgb24gZWFydGg%3D",
    },
    {
      title: "Energy Resources",
      description:
        "Compare renewable and non-renewable energy sources and their environmental impacts.",
      url: "https://www.youtube.com/watch?v=N5mHKqcit9I&pp=ygUQRW5lcmd5IFJlc291cmNlcw%3D%3D",
    },
    {
      title: "Origins of the Universe",
      description:
        "The Big Bang theory, cosmic expansion, and the evidence supporting the universe's origin.",
      url: "https://www.youtube.com/watch?v=HdPzOWlLrbE&pp=ygUXT3JpZ2lucyBvZiB0aGUgVW5pdmVyc2U%3D",
    },
    {
      title: "Stars, Blackholes, Galaxy",
      description:
        "Lifecycle of stars, formation of black holes, and the structure of galaxies.",
      url: "https://www.youtube.com/watch?v=kOEDG3j1bjs&pp=ygUZU3RhcnMsIEJsYWNraG9sZXMsIEdhbGF4eQ%3D%3D",
    },
    {
      title: "The Solar System",
      description:
        "Planets, moons, and other bodies in our solar system and their characteristics.",
      url: "https://www.youtube.com/watch?v=libKVRa01L8&pp=ygUQVGhlIFNvbGFyIFN5c3RlbQ%3D%3D",
    },
    {
      title: "Rotation and Revolution",
      description:
        "Earth's rotation (day/night cycle) and revolution (seasons) around the Sun.",
      url: "https://www.youtube.com/watch?v=6SzjlsuyTdk&pp=ygUXUm90YXRpb24gYW5kIFJldm9sdXRpb24%3D",
    },
    {
      title: "Comets and Asteroids",
      description:
        "Composition, orbits, and differences between comets, asteroids, and meteoroids.",
      url: "https://www.youtube.com/watch?v=bS3TUj0bnXY&pp=ygUUQ29tZXRzIGFuZCBBc3Rlcm9pZHM%3D",
    },
    {
      title: "Phases of the Moon",
      description:
        "The lunar cycle, why the Moon has phases, and how it relates to Earth's position.",
      url: "https://www.youtube.com/watch?v=AQ5vty8f9Xc&pp=ygUSUGhhc2VzIG9mIHRoZSBNb29u0gcJCcUKAYcqIYzv",
    },
    {
      title: "Solar and Lunar Eclipse",
      description:
        "Conditions for solar and lunar eclipses and the geometry behind each phenomenon.",
      url: "https://www.youtube.com/watch?v=TKaxDGkOBLo&pp=ygUXU29sYXIgYW5kIEx1bmFyIEVjbGlwc2U%3D",
    },
  ],

  // ── Biology (Cell Biology + Human Biology) ───────────────────────────────
  biology: [
    {
      title: "Structure of a Cell",
      description:
        "Identify prokaryotic vs. eukaryotic cells, organelles, and their functions.",
      url: "https://www.youtube.com/watch?v=URUJD5NEXC8&pp=ygUMQ2VsbCBCaW9sb2d5",
    },
    {
      title: "Cellular Respiration",
      description:
        "ATP production through glycolysis, the Krebs cycle, and the electron transport chain.",
      url: "https://www.youtube.com/watch?v=eJ9Zjc-jdys&pp=ygUUQ2VsbHVsYXIgUmVzcGlyYXRpb24%3D",
    },
    {
      title: "Cell Division",
      description:
        "Compare mitosis and meiosis and understand their roles in growth and reproduction.",
      url: "https://www.youtube.com/watch?v=XKZhcYetvsc&pp=ygUNQ2VsbCBEaXZpc2lvbg%3D%3D",
    },
    {
      title: "Photosynthesis",
      description:
        "Light-dependent and light-independent reactions that convert sunlight into glucose.",
      url: "https://www.youtube.com/watch?v=CMiPYHNNg28&pp=ygUOUGhvdG9zeW50aGVzaXM%3D",
    },
    {
      title: "Genetics",
      description:
        "Genes, alleles, genotype vs. phenotype, and how traits are inherited.",
      url: "https://www.youtube.com/watch?v=v8tJGlicgp8&pp=ygUIR2VuZXRpY3PSBwkJxQoBhyohjO8%3D",
    },
    {
      title: "Mendelian Heredity",
      description:
        "Mendel's laws of segregation and independent assortment using Punnett squares.",
      url: "https://www.youtube.com/watch?v=NR3779ef9yQ&pp=ygUSTWVuZGVsaWFuIEhlcmVkaXR5",
    },
    {
      title: "DNA",
      description:
        "Structure of DNA, replication, transcription, and translation in protein synthesis.",
      url: "https://www.youtube.com/watch?v=8m6hHRlKwxY&pp=ygUDRE5B",
    },
    {
      title: "Taxonomy",
      description:
        "Classify organisms using the Linnaean system: domain, kingdom, phylum, class, order, family, genus, species.",
      url: "https://www.youtube.com/watch?v=xwFM006dacM&pp=ygUIVGF4b25vbXk%3D",
    },
    {
      title: "Organ Systems",
      description:
        "Overview of the major human organ systems (digestive, circulatory, nervous, etc.) and their functions.",
      url: "https://www.youtube.com/watch?v=0JDCViWGn-0&pp=ygUNSHVtYW4gQmlvbG9neQ%3D%3D",
    },
  ],

  // ── Chemistry ────────────────────────────────────────────────────────────
  chemistry: [
    {
      title: "States of Matter",
      description:
        "Properties of solids, liquids, gases, and plasma; phase changes and particle behavior.",
      url: "https://www.youtube.com/watch?v=MrTxRn9MNWM&pp=ygUQU3RhdGVzIG9mIE1hdHRlctIHCQnFCgGHKiGM7w%3D%3D",
    },
    {
      title: "Atoms, Compounds, Ions",
      description:
        "Difference between atoms, molecules, compounds, and ions; ionic vs. covalent compounds.",
      url: "https://www.youtube.com/watch?v=pSJeMJaCkVU&pp=ygUWQXRvbXMsIENvbXBvdW5kcywgSW9ucw%3D%3D",
    },
    {
      title: "Atomic Structure",
      description:
        "Protons, neutrons, electrons; atomic number, mass number, and electron configuration.",
      url: "https://www.youtube.com/watch?v=OH-aSu-rWgk&pp=ygUQQXRvbWljIFN0cnVjdHVyZQ%3D%3D",
    },
    {
      title: "Mole, Avogadro's Number",
      description:
        "The mole concept, Avogadro's number, and molar mass calculations in stoichiometry.",
      url: "https://www.youtube.com/watch?v=74-X94OP2XI&pp=ygUXTW9sZSwgQXZvZ2Fkcm8ncyBOdW1iZXI%3D",
    },
    {
      title: "Metal and Non-metal Families",
      description:
        "Periodic table families, properties of metals and nonmetals, and the metalloid boundary.",
      url: "https://www.youtube.com/watch?v=dpyfCuXVSkg&pp=ygUcTWV0YWwgYW5kIE5vbi1tZXRhbCBGYW1pbGllc9IHCQnFCgGHKiGM7w%3D%3D",
    },
    {
      title: "Electronegativity",
      description:
        "How electronegativity affects bond polarity and molecular shape.",
      url: "https://www.youtube.com/watch?v=c9n2-gkVsaw&pp=ygUTRWxlY3Ryb25lZ2F0aXZpaXR5IA%3D%3D",
    },
    {
      title: "Bonding",
      description:
        "Ionic, covalent, and metallic bonding; Lewis dot structures and bond properties.",
      url: "https://www.youtube.com/watch?v=5gEWOh630b8&pp=ygUHQm9uZGluZw%3D%3D",
    },
  ],

  // ── Physics ──────────────────────────────────────────────────────────────
  physics: [
    {
      title: "Acceleration",
      description:
        "Define acceleration, calculate it using a = Δv/Δt, and apply it to motion problems.",
      url: "https://www.youtube.com/watch?v=4dCrkp8qgLU&pp=ygUMQWNjZWxlcmF0aW9u",
    },
    {
      title: "Displacement, Velocity, Time",
      description:
        "Distinguish displacement from distance; solve problems using velocity = displacement/time.",
      url: "https://www.youtube.com/watch?v=-Py2zI29THg&pp=ygUcRGlzcGxhY2VtZW50LCBWZWxvY2l0eSwgVGltZQ%3D%3D",
    },
    {
      title: "Kinetic Formula",
      description:
        "Apply the kinetic energy formula KE = ½mv² to calculate energy in moving objects.",
      url: "https://www.youtube.com/watch?v=ZsfeyBynO7s&pp=ygUPS2luZXRpYyBGb3JtdWxh0gcJCcUKAYcqIYzv",
    },
    {
      title: "Projectile Motion",
      description:
        "Analyze horizontal and vertical components of projectile motion using kinematic equations.",
      url: "https://www.youtube.com/watch?v=aY8z2qO44WA&pp=ygURUHJvamVjdGlsZSBNb3Rpb24%3D",
    },
  ],
};

async function main() {
  console.log("Seeding Science resources...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "science")
    .single();
  if (subtestErr || !subtest) {
    throw new Error(`Could not find science subtest: ${subtestErr?.message}`);
  }

  let total = 0;

  for (const [topicSlug, resources] of Object.entries(SCIENCE_RESOURCES)) {
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

  console.log(`\n✅  Done! Inserted ${total} resources across ${Object.keys(SCIENCE_RESOURCES).length} topics.`);
}

main().catch((err) => {
  console.error("❌  Failed:", err.message);
  process.exit(1);
});
