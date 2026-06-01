"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { submitWish } from "@/app/actions/wishlist";

const CATEGORIES = [
  {
    value: "new_university",
    label: "New University",
    emoji: "🏛️",
    hint: "Request a university to be added",
    bg: "bg-indigo-100",
  },
  {
    value: "new_topic",
    label: "New Topic / Subject",
    emoji: "📚",
    hint: "Request expanded subject coverage",
    bg: "bg-teal-100",
  },
  {
    value: "more_questions",
    label: "More Questions",
    emoji: "🎯",
    hint: "More practice for a topic",
    bg: "bg-green-100",
  },
  {
    value: "feature_idea",
    label: "Feature Idea",
    emoji: "💡",
    hint: "Suggest a new app feature",
    bg: "bg-amber-100",
  },
  {
    value: "bug_report",
    label: "Bug Report",
    emoji: "🐛",
    hint: "Something isn't working right",
    bg: "bg-red-100",
  },
  {
    value: "other",
    label: "Other",
    emoji: "💬",
    hint: "Anything else on your mind",
    bg: "bg-slate-100",
  },
];

interface Props {
  wishCount: number;
  premium: boolean;
}

export function WishlistForm({ wishCount, premium }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const atLimit = !premium && wishCount >= 3;

  function resetForm() {
    setSelected(null);
    setTitle("");
    setDescription("");
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !title.trim()) return;
    setSubmitting(true);
    try {
      const result = await submitWish(selected, title, description);
      if (result.limitReached) {
        toast.error("You've reached your free wish limit.");
        return;
      }
      setSubmitted(true);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-primary/10">
          <span className="text-3xl">⭐</span>
        </div>
        <div>
          <p className="font-bold text-lg text-foreground">Wish received!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Thanks for helping us improve Libreview.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
        >
          Make another wish
        </button>
      </div>
    );
  }

  if (atLimit) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-100">
          <Zap className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            You&apos;ve used your 3 free wishes
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Upgrade to Premium for unlimited wishes and help shape Libreview faster.
          </p>
        </div>
        <Link
          href="/upgrade"
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade to Premium
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category grid */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">What kind of wish?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelected(cat.value)}
              className={cn(
                "flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all",
                selected === cat.value
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-white"
              )}
            >
              <span
                className={cn(
                  "shrink-0 h-9 w-9 rounded-xl flex items-center justify-center text-lg",
                  cat.bg
                )}
              >
                {cat.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {cat.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {cat.hint}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form fields — shown after category is picked */}
      {selected && (
        <div className="space-y-4 pt-1 border-t border-border">
          <div className="pt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Your wish</label>
              <span className="text-xs text-muted-foreground">{title.length}/100</span>
            </div>
            <input
              type="text"
              placeholder="Describe what you'd like to see..."
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                More details{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {description.length}/500
              </span>
            </div>
            <textarea
              placeholder="Add any extra context, examples, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full rounded-xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {submitting ? "Sending..." : "Send my wish ✨"}
          </button>
        </div>
      )}
    </form>
  );
}
