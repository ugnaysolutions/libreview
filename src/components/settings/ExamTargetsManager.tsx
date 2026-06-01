"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL_EXAMS, type ExamType } from "@/lib/constants";
import { upsertExamTarget, deleteExamTarget } from "@/app/actions/examTargets";

interface ExamTarget {
  id: string;
  exam_type: string;
  exam_date: string;
}

const EXAM_OPTIONS = Object.entries(SCHOOL_EXAMS).map(([key, val]) => ({
  value: key as ExamType,
  label: val.name,
}));

export function ExamTargetsManager({ targets }: { targets: ExamTarget[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  function startEdit(target: ExamTarget) {
    setSelectedType(target.exam_type);
    setExamDate(target.exam_date);
    setEditId(target.id);
  }

  function cancelEdit() {
    setSelectedType("");
    setExamDate("");
    setEditId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType || !examDate) {
      toast.error("Please select an exam and date.");
      return;
    }
    startTransition(async () => {
      const result = await upsertExamTarget(selectedType, examDate);
      if (result.error) {
        toast.error("Failed to save. Please try again.");
      } else {
        toast.success(editId ? "Exam target updated." : "Exam target added.");
        cancelEdit();
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteExamTarget(id);
      if (result.error) {
        toast.error("Failed to delete. Please try again.");
      } else {
        toast.success("Exam target removed.");
        router.refresh();
      }
    });
  }

  const usedTypes = new Set(targets.map((t) => t.exam_type));
  const availableOptions = EXAM_OPTIONS.filter(
    (o) => o.value === selectedType || !usedTypes.has(o.value)
  );

  return (
    <div className="space-y-4" id="exams">
      {/* Existing targets */}
      {targets.length > 0 ? (
        <div className="space-y-2">
          {targets.map((target) => {
            const exam = SCHOOL_EXAMS[target.exam_type as ExamType];
            const label = exam?.name ?? target.exam_type.toUpperCase();
            return (
              <Card key={target.id} className="rounded-xl border-border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(target.exam_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(target)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(target.id)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No exam targets set yet.</p>
      )}

      {/* Add / Edit form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border">
        <p className="text-sm font-semibold text-foreground">
          {editId ? "Edit exam target" : "Add exam target"}
        </p>
        <div className="space-y-1.5">
          <Label>Exam</Label>
          <Select
            value={selectedType}
            onValueChange={(val) => setSelectedType(String(val ?? ""))}
          >
            <SelectTrigger className="rounded-xl">
              <span className={selectedType ? "text-sm" : "text-sm text-muted-foreground"}>
                {selectedType
                  ? (SCHOOL_EXAMS[selectedType as ExamType]?.name ?? selectedType)
                  : "Select exam"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} label={o.label}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Exam date</Label>
          <Input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary text-white hover:bg-[#0F766E]"
            size="sm"
          >
            {isPending ? "Saving…" : editId ? "Save changes" : "Add exam"}
          </Button>
          {editId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
