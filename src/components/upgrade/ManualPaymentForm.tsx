"use client";

import { useState, useTransition } from "react";
import { PRICING } from "@/lib/constants";
import { submitPaymentRequest } from "@/app/actions/paymentRequests";

interface Props {
  plan: "monthly" | "annual";
  onPlanChange: (p: "monthly" | "annual") => void;
  hasPendingRequest: boolean;
}

const GCASH_NUMBER = process.env.NEXT_PUBLIC_GCASH_NUMBER ?? "—";
const GCASH_NAME = process.env.NEXT_PUBLIC_GCASH_NAME ?? "—";

export function ManualPaymentForm({ plan, onPlanChange, hasPendingRequest }: Props) {
  const [ref, setRef] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pricing = PRICING[plan];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitPaymentRequest(plan, ref);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center space-y-1">
        <p className="font-semibold text-green-700">Payment request submitted!</p>
        <p className="text-sm text-green-600">
          We'll review your payment and activate your Premium within 24 hours.
        </p>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center space-y-1">
        <p className="font-semibold text-amber-700">Payment under review</p>
        <p className="text-sm text-amber-600">
          You already have a pending payment request. We'll activate your Premium within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Plan selector */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["monthly", "annual"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPlanChange(p)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              plan === p
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            {p === "monthly" ? `Monthly — ${PRICING.monthly.display}` : `Annual — ${PRICING.annual.display}`}
            {p === "annual" && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                Save 16%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* GCash instructions */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
        <p className="font-semibold text-foreground">Pay via GCash</p>
        <div className="space-y-1 text-muted-foreground">
          <p>
            Send <span className="font-semibold text-foreground">{pricing.display}</span> to:
          </p>
          <p>
            GCash number: <span className="font-semibold text-foreground">{GCASH_NUMBER}</span>
          </p>
          <p>
            Account name: <span className="font-semibold text-foreground">{GCASH_NAME}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          In the remarks/message, include your email address so we can match your payment.
        </p>
      </div>

      {/* Coming soon notice */}
      <p className="text-xs text-muted-foreground italic text-center">
        💳 Bank transfer and card payments are on the way — thanks for bearing with us while we get them set up!
      </p>

      {/* Reference number form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="gcash-ref" className="text-sm font-medium text-foreground">
            GCash Reference Number
          </label>
          <input
            id="gcash-ref"
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. 1234567890"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending || !ref.trim()}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting…" : "Submit Payment"}
        </button>
      </form>
    </div>
  );
}
