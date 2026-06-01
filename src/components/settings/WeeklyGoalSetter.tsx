"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setWeeklyGoal } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

const OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export function WeeklyGoalSetter({ current }: { current: number | null }) {
  const [selected, setSelected] = useState<number | null>(current);
  const [saving, setSaving] = useState(false);

  async function handleSelect(val: number | null) {
    if (saving) return;
    const next = val === selected ? null : val;
    setSelected(next);
    setSaving(true);
    const result = await setWeeklyGoal(next);
    setSaving(false);
    if (result.success) {
      toast.success(next ? `Weekly goal set to ${next} session${next > 1 ? "s" : ""}` : "Weekly goal cleared");
    } else {
      toast.error(result.error);
      setSelected(current);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => handleSelect(n)}
            disabled={saving}
            className={cn(
              "h-10 w-10 rounded-xl text-sm font-bold border transition-all",
              selected === n
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/60 hover:text-foreground"
            )}
          >
            {n}
          </button>
        ))}
        {selected !== null && (
          <button
            onClick={() => handleSelect(null)}
            disabled={saving}
            className="h-10 px-3 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/60 transition-all"
          >
            Clear
          </button>
        )}
        {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <p className="text-xs text-muted-foreground">
        {selected
          ? `You want to complete ${selected} practice session${selected > 1 ? "s" : ""} per week.`
          : "No goal set. Tap a number to set your weekly target."}
      </p>
    </div>
  );
}
