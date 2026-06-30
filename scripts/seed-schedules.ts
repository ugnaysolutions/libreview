/**
 * Seed exam_configs and exam_schedules
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-schedules.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Exam Configs ─────────────────────────────────────────────────────────────

const EXAM_CONFIGS = [
  {
    slug: "upcat",
    name: "UPCAT",
    full_name: "University of the Philippines College Admission Test",
    color: "#0D9488",
    display_order: 1,
    is_active: true,
    university_slug: "up",
  },
  {
    slug: "acet",
    name: "ACET",
    full_name: "Ateneo College Entrance Test",
    color: "#3B82F6",
    display_order: 2,
    is_active: true,
    university_slug: "ateneo",
  },
  {
    slug: "dlsu",
    name: "DCAT",
    full_name: "De La Salle University College Admissions Test",
    color: "#22C55E",
    display_order: 3,
    is_active: true,
    university_slug: "dlsu",
  },
  {
    slug: "ust",
    name: "USTET",
    full_name: "University of Santo Tomas Entrance Test",
    color: "#F59E0B",
    display_order: 4,
    is_active: true,
    university_slug: "ust",
  },
  {
    slug: "dost",
    name: "DOST-SEI",
    full_name: "DOST Science Education Institute Merit Scholarship Exam",
    color: "#8B5CF6",
    display_order: 5,
    is_active: true,
    university_slug: null,
  },
];

// ── Exam Schedules ────────────────────────────────────────────────────────────
// Dates for AY 2026-2027. Mark is_confirmed: false for tentative/estimated dates.
// Sources: official university websites and announcements.

type MilestoneType =
  | "application_open"
  | "application_deadline"
  | "exam_date"
  | "results_release"
  | "enrollment";

interface ScheduleEntry {
  exam_slug: string;
  milestone_type: MilestoneType;
  milestone_label: string;
  scheduled_date: string;
  academic_year: string;
  notes?: string;
  is_confirmed: boolean;
  source_url?: string;
}

const SCHEDULES: ScheduleEntry[] = [
  // ── UPCAT (AY 2026-2027) ────────────────────────────────────────────────
  {
    exam_slug: "upcat",
    milestone_type: "application_open",
    milestone_label: "Online Application Opens",
    scheduled_date: "2025-06-01",
    academic_year: "AY 2026-2027",
    notes: "Applications submitted via the UPCAT online portal.",
    is_confirmed: false,
    source_url: "https://upcat.up.edu.ph",
  },
  {
    exam_slug: "upcat",
    milestone_type: "application_deadline",
    milestone_label: "Application Deadline",
    scheduled_date: "2025-08-31",
    academic_year: "AY 2026-2027",
    notes: "Last day to submit completed application form and documents.",
    is_confirmed: false,
    source_url: "https://upcat.up.edu.ph",
  },
  {
    exam_slug: "upcat",
    milestone_type: "exam_date",
    milestone_label: "UPCAT Exam Day",
    scheduled_date: "2025-10-19",
    academic_year: "AY 2026-2027",
    notes: "Held simultaneously across all UP campuses.",
    is_confirmed: false,
    source_url: "https://upcat.up.edu.ph",
  },
  {
    exam_slug: "upcat",
    milestone_type: "results_release",
    milestone_label: "Results Released",
    scheduled_date: "2026-02-28",
    academic_year: "AY 2026-2027",
    notes: "UPG (UP Grade) available online.",
    is_confirmed: false,
    source_url: "https://upcat.up.edu.ph",
  },

  // ── ACET (AY 2026-2027) ─────────────────────────────────────────────────
  {
    exam_slug: "acet",
    milestone_type: "application_open",
    milestone_label: "Online Application Opens",
    scheduled_date: "2025-07-01",
    academic_year: "AY 2026-2027",
    notes: "Apply via the Ateneo admissions portal.",
    is_confirmed: false,
    source_url: "https://www.ateneo.edu/ls/osa/admissions/acet",
  },
  {
    exam_slug: "acet",
    milestone_type: "application_deadline",
    milestone_label: "Application Deadline",
    scheduled_date: "2025-09-15",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.ateneo.edu/ls/osa/admissions/acet",
  },
  {
    exam_slug: "acet",
    milestone_type: "exam_date",
    milestone_label: "ACET Exam Day",
    scheduled_date: "2025-10-11",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.ateneo.edu/ls/osa/admissions/acet",
  },
  {
    exam_slug: "acet",
    milestone_type: "results_release",
    milestone_label: "Results Released",
    scheduled_date: "2025-12-10",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.ateneo.edu/ls/osa/admissions/acet",
  },

  // ── DCAT / DLSU (AY 2026-2027) ──────────────────────────────────────────
  {
    exam_slug: "dlsu",
    milestone_type: "application_open",
    milestone_label: "Online Application Opens",
    scheduled_date: "2025-07-15",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.dlsu.edu.ph/admissions/undergraduate/",
  },
  {
    exam_slug: "dlsu",
    milestone_type: "application_deadline",
    milestone_label: "Application Deadline",
    scheduled_date: "2025-09-30",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.dlsu.edu.ph/admissions/undergraduate/",
  },
  {
    exam_slug: "dlsu",
    milestone_type: "exam_date",
    milestone_label: "DCAT Exam Day",
    scheduled_date: "2025-11-08",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.dlsu.edu.ph/admissions/undergraduate/",
  },
  {
    exam_slug: "dlsu",
    milestone_type: "results_release",
    milestone_label: "Results Released",
    scheduled_date: "2026-01-15",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://www.dlsu.edu.ph/admissions/undergraduate/",
  },

  // ── USTET / UST (AY 2026-2027) ──────────────────────────────────────────
  {
    exam_slug: "ust",
    milestone_type: "application_open",
    milestone_label: "Online Application Opens",
    scheduled_date: "2025-06-01",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://iapply.ust.edu.ph",
  },
  {
    exam_slug: "ust",
    milestone_type: "application_deadline",
    milestone_label: "Application Deadline",
    scheduled_date: "2025-08-31",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://iapply.ust.edu.ph",
  },
  {
    exam_slug: "ust",
    milestone_type: "exam_date",
    milestone_label: "USTET Exam Day (Batch 1)",
    scheduled_date: "2025-09-14",
    academic_year: "AY 2026-2027",
    notes: "First batch. Additional batches may be added.",
    is_confirmed: false,
    source_url: "https://iapply.ust.edu.ph",
  },
  {
    exam_slug: "ust",
    milestone_type: "exam_date",
    milestone_label: "USTET Exam Day (Batch 2)",
    scheduled_date: "2025-09-21",
    academic_year: "AY 2026-2027",
    notes: "Second batch.",
    is_confirmed: false,
    source_url: "https://iapply.ust.edu.ph",
  },
  {
    exam_slug: "ust",
    milestone_type: "results_release",
    milestone_label: "Results Released",
    scheduled_date: "2025-11-30",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://iapply.ust.edu.ph",
  },

  // ── DOST-SEI (AY 2026-2027) ─────────────────────────────────────────────
  {
    exam_slug: "dost",
    milestone_type: "application_open",
    milestone_label: "Application Opens",
    scheduled_date: "2025-09-01",
    academic_year: "AY 2026-2027",
    notes: "DOST-SEI Merit Scholarship Exam for college freshman.",
    is_confirmed: false,
    source_url: "https://sei.dost.gov.ph",
  },
  {
    exam_slug: "dost",
    milestone_type: "application_deadline",
    milestone_label: "Application Deadline",
    scheduled_date: "2025-10-31",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://sei.dost.gov.ph",
  },
  {
    exam_slug: "dost",
    milestone_type: "exam_date",
    milestone_label: "DOST-SEI Exam Day",
    scheduled_date: "2025-11-30",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://sei.dost.gov.ph",
  },
  {
    exam_slug: "dost",
    milestone_type: "results_release",
    milestone_label: "Results Released",
    scheduled_date: "2026-04-30",
    academic_year: "AY 2026-2027",
    is_confirmed: false,
    source_url: "https://sei.dost.gov.ph",
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding exam_configs...");

  // Fetch university IDs for FK linkage
  const { data: universities } = await supabase
    .from("universities")
    .select("id, slug");

  const uniMap = new Map((universities ?? []).map((u: { id: string; slug: string }) => [u.slug, u.id]));

  for (const cfg of EXAM_CONFIGS) {
    const { university_slug, ...rest } = cfg;
    const university_id = university_slug ? (uniMap.get(university_slug) ?? null) : null;

    const { error } = await supabase
      .from("exam_configs")
      .upsert({ ...rest, university_id }, { onConflict: "slug" });

    if (error) {
      console.error(`  ✗ exam_config ${cfg.slug}:`, error.message);
    } else {
      console.log(`  ✓ ${cfg.name}`);
    }
  }

  // Fetch inserted configs for FK linkage
  const { data: configs } = await supabase
    .from("exam_configs")
    .select("id, slug");

  const configMap = new Map((configs ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]));

  console.log("\nSeeding exam_schedules...");

  for (const s of SCHEDULES) {
    const exam_config_id = configMap.get(s.exam_slug);
    if (!exam_config_id) {
      console.error(`  ✗ No exam_config found for slug: ${s.exam_slug}`);
      continue;
    }

    const { exam_slug, ...entry } = s;
    const { error } = await supabase
      .from("exam_schedules")
      .insert({ ...entry, exam_config_id });

    if (error) {
      // Silently skip duplicates (re-runs of the script)
      if (!error.message.includes("duplicate")) {
        console.error(`  ✗ ${s.exam_slug} / ${s.milestone_label}:`, error.message);
      } else {
        console.log(`  ~ skipped (exists): ${s.exam_slug} / ${s.milestone_label}`);
      }
    } else {
      console.log(`  ✓ ${s.exam_slug} / ${s.milestone_label}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
