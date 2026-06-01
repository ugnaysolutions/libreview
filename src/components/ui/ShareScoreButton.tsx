"use client";

import { useState, useTransition } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function generateScoreCard(
  score: number,
  correct: number,
  total: number,
  label: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const W = 1200;
    const H = 630;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("No 2d context")); return; }

    const bgColor = score >= 70 ? "#0D9488" : score >= 50 ? "#D97706" : "#DC2626";
    const badge = score >= 70 ? "EXCELLENT" : score >= 50 ? "GOOD" : "KEEP GOING";
    const now = new Date();
    const date = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const PX = 60;
    const PY = 44;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // ── Header ──────────────────────────────────────────────
    ctx.textBaseline = "middle";

    // App name (left)
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("LibreviewPH", PX, PY + 18);

    // Badge pill (right)
    ctx.font = "bold 18px sans-serif";
    const badgeW = ctx.measureText(badge).width + 40;
    const badgeH = 36;
    const badgeX = W - PX - badgeW;
    const badgeY = PY;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 100);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(badge, badgeX + badgeW / 2, badgeY + badgeH / 2);

    // ── Center block ────────────────────────────────────────
    const CY = H / 2 - 10;

    // Score %
    ctx.fillStyle = "white";
    ctx.font = "900 128px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${score}%`, W / 2, CY - 60);

    // correct / total
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "30px sans-serif";
    ctx.fillText(`${correct} out of ${total} correct`, W / 2, CY + 52);

    // label pill
    ctx.font = "24px sans-serif";
    const lblW = ctx.measureText(label).width + 56;
    const lblH = 44;
    const lblX = W / 2 - lblW / 2;
    const lblY = CY + 88;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    drawRoundRect(ctx, lblX, lblY, lblW, lblH, 100);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(label, W / 2, lblY + lblH / 2);

    // ── Footer ──────────────────────────────────────────────
    const footerText = `libreviewPH.com · Free College Entrance Test reviewer · ${date}`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(footerText, W - PX, H - PY);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob returned null"));
    }, "image/png");
  });
}

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

  function handleShare() {
    startTransition(async () => {
      try {
        const blob = await generateScoreCard(score, correct, total, label);
        const file = new File([blob], "libreviewph-score.png", { type: "image/png" });

        if (
          typeof navigator !== "undefined" &&
          navigator.share &&
          navigator.canShare?.({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: `I scored ${score}% on LibreviewPH!`,
            text: `${label} · ${correct}/${total} correct\nPractice free at libreviewPH.com`,
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
        // user cancelled share or canvas unavailable — silent
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
