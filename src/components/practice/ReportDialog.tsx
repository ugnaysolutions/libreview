"use client";

import { useState } from "react";
import { reportQuestion } from "@/app/actions/practice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportReason } from "@/lib/supabase/types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "wrong_answer_key", label: "Wrong answer key" },
  { value: "typo_or_grammar_error", label: "Typo or grammar error" },
  { value: "confusing_or_unclear", label: "Confusing or unclear" },
  { value: "image_not_loading", label: "Image not loading" },
  { value: "not_relevant_to_upcat", label: "Not relevant to UPCAT" },
  { value: "others", label: "Others" },
];

interface Props {
  questionId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ questionId, open, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose();
      if (!submitting) {
        setTimeout(() => {
          setReason("");
          setNotes("");
          setSubmitted(false);
        }, 300);
      }
    }
  }

  async function handleSubmit() {
    if (!reason || submitting) return;
    setSubmitting(true);
    await reportQuestion(questionId, reason as ReportReason, notes);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setReason("");
        setNotes("");
        setSubmitted(false);
      }, 300);
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Report Question</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Thanks! We&apos;ll review your report shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              {REASONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setReason(value)}
                  className={cn(
                    "w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-colors",
                    reason === value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/40 text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={3}
              className="w-full text-sm rounded-xl border border-border px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            />

            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className={cn(
                buttonVariants(),
                "w-full rounded-xl justify-center",
                (!reason || submitting) && "opacity-50 cursor-not-allowed"
              )}
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
