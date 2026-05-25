import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Clock, BookOpen, AlertTriangle, Lock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL_EXAMS } from "@/lib/constants";
import { isPremium } from "@/lib/plan";
import { StartMockExamButton } from "./StartMockExamButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExamType } from "@/lib/constants";

const SCHOOL_ORDER: ExamType[] = ["upcat", "acet", "dlsu", "ust", "dost"];

function isValidExamType(val: string | undefined): val is ExamType {
  return !!val && val in SCHOOL_EXAMS;
}

export default async function MockExamPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam: examParam } = await searchParams;
  const examType: ExamType = isValidExamType(examParam) ? examParam : "upcat";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [premium, existingRes] = await Promise.all([
    isPremium(user.id),
    supabase
      .from("exam_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_type", "mock_exam")
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const existing = existingRes.data;
  const examConfig = SCHOOL_EXAMS[examType];
  const isLocked = examType !== "upcat" && !premium;

  const subtestRows = Object.entries(examConfig.subtestItemCounts).map(
    ([slug, items]) => ({
      name: slug
        .replace(/^(acet|dlsu|ust)-/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      items,
    })
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Mock Exam
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Simulate real entrance exam conditions
        </p>
      </div>

      {/* School selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SCHOOL_ORDER.map((key) => {
          const school = SCHOOL_EXAMS[key];
          const locked = key !== "upcat" && !premium;
          const active = key === examType;
          return (
            <Link
              key={key}
              href={`/mock-exam?exam=${key}`}
              className={cn(
                "flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {school.name}
              {locked && <Lock className="h-3 w-3" />}
            </Link>
          );
        })}
      </div>

      {/* Exam hero card */}
      <Card
        className={cn(
          "border-0 shadow-md rounded-2xl overflow-hidden",
          isLocked ? "opacity-75" : ""
        )}
      >
        <CardContent
          className={cn(
            "p-6 space-y-4",
            isLocked ? "bg-muted" : "bg-primary text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                isLocked ? "bg-muted-foreground/20" : "bg-white/20"
              )}
            >
              <ClipboardList
                className={cn("h-6 w-6", isLocked ? "text-muted-foreground" : "")}
              />
            </div>
            <div>
              <h2
                className={cn(
                  "text-lg font-bold font-heading leading-tight",
                  isLocked ? "text-foreground" : ""
                )}
              >
                {examConfig.fullName}
              </h2>
              <p
                className={cn(
                  "text-sm",
                  isLocked ? "text-muted-foreground" : "opacity-80"
                )}
              >
                {examConfig.description}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl p-4 space-y-2",
              isLocked ? "bg-border/40" : "bg-white/10"
            )}
          >
            {subtestRows.map((row) => (
              <div
                key={row.name}
                className={cn(
                  "flex justify-between text-sm",
                  isLocked ? "text-muted-foreground" : ""
                )}
              >
                <span className={isLocked ? "" : "opacity-90"}>{row.name}</span>
                <span className="font-semibold">{row.items} items</span>
              </div>
            ))}
            <div
              className={cn(
                "border-t pt-2 flex justify-between text-sm font-bold",
                isLocked ? "border-border" : "border-white/20"
              )}
            >
              <span>Total</span>
              <span>{examConfig.totalItems} items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info strip */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {Math.round(examConfig.totalTimeSeconds / 60)} Minutes
              </p>
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
                {examConfig.totalItems} Questions
              </p>
              <p className="text-xs text-muted-foreground">Multiple choice</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-800">Before you start</p>
          <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
            <li>Do not close this tab once the exam starts</li>
            <li>The timer continues even if you refresh the page</li>
            <li>Answers cannot be changed once submitted</li>
            <li>The exam auto-submits when time runs out</li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      {isLocked ? (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-100">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-foreground">Premium feature</p>
            <p className="text-sm text-muted-foreground mt-1">
              {examConfig.name} mock exams are available on Premium. Upgrade to
              unlock all 4 school exams.
            </p>
          </div>
          <Link
            href="/upgrade"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade to Premium
          </Link>
        </div>
      ) : existing ? (
        <div className="space-y-3">
          <StartMockExamButton existingSessionId={existing.id} examType={examType} />
          <p className="text-center text-xs text-muted-foreground">
            You have an in-progress exam. Resuming will continue from where you
            left off.
          </p>
        </div>
      ) : (
        <StartMockExamButton examType={examType} />
      )}
    </div>
  );
}
