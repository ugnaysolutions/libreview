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
  extra_dates: string[] | null;
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
  | { kind: "ongoing"; daysLeft: number }   // only for ranges
  | { kind: "past"; daysAgo: number };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function today0(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFrom(isoDate: string): number {
  return Math.round((new Date(isoDate + "T00:00:00").getTime() - today0().getTime()) / MS_PER_DAY);
}

function getRelativeState(
  scheduled_date: string,
  date_end: string | null,
  extra_dates: string[] | null
): RelativeState {
  // Range mode
  if (date_end) {
    const daysToEnd = daysFrom(date_end);
    if (daysToEnd < 0) return { kind: "past", daysAgo: Math.abs(daysToEnd) };
    if (daysFrom(scheduled_date) <= 0) return { kind: "ongoing", daysLeft: daysToEnd };
    return { kind: "upcoming", days: daysFrom(scheduled_date) };
  }

  // Multiple discrete dates — find the nearest future date
  if (extra_dates && extra_dates.length > 0) {
    const all = [scheduled_date, ...extra_dates].sort();
    const todayStr = today0().toISOString().slice(0, 10);
    const future = all.filter((d) => d >= todayStr);
    const past = all.filter((d) => d < todayStr);
    if (future.length === 0) {
      return { kind: "past", daysAgo: Math.abs(daysFrom(past[past.length - 1])) };
    }
    return { kind: "upcoming", days: daysFrom(future[0]) };
  }

  // Single date
  const d = daysFrom(scheduled_date);
  if (d < 0) return { kind: "past", daysAgo: Math.abs(d) };
  return { kind: "upcoming", days: d };
}

// ── Date display helpers ──────────────────────────────────────────────────────

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", opts);
}

function formatSingle(iso: string) {
  return fmt(iso, { year: "numeric", month: "long", day: "numeric" });
}

function formatRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (s.getFullYear() !== e.getFullYear()) {
    // Different year: "Dec 1, 2025 – Jan 15, 2026"
    return `${fmt(start, { month: "short", day: "numeric", year: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (s.getMonth() !== e.getMonth()) {
    // Same year, different month: "June 1 – August 31, 2025"
    return `${fmt(start, { month: "long", day: "numeric" })} – ${fmt(end, { month: "long", day: "numeric", year: "numeric" })}`;
  }
  // Same month: "September 14–21, 2025"
  return `${fmt(start, { month: "long", day: "numeric" })}–${e.getDate()}, ${s.getFullYear()}`;
}

function formatMultiple(dates: string[]) {
  const sorted = [...dates].sort();
  if (sorted.length === 1) return formatSingle(sorted[0]);

  // Group by year+month
  type Group = { year: number; month: number; days: number[] };
  const groups: Group[] = [];
  for (const iso of sorted) {
    const d = new Date(iso + "T00:00:00");
    const g = groups.find((g) => g.year === d.getFullYear() && g.month === d.getMonth());
    if (g) g.days.push(d.getDate());
    else groups.push({ year: d.getFullYear(), month: d.getMonth(), days: [d.getDate()] });
  }

  const parts = groups.map((g, gi) => {
    const monthName = new Date(g.year, g.month, 1).toLocaleDateString("en-PH", { month: "long" });
    const dayList = g.days.map((d, i) => {
      if (i < g.days.length - 1) return String(d);
      // Last day in this group: include year if last group
      return gi === groups.length - 1 ? `${d}, ${g.year}` : String(d);
    });
    const dayStr =
      dayList.length === 1
        ? dayList[0]
        : `${dayList.slice(0, -1).join(", ")} & ${dayList[dayList.length - 1]}`;
    return `${monthName} ${dayStr}`;
  });

  return parts.join(" · ");
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  milestone: MilestoneCardData;
  compact?: boolean;
}

export function MilestoneCard({ milestone, compact = false }: Props) {
  const [state, setState] = useState<RelativeState | null>(null);

  useEffect(() => {
    setState(getRelativeState(milestone.scheduled_date, milestone.date_end, milestone.extra_dates));
  }, [milestone.scheduled_date, milestone.date_end, milestone.extra_dates]);

  const Icon = MILESTONE_ICONS[milestone.milestone_type] ?? ClipboardList;
  const { color, name: examName } = milestone.exam_configs;

  const isPast = state?.kind === "past";
  const isOngoing = state?.kind === "ongoing";
  const hasRange = !!milestone.date_end;
  const hasMultiple = !hasRange && !!milestone.extra_dates?.length;

  // Date display
  const dateDisplay = hasRange
    ? formatRange(milestone.scheduled_date, milestone.date_end!)
    : hasMultiple
    ? formatMultiple([milestone.scheduled_date, ...milestone.extra_dates!])
    : formatSingle(milestone.scheduled_date);

  // Pill
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

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
        isPast && "opacity-60"
      )}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: color }}
      />

      <div className={cn("flex items-start gap-4 pl-5", compact ? "p-3 pl-5" : "p-4 pl-5")}>
        <div
          className={cn(
            "rounded-xl flex items-center justify-center shrink-0",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
          style={{ backgroundColor: color + "18" }}
        >
          <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} style={{ color }} />
        </div>

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
