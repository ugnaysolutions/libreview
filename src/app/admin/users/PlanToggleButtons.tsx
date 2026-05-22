"use client";

import { useState, useTransition } from "react";
import { grantPremium, revokePremium } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function PlanToggleButtons({
  userId,
  isPremium,
}: {
  userId: string;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGrant() {
    setError(null);
    startTransition(async () => {
      const result = await grantPremium(userId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleRevoke() {
    setError(null);
    startTransition(async () => {
      const result = await revokePremium(userId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {!isPremium && (
        <button
          onClick={handleGrant}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? "…" : "Grant 30d Premium"}
        </button>
      )}
      {isPremium && (
        <button
          onClick={handleRevoke}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 disabled:opacity-50 transition-colors"
        >
          {pending ? "…" : "Revoke"}
        </button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
