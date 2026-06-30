"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertMilestone } from "@/app/admin/schedule/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";

const MILESTONE_TYPES = [
  { value: "application_open", label: "Application Opens" },
  { value: "application_deadline", label: "Application Deadline" },
  { value: "exam_date", label: "Exam Date" },
  { value: "results_release", label: "Results Release" },
  { value: "enrollment", label: "Enrollment / Confirmation" },
];

type DateMode = "single" | "range" | "multiple";
type DatePrecision = "exact" | "month" | "year";

interface Milestone {
  id: string;
  exam_config_id: string;
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
}

interface Props {
  examConfigId: string;
  examSlug: string;
  milestone?: Milestone;
  onClose: () => void;
}

function detectInitialMode(milestone?: Milestone): DateMode {
  if (!milestone) return "single";
  if (milestone.date_end) return "range";
  if (milestone.extra_dates && milestone.extra_dates.length > 0) return "multiple";
  return "single";
}

// Convert a stored DATE ("YYYY-MM-01") to "YYYY-MM" for <input type="month">
function toMonthInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 7);
}

// Convert a stored DATE to year string for <input type="number">
function toYearInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return String(new Date(iso + "T00:00:00").getFullYear());
}

export function MilestoneForm({ examConfigId, examSlug, milestone, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dateMode, setDateMode] = useState<DateMode>(detectInitialMode(milestone));
  const [datePrecision, setDatePrecision] = useState<DatePrecision>(milestone?.date_precision ?? "exact");
  // Extra dates for "multiple" mode (does not include scheduled_date itself)
  const [extraDates, setExtraDates] = useState<string[]>(
    milestone?.extra_dates ?? [""]
  );

  function addExtraDate() {
    setExtraDates((d) => [...d, ""]);
  }
  function removeExtraDate(i: number) {
    setExtraDates((d) => d.filter((_, idx) => idx !== i));
  }
  function updateExtraDate(i: number, val: string) {
    setExtraDates((d) => d.map((v, idx) => (idx === i ? val : v)));
  }

  // Convert raw input → ISO date string based on precision
  function toISO(raw: string): string {
    if (!raw) return "";
    if (datePrecision === "month") return raw + "-01";        // "2027-05" → "2027-05-01"
    if (datePrecision === "year") return raw + "-01-01";      // "2027" → "2027-01-01"
    return raw;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.set("exam_config_id", examConfigId);
    fd.set("exam_slug", examSlug);
    fd.set("date_precision", datePrecision);

    // Normalise dates from precision-specific inputs
    const rawScheduled = (fd.get("scheduled_date_raw") as string) || "";
    fd.set("scheduled_date", toISO(rawScheduled));
    fd.delete("scheduled_date_raw");

    if (dateMode === "range") {
      const rawEnd = (fd.get("date_end_raw") as string) || "";
      fd.set("date_end", toISO(rawEnd));
      fd.delete("date_end_raw");
      fd.delete("extra_dates");
    } else if (dateMode === "multiple") {
      fd.set("date_end", "");
      fd.delete("date_end_raw");
      // extra_dates_raw[] → normalise each
      const rawExtras = fd.getAll("extra_dates_raw") as string[];
      fd.delete("extra_dates_raw");
      fd.delete("extra_dates");
      rawExtras.filter(Boolean).forEach((d) => fd.append("extra_dates", toISO(d)));
    } else {
      fd.set("date_end", "");
      fd.delete("date_end_raw");
      fd.delete("extra_dates");
      fd.delete("extra_dates_raw");
    }

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
  const modeBtnCls = (active: boolean) =>
    cn(
      "flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors",
      active
        ? "bg-card text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    );

  // Render the right input type for a date field based on precision
  function DateInput({
    name,
    defaultValue,
    required = true,
  }: {
    name: string;
    defaultValue?: string | null;
    required?: boolean;
  }) {
    if (datePrecision === "year") {
      return (
        <input
          type="number"
          name={name}
          required={required}
          defaultValue={defaultValue ? toYearInput(defaultValue) : ""}
          min={2020}
          max={2035}
          placeholder="e.g. 2027"
          className={inputCls}
        />
      );
    }
    if (datePrecision === "month") {
      return (
        <input
          type="month"
          name={name}
          required={required}
          defaultValue={defaultValue ? toMonthInput(defaultValue) : ""}
          className={inputCls}
        />
      );
    }
    return (
      <input
        type="date"
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputCls}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {milestone && <input type="hidden" name="id" value={milestone.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Milestone Type *</label>
          <select
            name="milestone_type"
            defaultValue={milestone?.milestone_type ?? ""}
            required
            className={inputCls}
          >
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
            placeholder="e.g. USTET Exam Day"
            className={inputCls}
          />
        </div>
      </div>

      {/* Date precision toggle */}
      <div className="space-y-3">
        <div>
          <p className={labelCls}>Date precision</p>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {(["exact", "month", "year"] as DatePrecision[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDatePrecision(p)}
                className={modeBtnCls(datePrecision === p)}
              >
                {p === "exact" ? "Exact date" : p === "month" ? "Month only" : "Year only"}
              </button>
            ))}
          </div>
          {datePrecision !== "exact" && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {datePrecision === "month"
                ? "Use when only the month is known (e.g. May 2027)."
                : "Use when only the year is known (e.g. 2027)."}
            </p>
          )}
        </div>

        {/* Date mode toggle */}
        <div>
          <p className={labelCls}>Date type</p>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {(["single", "range", "multiple"] as DateMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDateMode(mode)}
                className={modeBtnCls(dateMode === mode)}
              >
                {mode === "single" ? "Single"
                  : mode === "range" ? "Range"
                  : "Multiple"}
              </button>
            ))}
          </div>
        </div>

        {/* Single */}
        {dateMode === "single" && (
          <div>
            <label className={labelCls}>
              {datePrecision === "year" ? "Year *" : datePrecision === "month" ? "Month *" : "Date *"}
            </label>
            <DateInput name="scheduled_date_raw" defaultValue={milestone?.scheduled_date} />
          </div>
        )}

        {/* Range */}
        {dateMode === "range" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {datePrecision === "year" ? "From Year *" : datePrecision === "month" ? "From Month *" : "Start Date *"}
              </label>
              <DateInput name="scheduled_date_raw" defaultValue={milestone?.scheduled_date} />
            </div>
            <div>
              <label className={labelCls}>
                {datePrecision === "year" ? "To Year *" : datePrecision === "month" ? "To Month *" : "End Date *"}
              </label>
              <DateInput name="date_end_raw" defaultValue={milestone?.date_end} />
            </div>
          </div>
        )}

        {/* Multiple discrete dates */}
        {dateMode === "multiple" && (
          <div className="space-y-2">
            <label className={labelCls}>
              {datePrecision === "year" ? "Years *" : datePrecision === "month" ? "Months *" : "Dates *"}
              {" "}(each entry is a separate option, e.g. different batches)
            </label>
            {/* First = scheduled_date */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12 shrink-0">
                {datePrecision === "year" ? "Year 1" : datePrecision === "month" ? "Month 1" : "Date 1"}
              </span>
              <DateInput name="scheduled_date_raw" defaultValue={milestone?.scheduled_date} />
            </div>
            {/* Extra */}
            {extraDates.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12 shrink-0">
                  {datePrecision === "year" ? `Year ${i + 2}` : datePrecision === "month" ? `Month ${i + 2}` : `Date ${i + 2}`}
                </span>
                {datePrecision === "year" ? (
                  <input
                    type="number"
                    name="extra_dates_raw"
                    required
                    min={2020}
                    max={2035}
                    value={val ? toYearInput(val) : ""}
                    onChange={(e) => updateExtraDate(i, e.target.value)}
                    placeholder="e.g. 2027"
                    className={inputCls}
                  />
                ) : datePrecision === "month" ? (
                  <input
                    type="month"
                    name="extra_dates_raw"
                    required
                    value={val ? toMonthInput(val) : ""}
                    onChange={(e) => updateExtraDate(i, e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type="date"
                    name="extra_dates_raw"
                    required
                    value={val}
                    onChange={(e) => updateExtraDate(i, e.target.value)}
                    className={inputCls}
                  />
                )}
                {extraDates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExtraDate(i)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExtraDate}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another
            </button>
          </div>
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
          placeholder="Optional clarification"
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
