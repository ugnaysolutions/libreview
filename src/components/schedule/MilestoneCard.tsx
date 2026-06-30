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

export type DatePrecision = "exact" | "month" | "year";

export interface MilestoneCardData {
  id: string;
  milestone_type: string;
  milestone_label: string;
  scheduled_date: string;
  date_end: string | null;
  extra_dates: string[] | null;
  date_precision: DatePrecision;
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

// ── Relative state ────────────────────────────────────────────────────────────

type RelativeState =
  | { kind: "upcoming"; label: string }
  | { kind: "ongoing"; label: string }
  | { kind: "past"; label: string };

const MS_PER_DAY = 86_400_000;

function today0(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function todayStr(): string {
  return today0().toISOString().slice(0, 10);
}

function daysFrom(iso: string) {
  return Math.round((new Date(iso + "T00:00:00").getTime() - today0().getTime()) / MS_PER_DAY);
}
function monthsFrom(iso: string) {
  const t = today0();
  const d = new Date(iso + "T00:00:00");
  return (d.getFullYear() - t.getFullYear()) * 12 + (d.getMonth() - t.getMonth());
}
function yearsFrom(iso: string) {
  return new Date(iso + "T00:00:00").getFullYear() - today0().getFullYear();
}

function upcomingLabel(iso: string, precision: DatePrecision): string {
  if (precision === "year") {
    const y = yearsFrom(iso);
    return y <= 0 ? "This year" : `In ${y}yr`;
  }
  if (precision === "month") {
    const mo = monthsFrom(iso);
    if (mo < 0) return "This month";
    if (mo === 0) return "This month";
    return `In ~${mo}mo`;
  }
  const d = daysFrom(iso);
  if (d === 0) return "Today";
  return `In ${d}d`;
}

function pastLabel(iso: string, precision: DatePrecision): string {
  if (precision === "year") {
    const y = Math.abs(yearsFrom(iso));
    return y === 0 ? "This year" : `${y}yr ago`;
  }
  if (precision === "month") {
    const mo = Math.abs(monthsFrom(iso));
    return mo === 0 ? "This month" : `${mo}mo ago`;
  }
  return `${Math.abs(daysFrom(iso))}d ago`;
}

function isPastDate(iso: string, precision: DatePrecision): boolean {
  if (precision === "year") {
    return new Date(iso + "T00:00:00").getFullYear() < today0().getFullYear();
  }
  if (precision === "month") {
    return monthsFrom(iso) < 0;
  }
  return iso < todayStr();
}

function getRelativeState(
  scheduled_date: string,
  date_end: string | null,
  extra_dates: string[] | null,
  precision: DatePrecision
): RelativeState {
  // Range
  if (date_end) {
    if (isPastDate(date_end, precision)) {
      return { kind: "past", label: pastLabel(date_end, precision) };
    }
    if (isPastDate(scheduled_date, precision)) {
      // started → ongoing
      const endLabel = precision === "year"
        ? `ends ${yearsFrom(date_end) === 0 ? "this year" : "in " + yearsFrom(date_end) + "yr"}`
        : precision === "month"
        ? `${Math.abs(monthsFrom(date_end))}mo left`
        : `${Math.abs(daysFrom(date_end))}d left`;
      return { kind: "ongoing", label: endLabel };
    }
    return { kind: "upcoming", label: upcomingLabel(scheduled_date, precision) };
  }

  // Multiple discrete dates — nearest future wins
  if (extra_dates?.length) {
    const all = [scheduled_date, ...extra_dates].sort();
    const ts = todayStr();
    const future = all.filter((d) => !isPastDate(d, precision));
    if (future.length === 0) {
      return { kind: "past", label: pastLabel(all[all.length - 1], precision) };
    }
    return { kind: "upcoming", label: upcomingLabel(future[0], precision) };
  }

  // Single
  if (isPastDate(scheduled_date, precision)) {
    return { kind: "past", label: pastLabel(scheduled_date, precision) };
  }
  return { kind: "upcoming", label: upcomingLabel(scheduled_date, precision) };
}

// ── Date display helpers ──────────────────────────────────────────────────────

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-PH", opts);
}

function displayDate(iso: string, precision: DatePrecision): string {
  if (precision === "year") return String(new Date(iso + "T00:00:00").getFullYear());
  if (precision === "month") return fmt(iso, { year: "numeric", month: "long" });
  return fmt(iso, { year: "numeric", month: "long", day: "numeric" });
}

function displayDateShort(iso: string, precision: DatePrecision): string {
  if (precision === "year") return String(new Date(iso + "T00:00:00").getFullYear());
  if (precision === "month") return fmt(iso, { year: "numeric", month: "short" });
  return fmt(iso, { year: "numeric", month: "short", day: "numeric" });
}

function formatRange(start: string, end: string, precision: DatePrecision): string {
  if (precision === "year") {
    const sy = new Date(start + "T00:00:00").getFullYear();
    const ey = new Date(end + "T00:00:00").getFullYear();
    return sy === ey ? String(sy) : `${sy} – ${ey}`;
  }
  if (precision === "month") {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    if (s.getFullYear() === e.getFullYear()) {
      return `${fmt(start, { month: "long" })} – ${fmt(end, { month: "long", year: "numeric" })}`;
    }
    return `${displayDate(start, "month")} – ${displayDate(end, "month")}`;
  }
  // Exact range (original logic)
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (s.getFullYear() !== e.getFullYear()) {
    return `${displayDateShort(start, "exact")} – ${displayDateShort(end, "exact")}`;
  }
  if (s.getMonth() !== e.getMonth()) {
    return `${fmt(start, { month: "long", day: "numeric" })} – ${fmt(end, { month: "long", day: "numeric", year: "numeric" })}`;
  }
  return `${fmt(start, { month: "long", day: "numeric" })}–${e.getDate()}, ${s.getFullYear()}`;
}

function formatMultiple(dates: string[], precision: DatePrecision): string {
  const sorted = [...dates].sort();
  if (sorted.length === 1) return displayDate(sorted[0], precision);

  if (precision === "year") {
    const years = sorted.map((d) => new Date(d + "T00:00:00").getFullYear());
    const unique = [...new Set(years)];
    return unique.length === 1 ? String(unique[0])
      : unique.slice(0, -1).join(", ") + " & " + unique[unique.length - 1];
  }

  if (precision === "month") {
    // Group by year, list months
    const byYear = new Map<number, string[]>();
    for (const d of sorted) {
      const dt = new Date(d + "T00:00:00");
      const yr = dt.getFullYear();
      const mo = dt.toLocaleDateString("en-PH", { month: "long" });
      const arr = byYear.get(yr) ?? [];
      if (!arr.includes(mo)) arr.push(mo);
      byYear.set(yr, arr);
    }
    return [...byYear.entries()]
      .map(([yr, months]) => {
        const joined = months.length === 1 ? months[0]
          : months.slice(0, -1).join(", ") + " & " + months[months.length - 1];
        return `${joined} ${yr}`;
      })
      .join(" · ");
  }

  // Exact: group by year+month
  type Group = { year: number; month: number; days: number[] };
  const groups: Group[] = [];
  for (const iso of sorted) {
    const d = new Date(iso + "T00:00:00");
    const g = groups.find((g) => g.year === d.getFullYear() && g.month === d.getMonth());
    if (g) g.days.push(d.getDate());
    else groups.push({ year: d.getFullYear(), month: d.getMonth(), days: [d.getDate()] });
  }
  return groups.map((g, gi) => {
    const monthName = new Date(g.year, g.month, 1).toLocaleDateString("en-PH", { month: "long" });
    const dayList = g.days.map((d, i) =>
      i === g.days.length - 1 && gi === groups.length - 1
        ? `${d}, ${g.year}` : String(d)
    );
    const dayStr = dayList.length === 1 ? dayList[0]
      : dayList.slice(0, -1).join(", ") + " & " + dayList[dayList.length - 1];
    return `${monthName} ${dayStr}`;
  }).join(" · ");
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  milestone: MilestoneCardData;
  compact?: boolean;
}

export function MilestoneCard({ milestone, compact = false }: Props) {
  const [state, setState] = useState<RelativeState | null>(null);
  const { date_precision: precision } = milestone;

  useEffect(() => {
    setState(getRelativeState(
      milestone.scheduled_date, milestone.date_end,
      milestone.extra_dates, precision
    ));
  }, [milestone.scheduled_date, milestone.date_end, milestone.extra_dates, precision]);

  const Icon = MILESTONE_ICONS[milestone.milestone_type] ?? ClipboardList;
  const { color, name: examName } = milestone.exam_configs;
  const isPast = state?.kind === "past";
  const isOngoing = state?.kind === "ongoing";

  const dateDisplay = milestone.date_end
    ? formatRange(milestone.scheduled_date, milestone.date_end, precision)
    : milestone.extra_dates?.length
    ? formatMultiple([milestone.scheduled_date, ...milestone.extra_dates], precision)
    : displayDate(milestone.scheduled_date, precision);

  function pillColors() {
    if (!state || state.kind === "past") return "bg-muted text-muted-foreground";
    if (state.kind === "ongoing") return "bg-green-50 text-green-700";
    const label = state.label;
    if (label.includes("Today") || label.includes("This month") || label.includes("This year"))
      return "bg-red-50 text-red-600";
    if (label.startsWith("In 1") || label.match(/^In [1-2]\d?d/)) return "bg-red-50 text-red-600";
    if (label.match(/^In [1-3]\d?d|^In ~[1-2]mo/)) return "bg-amber-50 text-amber-600";
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
                {precision !== "exact" && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {precision === "month" ? "Month TBD" : "Year TBD"}
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
                  {state.label}
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
