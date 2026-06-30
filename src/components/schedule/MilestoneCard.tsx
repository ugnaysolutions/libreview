"use client";

import { useEffect, useState } from "react";
import { FilePlus, Clock, ClipboardList, Award, GraduationCap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  application_open: FilePlus,
  application_deadline: Clock,
  exam_date: ClipboardList,
  results_release: Award,
  enrollment: GraduationCap,
};

export interface MilestoneCardData {
  id: string;
  milestone_type: string;
  milestone_label: string;
  scheduled_date: string;
  academic_year: string;
  notes: string | null;
  is_confirmed: boolean;
  source_url: string | null;
  exam_configs: {
    name: string;
    slug: string;
    color: string;
  };
}

function getDaysRelative(dateStr: string): { days: number; past: boolean } {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { days: Math.abs(diff), past: diff < 0 };
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  milestone: MilestoneCardData;
  compact?: boolean;
}

export function MilestoneCard({ milestone, compact = false }: Props) {
  const [relative, setRelative] = useState<{ days: number; past: boolean } | null>(null);

  useEffect(() => {
    setRelative(getDaysRelative(milestone.scheduled_date));
  }, [milestone.scheduled_date]);

  const Icon = MILESTONE_ICONS[milestone.milestone_type] ?? ClipboardList;
  const { color, name: examName } = milestone.exam_configs;
  const isPast = relative?.past ?? false;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
        isPast && "opacity-60"
      )}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: color }}
      />

      <div className={cn("flex items-start gap-4 pl-5", compact ? "p-3 pl-5" : "p-4 pl-5")}>
        {/* Icon */}
        <div
          className={cn(
            "rounded-xl flex items-center justify-center shrink-0",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
          style={{ backgroundColor: color + "18" }}
        >
          <Icon
            className={cn(compact ? "h-4 w-4" : "h-5 w-5")}
            style={{ color }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("font-semibold text-foreground leading-snug", compact ? "text-xs" : "text-sm")}>
                {milestone.milestone_label}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: color }}
                >
                  {examName}
                </span>
                {!milestone.is_confirmed && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    Tentative
                  </span>
                )}
              </div>
              {!compact && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(milestone.scheduled_date)} · {milestone.academic_year}
                </p>
              )}
              {compact && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDate(milestone.scheduled_date)}
                </p>
              )}
              {!compact && milestone.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">{milestone.notes}</p>
              )}
            </div>

            {/* Days pill + source link */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {relative !== null && (
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                    isPast
                      ? "bg-muted text-muted-foreground"
                      : relative.days <= 7
                      ? "bg-red-50 text-red-600"
                      : relative.days <= 30
                      ? "bg-amber-50 text-amber-600"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {isPast
                    ? `${relative.days}d ago`
                    : relative.days === 0
                    ? "Today"
                    : `In ${relative.days}d`}
                </span>
              )}
              {!compact && milestone.source_url && (
                <a
                  href={milestone.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View source"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
