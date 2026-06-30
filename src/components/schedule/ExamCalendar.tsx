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
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build a map: "YYYY-MM-DD" → MilestoneCardData[]
  const byDate = new Map<string, MilestoneCardData[]>();
  for (const m of milestones) {
    const list = byDate.get(m.scheduled_date) ?? [];
    list.push(m);
    byDate.set(m.scheduled_date, list);
  }

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

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedMilestones = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  // Unique exam colors for legend (from milestones in current month)
  const legendExams = new Map<string, { name: string; color: string }>();
  for (const m of milestones) {
    const [y, mo] = m.scheduled_date.split("-").map(Number);
    if (y === year && mo - 1 === month) {
      legendExams.set(m.exam_configs.slug, m.exam_configs);
    }
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
          const hasMilestones = byDate.has(ds);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const isPast = ds < todayStr;
          const dots = hasMilestones ? byDate.get(ds)! : [];

          // Deduplicate exam colors for dots
          const dotColors = [...new Map(dots.map(m => [m.exam_configs.slug, m.exam_configs.color])).values()];

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(isSelected ? null : ds)}
              className={cn(
                "bg-card min-h-[52px] flex flex-col items-center py-2 px-1 gap-1 transition-colors focus:outline-none",
                isSelected && "bg-primary/10",
                !isSelected && hasMilestones && "hover:bg-muted/60",
                !isSelected && !hasMilestones && "hover:bg-muted/30 cursor-default",
                isPast && !hasMilestones && "opacity-40"
              )}
              disabled={!hasMilestones}
            >
              <span
                className={cn(
                  "text-xs font-medium leading-none h-5 w-5 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-white font-bold",
                  !isToday && isPast && "text-muted-foreground",
                  !isToday && !isPast && "text-foreground"
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
        <div className="flex flex-wrap gap-2 pt-1">
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
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          {selectedMilestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} />
          ))}
        </div>
      )}
    </div>
  );
}
