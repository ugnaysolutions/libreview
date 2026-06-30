"use client";

import { useState } from "react";
import { MilestoneForm } from "./MilestoneForm";
import { DeleteMilestoneButton } from "./DeleteMilestoneButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus, FilePlus, Clock, ClipboardList, Award, GraduationCap, ExternalLink } from "lucide-react";

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  application_open: FilePlus,
  application_deadline: Clock,
  exam_date: ClipboardList,
  results_release: Award,
  enrollment: GraduationCap,
};

const MILESTONE_LABELS: Record<string, string> = {
  application_open: "Application Opens",
  application_deadline: "Application Deadline",
  exam_date: "Exam Date",
  results_release: "Results Release",
  enrollment: "Enrollment",
};

interface Milestone {
  id: string;
  exam_config_id: string;
  milestone_type: string;
  milestone_label: string;
  scheduled_date: string;
  academic_year: string;
  notes: string | null;
  is_confirmed: boolean;
  source_url: string | null;
}

interface ExamConfig {
  id: string;
  slug: string;
  name: string;
  color: string;
}

interface Props {
  exam: ExamConfig;
  milestones: Milestone[];
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MilestoneManager({ exam, milestones }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: exam.color }}
            />
            {exam.name} — Milestones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {milestones.length} milestone{milestones.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      </div>

      {showAdd && !editing && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">New Milestone</h2>
            <MilestoneForm
              examConfigId={exam.id}
              examSlug={exam.slug}
              onClose={() => setShowAdd(false)}
            />
          </CardContent>
        </Card>
      )}

      {milestones.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No milestones yet. Add one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => {
            const isPast = m.scheduled_date < today;
            const Icon = MILESTONE_ICONS[m.milestone_type] ?? ClipboardList;

            return (
              <div key={m.id}>
                <Card className={cn("rounded-2xl border-border shadow-sm", isPast && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: exam.color + "20" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: exam.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{m.milestone_label}</p>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {MILESTONE_LABELS[m.milestone_type] ?? m.milestone_type}
                          </span>
                          {!m.is_confirmed && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                              Tentative
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Past
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(m.scheduled_date)} · {m.academic_year}
                        </p>
                        {m.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">{m.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {m.source_url && (
                          <a
                            href={m.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "rounded-lg text-muted-foreground hover:text-foreground"
                            )}
                            title="View source"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => { setEditing(m.id); setShowAdd(false); }}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "rounded-lg"
                          )}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <DeleteMilestoneButton id={m.id} examSlug={exam.slug} />
                      </div>
                    </div>

                    {editing === m.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <MilestoneForm
                          examConfigId={exam.id}
                          examSlug={exam.slug}
                          milestone={m}
                          onClose={() => setEditing(null)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
