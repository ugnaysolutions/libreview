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
  date_end: string | null;
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

type RelativeState =
  | { kind: "upcoming"; days: number }
  | { kind: "ongoing"; daysLeft: number }
  | { kind: "past"; daysAgo: number };

function getRelativeState(scheduled_date: string, date_end: string | null): RelativeState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(scheduled_date + "T00:00:00");
  const end = date_end ? new Date(date_end + "T00:00:00") : null;
  const msPerDay = 1000 * 60 * 60 * 24;

  const daysToStart = Math.round((start.getTime() - today.getTime()) / msPerDay);

  if (end) {
    const daysToEnd = Math.round((end.getTime() - today.getTime()) / msPerDay);
    if (daysToEnd < 0) return { kind: "past", daysAgo: Math.abs(daysToEnd) };
    if (daysToStart <= 0) return { kind: "ongoing", daysLeft: daysToEnd };
    return { kind: "upcoming", days: daysToStart };
  }

  if (daysToStart < 0) return { kind: "past", daysAgo: Math.abs(daysToStart) };
  return { kind: "upcoming", days: daysToStart };
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const sameYear = s.getFullYear() === e.getFullYear();
  if (sameYear) {
    const startStr = s.toLocaleDateString("en-PH", { month: "long", day: "numeric" });
    const endStr = e.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
    return `${startStr} – ${endStr}`;
  }
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

interface Props {
  milestone: MilestoneCardData;
  compact?: boolean;
}

export function MilestoneCard({ milestone, compact = false }: Props) {
  const [state, setState] = useState<RelativeState | null>(null);

  useEffect(() => {
    setState(getRelativeState(milestone.scheduled_date, milestone.date_end));
  }, [milestone.scheduled_date, milestone.date_end]);

  const Icon = MILESTONE_ICONS[milestone.milestone_type] ?? ClipboardList;
  const { color, name: examName } = milestone.exam_configs;
  const isPast = state?.kind === "past";
  const isOngoing = state?.kind === "ongoing";
  const hasRange = !!milestone.date_end;

  function pillContent() {
    if (!state) return null;
    if (state.kind === "past") return `${state.daysAgo}d ago`;
    if (state.kind === "ongoing") return state.daysLeft === 0 ? "Ends today" : `${state.daysLeft}d left`;
    if (state.days === 0) return "Today";
    return `In ${state.days}d`;
  }

  function pillColors() {
    if (!state) return "bg-muted text-muted-foreground";
    if (state.kind === "past") return "bg-muted text-muted-foreground";
    if (state.kind === "ongoing") return "bg-green-50 text-green-700";
    const { days } = state;
    if (days <= 7) return "bg-red-50 text-red-600";
    if (days <= 30) return "bg-amber-50 text-amber-600";
    return "bg-primary/10 text-primary";
  }

  const dateDisplay = hasRange
    ? formatDateRange(milestone.scheduled_date, milestone.date_end!)
    : formatDate(milestone.scheduled_date);

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
          <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} style={{ color }} />
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
                {isOngoing && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    Ongoing
                  </span>
                )}
                {!milestone.is_confirmed && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    Tentative
                  </span>
                )}
              </div>

              {!compact && (
                <p className="text-xs text-muted-foreground mt-1">
                  {dateDisplay} · {milestone.academic_year}
                </p>
              )}
              {compact && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{dateDisplay}</p>
              )}
              {!compact && milestone.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">{milestone.notes}</p>
              )}
            </div>

            {/* Pill + source link */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {state !== null && (
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", pillColors())}>
                  {pillContent()}
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
