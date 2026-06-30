"use client";

import { useState } from "react";
import { List, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MilestoneCard, type MilestoneCardData } from "@/components/schedule/MilestoneCard";
import { ExamCalendar } from "@/components/schedule/ExamCalendar";

interface ExamConfig {
  id: string;
  slug: string;
  name: string;
  color: string;
}

interface Props {
  milestones: MilestoneCardData[];
  examConfigs: ExamConfig[];
  today: string; // ISO YYYY-MM-DD, computed server-side
}

type View = "list" | "calendar";

export function ScheduleClient({ milestones, examConfigs, today }: Props) {
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<string>("all");
  const [showPast, setShowPast] = useState(false);

  const filtered = filter === "all"
    ? milestones
    : milestones.filter((m) => m.exam_configs.slug === filter);

  // A milestone is "active/upcoming" if it hasn't fully ended yet.
  // For ranges: active until date_end passes. For single dates: active until scheduled_date passes.
  const upcoming = filtered.filter((m) => (m.date_end ?? m.scheduled_date) >= today);
  const past = filtered.filter((m) => (m.date_end ?? m.scheduled_date) < today).reverse();

  return (
    <div className="space-y-5">
      {/* Filter chips + view toggle */}
      <div className="flex items-center justify-between gap-3">
        {/* Scrollable filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0 scrollbar-none">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
              filter === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            All
          </button>
          {examConfigs.map((e) => (
            <button
              key={e.slug}
              onClick={() => setFilter(e.slug)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                filter === e.slug
                  ? "text-white border-transparent"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
              style={
                filter === e.slug
                  ? { backgroundColor: e.color, borderColor: e.color }
                  : {}
              }
            >
              {e.name}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 shrink-0">
          <button
            onClick={() => setView("list")}
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
              view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
              view === "calendar" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Calendar view"
          >
            <CalendarDays className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Views */}
      {view === "calendar" ? (
        <ExamCalendar milestones={filtered} />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming · {upcoming.length}
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No upcoming milestones
                {filter !== "all" ? ` for ${examConfigs.find(e => e.slug === filter)?.name}` : ""}.
              </div>
            ) : (
              upcoming.map((m) => <MilestoneCard key={m.id} milestone={m} />)
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowPast((p) => !p)}
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
              >
                {showPast ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                Past · {past.length}
              </button>
              {showPast && past.map((m) => <MilestoneCard key={m.id} milestone={m} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
