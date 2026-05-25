export const APP_NAME = "Libreview";
export const APP_TAGLINE = "Your free path to your dream university.";

export const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  success: "#22C55E",
  error: "#EF4444",
  border: "#E2E8F0",
} as const;

export const SUBTESTS = [
  { slug: "language-proficiency", name: "Language Proficiency", icon: "📖" },
  { slug: "reading-comprehension", name: "Reading Comprehension", icon: "📝" },
  { slug: "science", name: "Science", icon: "🔬" },
  { slug: "mathematics", name: "Mathematics", icon: "📐" },
  { slug: "reasoning", name: "Reasoning", icon: "🧠" },
] as const;

export type SubtestSlug = (typeof SUBTESTS)[number]["slug"];

/** Subtests that require a Premium subscription to practice. */
export const PREMIUM_SUBTESTS: string[] = ["reasoning"];

/** Topic slugs inside language-proficiency that are Filipino-language.
 *  Excluded from non-UPCAT mock exam question pools. */
export const FILIPINO_TOPIC_SLUGS: string[] = ["filipino-grammar"];

export const MOCK_EXAM = {
  totalTimeSeconds: 3600,
  amberWarningSeconds: 600,
  redWarningSeconds: 300,
  subtestItemCounts: {
    "language-proficiency": 12,
    "reading-comprehension": 15,
    science: 15,
    mathematics: 18,
  },
  totalItems: 60,
} as const;

// All schools draw from the same shared question bank (5 core subtests).
// Only the item counts differ. Non-UPCAT exams exclude Filipino topics.
export const SCHOOL_EXAMS = {
  upcat: {
    name: "UPCAT",
    fullName: "UP College Admission Test",
    description: "Math · Reading · Science · Language · 60 items · 60 min",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 12,
      "reading-comprehension": 15,
      science: 15,
      mathematics: 18,
    },
  },
  acet: {
    name: "ACET",
    fullName: "Ateneo College Entrance Test",
    description: "Reading/Language · Reasoning · Math · 60 items · 60 min",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 15,
      "reading-comprehension": 15,
      mathematics: 15,
      reasoning: 15,
    },
  },
  dlsu: {
    name: "DCAT",
    fullName: "De La Salle College Admissions Test",
    description: "Math · Science · Language/Reading · Reasoning · 60 items · 60 min",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 7,
      "reading-comprehension": 8,
      science: 18,
      mathematics: 21,
      reasoning: 6,
    },
  },
  ust: {
    name: "USTET",
    fullName: "University of Santo Tomas Entrance Test",
    description: "Science · Math · Language/Reading · Reasoning · 60 items · 60 min",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 6,
      "reading-comprehension": 6,
      science: 21,
      mathematics: 18,
      reasoning: 9,
    },
  },
  dost: {
    name: "DOST-SEI",
    fullName: "DOST-SEI S&T Undergraduate Scholarship Exam",
    description: "English · Science · Math · Reasoning · 60 items · 130 min",
    totalTimeSeconds: 7800,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 12,
      "reading-comprehension": 12,
      science: 12,
      mathematics: 12,
      reasoning: 12,
    },
  },
} as const;

export type ExamType = keyof typeof SCHOOL_EXAMS;

export const PRACTICE_SESSION_QUESTION_COUNT = 10;
export const TIMED_PRACTICE_SECONDS_PER_QUESTION = 60;

export const FREE_PLAN = {
  dailyPracticeLimit: 2,
  dailyMockLimit: 1,
} as const;

export const ACCURACY_THRESHOLDS = {
  good: 70,
  average: 50,
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/practice", label: "Practice", icon: "BookOpen" },
  { href: "/mock-exam", label: "Mock Exam", icon: "ClipboardList" },
  { href: "/resources", label: "Resources", icon: "PlayCircle" },
  { href: "/progress", label: "Progress", icon: "BarChart2" },
] as const;
