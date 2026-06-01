import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL_EXAMS, type ExamType } from "@/lib/constants";

interface ExamTarget {
  id: string;
  exam_type: string;
  exam_date: string;
}

interface Props {
  targets: ExamTarget[];
  legacyExamDate?: string | null;
}

function ExamCard({ examType, examDate }: { examType: string; examDate: string }) {
  const exam = SCHOOL_EXAMS[examType as ExamType];
  const label = exam?.name ?? examType.toUpperCase();
  const days = differenceInCalendarDays(parseISO(examDate), new Date());
  const formattedDate = format(parseISO(examDate), "MMM d, yyyy");
  const isPast = days < 0;

  return (
    <Card className="rounded-2xl border-border shadow-sm shrink-0 w-36">
      <CardContent className="p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-primary mb-0.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-semibold truncate">{label}</span>
        </div>
        {isPast ? (
          <p className="text-xs text-muted-foreground">Exam passed</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground leading-none">{days}</p>
            <p className="text-xs text-muted-foreground">days away</p>
          </>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">{formattedDate}</p>
      </CardContent>
    </Card>
  );
}

export function ExamTargetsCarousel({ targets, legacyExamDate }: Props) {
  const hasTargets = targets.length > 0;

  if (!hasTargets && !legacyExamDate) {
    return (
      <Link href="/settings#exams">
        <Card className="rounded-2xl border-dashed border-border shadow-sm hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Add exam targets</p>
              <p className="text-xs text-muted-foreground">Track countdowns for each exam</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (!hasTargets && legacyExamDate) {
    const days = differenceInCalendarDays(parseISO(legacyExamDate), new Date());
    return (
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            {days >= 0 ? (
              <>
                <p className="text-2xl font-bold text-foreground leading-none">{days}</p>
                <p className="text-xs text-muted-foreground mt-0.5">days until exam</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">Exam date</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <Link href="/settings#exams" className="text-primary underline-offset-2 hover:underline">
                    Update in settings
                  </Link>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>
        {targets.map((t) => (
          <ExamCard key={t.id} examType={t.exam_type} examDate={t.exam_date} />
        ))}
        <Link href="/settings#exams">
          <Card className="rounded-2xl border-dashed border-border shadow-sm shrink-0 w-36 h-full hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-1 h-full min-h-[100px]">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground text-center">Manage exams</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
