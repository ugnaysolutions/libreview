import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClipboardList, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_EXAM } from "@/lib/constants";
import { StartMockExamButton } from "./StartMockExamButton";

const SUBTEST_ROWS = [
  { name: "Language Proficiency", items: MOCK_EXAM.subtestItemCounts["language-proficiency"] },
  { name: "Reading Comprehension", items: MOCK_EXAM.subtestItemCounts["reading-comprehension"] },
  { name: "Science", items: MOCK_EXAM.subtestItemCounts["science"] },
  { name: "Mathematics", items: MOCK_EXAM.subtestItemCounts["mathematics"] },
];

export default async function MockExamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if there's an existing in-progress mock exam
  const { data: existing } = await supabase
    .from("exam_sessions")
    .select("id, started_at")
    .eq("user_id", user.id)
    .eq("session_type", "mock_exam")
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Mock Exam
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Simulate real UPCAT conditions
        </p>
      </div>

      {/* Hero */}
      <Card className="bg-primary text-white border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading leading-tight">
                UPCAT Mock Exam
              </h2>
              <p className="text-sm opacity-80">
                {MOCK_EXAM.totalItems} items · 60 minutes · All 4 subtests
              </p>
            </div>
          </div>

          {/* Subtest breakdown */}
          <div className="bg-white/10 rounded-xl p-4 space-y-2">
            {SUBTEST_ROWS.map((row) => (
              <div key={row.name} className="flex justify-between text-sm">
                <span className="opacity-90">{row.name}</span>
                <span className="font-semibold">{row.items} items</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>{MOCK_EXAM.totalItems} items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">60 Minutes</p>
              <p className="text-xs text-muted-foreground">Timed exam</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {MOCK_EXAM.totalItems} Questions
              </p>
              <p className="text-xs text-muted-foreground">
                Multiple choice
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-800">
            Before you start
          </p>
          <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
            <li>Do not close this tab once the exam starts</li>
            <li>The timer continues even if you refresh the page</li>
            <li>Answers cannot be changed once submitted</li>
            <li>The exam auto-submits when time runs out</li>
          </ul>
        </div>
      </div>

      {existing ? (
        <div className="space-y-3">
          <StartMockExamButton existingSessionId={existing.id} />
          <p className="text-center text-xs text-muted-foreground">
            You have an in-progress exam. Resuming will continue from where you left off.
          </p>
        </div>
      ) : (
        <StartMockExamButton />
      )}
    </div>
  );
}
