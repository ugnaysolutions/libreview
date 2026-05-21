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
] as const;

export type SubtestSlug = (typeof SUBTESTS)[number]["slug"];

export const MOCK_EXAM = {
  totalTimeSeconds: 3600,
  amberWarningSeconds: 600,
  redWarningSeconds: 300,
  subtestItemCounts: {
    "language-proficiency": 20,
    "reading-comprehension": 15,
    science: 15,
    mathematics: 10,
  },
  totalItems: 60,
} as const;

export const SCHOOL_EXAMS = {
  upcat: {
    name: "UPCAT",
    fullName: "UP College Admission Test",
    description: "All 4 subtests · 60 items · 60 minutes",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "language-proficiency": 20,
      "reading-comprehension": 15,
      science: 15,
      mathematics: 10,
    },
  },
  acet: {
    name: "ACET",
    fullName: "Ateneo College Entrance Test",
    description: "Language · Reading · Science · Math · 60 items · 60 minutes",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "acet-language-proficiency": 20,
      "acet-reading-comprehension": 15,
      "acet-science": 15,
      "acet-mathematics": 10,
    },
  },
  dlsu: {
    name: "DLSUCET",
    fullName: "De La Salle University College Entrance Test",
    description: "Math-heavy · 60 items · 60 minutes",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "dlsu-language-proficiency": 15,
      "dlsu-reading-comprehension": 10,
      "dlsu-mathematics": 25,
      "dlsu-science": 10,
    },
  },
  ust: {
    name: "USTET",
    fullName: "University of Santo Tomas Entrance Test",
    description: "Science-heavy · 60 items · 60 minutes",
    totalTimeSeconds: 3600,
    totalItems: 60,
    subtestItemCounts: {
      "ust-language-proficiency": 15,
      "ust-reading-comprehension": 15,
      "ust-science": 15,
      "ust-mathematics": 15,
    },
  },
} as const;

export type ExamType = keyof typeof SCHOOL_EXAMS;

export const PRACTICE_SESSION_QUESTION_COUNT = 10;

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
