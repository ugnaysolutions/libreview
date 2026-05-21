import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResolveButton } from "@/components/admin/ResolveButton";
import { format, parseISO } from "date-fns";

const REASON_LABELS: Record<string, string> = {
  wrong_answer_key: "Wrong answer key",
  typo_or_grammar_error: "Typo / grammar error",
  confusing_or_unclear: "Confusing or unclear",
  image_not_loading: "Image not loading",
  not_relevant_to_upcat: "Not relevant to UPCAT",
  others: "Others",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ resolved?: string }>;
}) {
  const { resolved } = await searchParams;
  const showResolved = resolved === "1";
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("question_reports")
    .select(
      "id, reason, notes, is_resolved, created_at, questions(id, question_text), user_id"
    )
    .eq("is_resolved", showResolved)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Student-reported question issues
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-border text-sm">
          <Link
            href="/admin/reports"
            className={cn(
              "px-3 py-1.5 transition-colors",
              !showResolved
                ? "bg-primary text-white font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Open
          </Link>
          <Link
            href="/admin/reports?resolved=1"
            className={cn(
              "px-3 py-1.5 transition-colors",
              showResolved
                ? "bg-primary text-white font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Resolved
          </Link>
        </div>
      </div>

      {!reports || reports.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No {showResolved ? "resolved" : "open"} reports.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const question = report.questions as unknown as {
              id: string;
              question_text: string;
            } | null;
            return (
              <Card
                key={report.id}
                className="rounded-2xl border-border shadow-sm"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Question preview */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground line-clamp-2 flex-1">
                      {question?.question_text ?? "Question not found"}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {question && (
                        <Link
                          href={`/admin/questions/${question.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "rounded-xl text-xs"
                          )}
                        >
                          Edit Q
                        </Link>
                      )}
                      {!showResolved && <ResolveButton id={report.id} />}
                    </div>
                  </div>

                  {/* Report details */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5"
                    >
                      {REASON_LABELS[report.reason] ?? report.reason}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(parseISO(report.created_at), "MMM d, yyyy")}
                    </span>
                    {report.is_resolved && (
                      <span className="text-green-600 font-medium">
                        ✓ Resolved
                      </span>
                    )}
                  </div>

                  {report.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      &ldquo;{report.notes}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
