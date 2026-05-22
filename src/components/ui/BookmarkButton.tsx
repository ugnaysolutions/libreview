"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BookmarkButton({
  questionId,
  defaultBookmarked,
}: {
  questionId: string;
  defaultBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(defaultBookmarked);
  const [limitReached, setLimitReached] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setLimitReached(false);
    startTransition(async () => {
      const result = await toggleBookmark(questionId);
      if (result.limitReached) {
        setLimitReached(true);
      } else {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this question"}
        className={cn(
          "flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-50",
          bookmarked
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
        <span>{bookmarked ? "Saved" : "Save"}</span>
      </button>
      {limitReached && (
        <p className="text-[10px] text-amber-600 text-right leading-tight">
          Limit reached.{" "}
          <Link href="/upgrade" className="underline font-semibold">
            Upgrade
          </Link>
        </p>
      )}
    </div>
  );
}
