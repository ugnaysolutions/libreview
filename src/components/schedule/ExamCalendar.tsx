"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MilestoneCardData } from "./MilestoneCard";
import { MilestoneCard } from "./MilestoneCard";

interface Props {
  milestones: MilestoneCardData[];
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function ExamCalendar({ milestones }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // For each day, gather milestones that are relevant:
  //   - single date: scheduled_date == day
  //   - range: scheduled_date <= day <= date_end
  //   - multiple discrete: scheduled_date == day OR day in extra_dates
  function getMilestonesForDay(ds: string): MilestoneCardData[] {
    return milestones.filter((m) => {
      if (m.date_end) return m.scheduled_date <= ds && ds <= m.date_end;
      if (m.extra_dates?.length) return m.scheduled_date === ds || m.extra_dates.includes(ds);
      return m.scheduled_date === ds;
    });
  }

  // Build per-day dot colors (deduplicated by exam slug)
  // We compute lazily in render, but pre-compute the "has any" check per day for performance.
  // For range milestones that span across months we still want to mark days in this month.

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedMilestones = selectedDate ? getMilestonesForDay(selectedDate) : [];

  // Legend: exams that have any milestone touching this month
  const legendExams = new Map<string, { name: string; color: string }>();
  for (const m of milestones) {
    const monthStart = dateStr(1);
    const monthEnd = dateStr(daysInMonth);
    const allDates = [m.scheduled_date, ...(m.extra_dates ?? [])];
    const touches = m.date_end
      ? m.scheduled_date <= monthEnd && m.date_end >= monthStart
      : allDates.some((d) => d >= monthStart && d <= monthEnd);
    if (touches) legendExams.set(m.exam_configs.slug, m.exam_configs);
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="bg-muted/30 min-h-[52px]" />;
          }

          const ds = dateStr(day);
          const dayMilestones = getMilestonesForDay(ds);
          const hasMilestones = dayMilestones.length > 0;
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const isPast = ds < todayStr;

          // Deduplicated dot colors for this day
          const dotColors = [...new Map(
            dayMilestones.map(m => [m.exam_configs.slug, m.exam_configs.color])
          ).values()];

          // Detect range milestones: mark if day is strictly between start and end (not start/end themselves)
          const isInsideRange = dayMilestones.some(
            m => m.date_end && m.scheduled_date < ds && ds < m.date_end
          );
          const isRangeStart = dayMilestones.some(
            m => m.date_end && m.scheduled_date === ds
          );
          const isRangeEnd = dayMilestones.some(
            m => m.date_end && m.date_end === ds
          );

          return (
            <button
              key={ds}
              onClick={() => hasMilestones ? setSelectedDate(isSelected ? null : ds) : undefined}
              className={cn(
                "bg-card min-h-[52px] flex flex-col items-center py-2 px-1 gap-1 transition-colors focus:outline-none relative",
                isSelected && "bg-primary/10",
                !isSelected && hasMilestones && "hover:bg-muted/60",
                !isSelected && !hasMilestones && "cursor-default",
                isPast && !hasMilestones && "opacity-40",
                // Subtle background tint for days inside an active range
                isInsideRange && !isSelected && "bg-primary/5"
              )}
              disabled={!hasMilestones}
            >
              <span
                className={cn(
                  "text-xs font-medium leading-none h-5 w-5 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-white font-bold",
                  !isToday && isPast && "text-muted-foreground",
                  !isToday && !isPast && "text-foreground",
                  // Range boundary indicators
                  (isRangeStart || isRangeEnd) && !isToday && "ring-1 ring-current ring-offset-0"
                )}
              >
                {day}
              </span>
              {dotColors.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {dotColors.slice(0, 4).map((color, ci) => (
                    <span
                      key={ci}
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {legendExams.size > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {[...legendExams.values()].map((e) => (
            <span key={e.name} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
              {e.name}
            </span>
          ))}
        </div>
      )}

      {/* Selected day milestones */}
      {selectedDate && selectedMilestones.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </p>
          {selectedMilestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} />
          ))}
        </div>
      )}
    </div>
  );
}
