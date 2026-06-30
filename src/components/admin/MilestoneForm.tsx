"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertMilestone } from "@/app/admin/schedule/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const MILESTONE_TYPES = [
  { value: "application_open", label: "Application Opens" },
  { value: "application_deadline", label: "Application Deadline" },
  { value: "exam_date", label: "Exam Date" },
  { value: "results_release", label: "Results Release" },
  { value: "enrollment", label: "Enrollment / Confirmation" },
];

interface Milestone {
  id: string;
  exam_config_id: string;
  milestone_type: string;
  milestone_label: string;
  scheduled_date: string;
  date_end: string | null;
  academic_year: string;
  notes: string | null;
  is_confirmed: boolean;
  source_url: string | null;
}

interface Props {
  examConfigId: string;
  examSlug: string;
  milestone?: Milestone;
  onClose: () => void;
}

export function MilestoneForm({ examConfigId, examSlug, milestone, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasRange, setHasRange] = useState(!!milestone?.date_end);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("exam_config_id", examConfigId);
    fd.set("exam_slug", examSlug);
    // Clear date_end if range toggle was disabled
    if (!hasRange) fd.set("date_end", "");
    const result = await upsertMilestone(fd);
    setLoading(false);
    if (result.success) {
      toast.success(milestone ? "Milestone updated." : "Milestone added.");
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {milestone && <input type="hidden" name="id" value={milestone.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Milestone Type *</label>
          <select name="milestone_type" defaultValue={milestone?.milestone_type ?? ""} required className={inputCls}>
            <option value="" disabled>Select type</option>
            {MILESTONE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Label *</label>
          <input
            name="milestone_label"
            required
            defaultValue={milestone?.milestone_label ?? ""}
            placeholder="e.g. Application Period"
            className={inputCls}
          />
        </div>
      </div>

      {/* Date row — single date or date range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={labelCls.replace("mb-1", "")}>Date *</span>
          <button
            type="button"
            onClick={() => setHasRange((r) => !r)}
            className="text-xs text-primary font-medium hover:underline"
          >
            {hasRange ? "Use single date" : "Add end date (range)"}
          </button>
        </div>

        {hasRange ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input
                type="date"
                name="scheduled_date"
                required
                defaultValue={milestone?.scheduled_date ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input
                type="date"
                name="date_end"
                required={hasRange}
                defaultValue={milestone?.date_end ?? ""}
                className={inputCls}
              />
            </div>
          </div>
        ) : (
          <input
            type="date"
            name="scheduled_date"
            required
            defaultValue={milestone?.scheduled_date ?? ""}
            className={inputCls}
          />
        )}
      </div>

      <div>
        <label className={labelCls}>Academic Year *</label>
        <input
          name="academic_year"
          required
          defaultValue={milestone?.academic_year ?? "AY 2026-2027"}
          placeholder="AY 2026-2027"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={milestone?.notes ?? ""}
          placeholder="Optional clarification (e.g. 'Batch 1 only', 'Online application only')"
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div>
        <label className={labelCls}>Source URL</label>
        <input
          type="url"
          name="source_url"
          defaultValue={milestone?.source_url ?? ""}
          placeholder="https://university.edu.ph/admissions"
          className={inputCls}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_confirmed"
          name="is_confirmed"
          value="true"
          defaultChecked={milestone?.is_confirmed ?? false}
          className="rounded"
        />
        <input type="hidden" name="is_confirmed" value="false" />
        <label htmlFor="is_confirmed" className="text-sm text-foreground">
          Date(s) confirmed (uncheck if tentative)
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {milestone ? "Save Changes" : "Add Milestone"}
        </button>
      </div>
    </form>
  );
}
