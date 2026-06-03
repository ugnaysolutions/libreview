"use client";

import { Shuffle, Sparkles, RotateCcw, Bookmark, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionSetMode } from "@/lib/constants";

interface ModeOption {
  id: QuestionSetMode;
  label: string;
  icon: React.ElementType;
  desc: string;
}

const ALL_MODES: ModeOption[] = [
  { id: "random",     label: "Random",       icon: Shuffle,    desc: "Any approved questions" },
  { id: "new",        label: "New",           icon: Sparkles,   desc: "Recently added" },
  { id: "wrong",      label: "Review Wrong",  icon: RotateCcw,  desc: "Past incorrect answers" },
  { id: "bookmarked", label: "Bookmarked",    icon: Bookmark,   desc: "Your saved questions" },
  { id: "srs",        label: "Review Due",    icon: Clock,      desc: "Spaced repetition queue" },
];

interface Props {
  modes: QuestionSetMode[];
  onToggle: (mode: QuestionSetMode) => void;
  bookmarkedCount?: number;
  dueCount?: number;
  includeNew?: boolean;
  errorModes?: QuestionSetMode[];
}

export function QuestionSetPicker({
  modes,
  onToggle,
  bookmarkedCount,
  dueCount,
  includeNew = true,
  errorModes = [],
}: Props) {
  const visibleModes = includeNew ? ALL_MODES : ALL_MODES.filter((m) => m.id !== "new");

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Question Set
      </p>
      <div className="grid grid-cols-2 gap-2">
        {visibleModes.map(({ id, label, icon: Icon, desc }) => {
          const isSelected = modes.includes(id);
          const isBookmarked = id === "bookmarked";
          const isSrs = id === "srs";
          const isEmpty =
            (isBookmarked && bookmarkedCount !== undefined && bookmarkedCount === 0) ||
            (isSrs && dueCount !== undefined && dueCount === 0);
          const hasError = (errorModes ?? []).includes(id);
          const badge = isBookmarked && bookmarkedCount !== undefined && bookmarkedCount > 0
            ? bookmarkedCount
            : isSrs && dueCount !== undefined && dueCount > 0
            ? dueCount
            : null;

          return (
            <button
              key={id}
              onClick={() => !isEmpty && onToggle(id)}
              disabled={isEmpty}
              className={cn(
                "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all",
                isSelected && !hasError
                  ? "border-primary bg-primary/5"
                  : hasError
                  ? "border-red-300 bg-red-50"
                  : isEmpty
                  ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  isSelected && !hasError ? "bg-primary/10" : hasError ? "bg-red-100" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    isSelected && !hasError ? "text-primary" : hasError ? "text-red-500" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      isSelected && !hasError ? "text-primary" : hasError ? "text-red-600" : "text-foreground"
                    )}
                  >
                    {label}
                  </p>
                  {badge !== null && (
                    <span className="text-[10px] font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0">
                      {badge}
                    </span>
                  )}
                </div>
                <p className={cn("text-[10px] mt-0.5", hasError ? "text-red-500" : "text-muted-foreground")}>
                  {hasError ? "Not enough questions" : isEmpty ? (isBookmarked ? "None saved" : "None due") : desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {modes.length > 1 && (
        <p className="text-[10px] text-muted-foreground">
          Questions from all selected sets will be combined.
        </p>
      )}
    </div>
  );
}
