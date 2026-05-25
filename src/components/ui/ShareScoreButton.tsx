"use client";

import { useState, useTransition } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ShareScoreButton({
  score,
  correct,
  total,
  label,
}: {
  score: number;
  correct: number;
  total: number;
  label: string;
}) {
  const [shared, setShared] = useState(false);
  const [isPending, startTransition] = useTransition();

  const imageUrl = `/api/score-card?score=${score}&correct=${correct}&total=${total}&label=${encodeURIComponent(label)}`;

  function handleShare() {
    startTransition(async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "libreviewph-score.png", {
          type: "image/png",
        });

        if (
          typeof navigator !== "undefined" &&
          navigator.share &&
          navigator.canShare?.({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: `I scored ${score}% on LibreviewPH!`,
            text: `${label} · ${correct}/${total} correct\nPractice free at libreview.ph`,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "libreviewph-score.png";
          a.click();
          URL.revokeObjectURL(url);
        }

        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // user cancelled or share not available — silent
      }
    });
  }

  return (
    <button
      onClick={handleShare}
      disabled={isPending}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-xl justify-center gap-1.5 w-full"
      )}
    >
      {shared ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Done!
        </>
      ) : isPending ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Generating…
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share Score
        </>
      )}
    </button>
  );
}
