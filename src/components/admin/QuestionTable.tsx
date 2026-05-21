"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { bulkApproveQuestions, deleteQuestion } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Question {
  id: string;
  question_text: string;
  correct_choice: string;
  difficulty: number;
  status: string;
  created_at: string;
  topic: { name: string; subtest: { name: string } | null } | null;
}

interface Props {
  questions: Question[];
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  draft: "bg-muted text-muted-foreground",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

export function QuestionTable({ questions }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  const allSelected =
    questions.length > 0 && selected.size === questions.length;

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(questions.map((q) => q.id))
    );
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function handleBulkApprove() {
    if (selected.size === 0) return;
    startTransition(async () => {
      const result = await bulkApproveQuestions([...selected]);
      if (result.success) {
        toast.success(`Approved ${selected.size} question(s).`);
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setDeleting(id);
    const result = await deleteQuestion(id);
    setDeleting(null);
    if (result.success) {
      toast.success("Question deleted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (questions.length === 0) {
    return (
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No questions found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-primary"
          />
          <span className="text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : "Select all"}
          </span>
        </label>
        {selected.size > 0 && (
          <button
            onClick={handleBulkApprove}
            disabled={pending}
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-xl gap-1.5",
              pending && "opacity-60 cursor-not-allowed"
            )}
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Approve {selected.size}
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Question cards */}
      {questions.map((q) => (
        <Card
          key={q.id}
          className={cn(
            "rounded-2xl border-border shadow-sm transition-colors",
            selected.has(q.id) && "border-primary/40 bg-primary/5"
          )}
        >
          <CardContent className="p-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={selected.has(q.id)}
              onChange={() => toggleOne(q.id)}
              className="accent-primary mt-1 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {q.question_text}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {q.topic && (
                  <>
                    <span>{q.topic.subtest?.name}</span>
                    <span>·</span>
                    <span>{q.topic.name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{DIFFICULTY_LABEL[q.difficulty] ?? "—"}</span>
                <span>·</span>
                <span>{format(parseISO(q.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  STATUS_COLORS[q.status] ?? "bg-muted text-muted-foreground"
                )}
              >
                {q.status}
              </span>
              <Link
                href={`/admin/questions/${q.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "rounded-lg"
                )}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => handleDelete(q.id)}
                disabled={deleting === q.id}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50",
                  deleting === q.id && "opacity-60 cursor-not-allowed"
                )}
              >
                {deleting === q.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
