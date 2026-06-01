"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  plan: "monthly" | "annual";
  label?: string;
}

export function PayMongoButton({ plan, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/paymongo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const defaultLabel =
    plan === "annual" ? "Get Annual – ₱999/yr" : "Get Monthly – ₱99/mo";

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full rounded-xl font-bold justify-center gap-2",
          loading && "opacity-60 cursor-not-allowed"
        )}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Redirecting…" : (label ?? defaultLabel)}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
